import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, ChevronLeft, ChevronRight, Briefcase, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TrabalhoResumo {
  id: string;
  titulo: string;
  valor_estimado: number | null;
  valor_recebido: number | null;
  status: string;
  cliente_nome: string | null;
}

interface AcaoResumo {
  id: string;
  descricao: string;
  custo: number | null;
  data_inicio: string;
}

const RelatorioPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const startOfMonth = new Date(year, month, 1).toISOString();
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  // Trabalhos do mês (baseado em data_inicio ou criado_em)
  const { data: trabalhosData = [] } = useQuery({
    queryKey: ["relatorio-trabalhos-detalhado", year, month],
    queryFn: async () => {
      const startDate = startOfMonth.split("T")[0];
      const endDate = endOfMonth.split("T")[0];
      
      const { data, error } = await supabase
        .from("trabalhos")
        .select("id, titulo, valor_estimado, valor_recebido, status, data_inicio, criado_em, clientes(nome_ou_razao)");
      if (error) throw error;
      
      // Filtrar localmente por data_inicio (preferencial) ou criado_em
      const filtered = (data || []).filter((t) => {
        const dateToCheck = t.data_inicio || (t.criado_em ? t.criado_em.split("T")[0] : null);
        if (!dateToCheck) return false;
        return dateToCheck >= startDate && dateToCheck <= endDate;
      });
      
      return filtered.map((t) => ({
        ...t,
        cliente_nome: t.clientes?.nome_ou_razao || null,
      })) as TrabalhoResumo[];
    },
  });

  // Ações do mês (custos do calendário)
  const { data: acoesData = [] } = useQuery({
    queryKey: ["relatorio-acoes-detalhado", year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acoes")
        .select("id, descricao, custo, data_inicio")
        .gte("data_inicio", startOfMonth)
        .lte("data_inicio", endOfMonth)
        .order("data_inicio", { ascending: true });
      if (error) throw error;
      return data as AcaoResumo[];
    },
  });

  const { data: recebimentosPagos = 0 } = useQuery({
    queryKey: ["relatorio-recebimentos", year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recebimentos")
        .select("valor")
        .eq("status", "pago")
        .gte("data", startOfMonth)
        .lte("data", endOfMonth);
      if (error) throw error;
      return data.reduce((sum, r) => sum + (r.valor || 0), 0);
    },
  });

  const { data: custosTotais = 0 } = useQuery({
    queryKey: ["relatorio-custos", year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custos")
        .select("valor")
        .gte("data", startOfMonth)
        .lte("data", endOfMonth);
      if (error) throw error;
      return data.reduce((sum, c) => sum + (c.valor || 0), 0);
    },
  });

  // Cálculos
  const trabalhosCount = trabalhosData.length;
  const totalValorRecebidoTrabalhos = trabalhosData.reduce((sum, t) => sum + (t.valor_recebido || 0), 0);
  const totalValorEstimadoTrabalhos = trabalhosData.reduce((sum, t) => sum + (t.valor_estimado || 0), 0);
  const trabalhosConcluidosCount = trabalhosData.filter(t => t.status === "concluido").length;
  const custosAcoes = acoesData.reduce((sum, a) => sum + (a.custo || 0), 0);
  
  const totalReceitas = recebimentosPagos + totalValorRecebidoTrabalhos;
  const totalGastos = custosTotais + custosAcoes;
  const liquido = totalReceitas - totalGastos;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Month selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevMonth}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-display text-foreground capitalize min-w-[200px] text-center">
          {monthName}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border rounded-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-sm">
              <Briefcase size={20} className="text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Trabalhos do Mês</span>
          </div>
          <p className="text-3xl font-display text-foreground">{trabalhosCount}</p>
          {trabalhosConcluidosCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{trabalhosConcluidosCount} concluído(s)</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-sm">
              <TrendingUp size={20} className="text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Receitas</span>
          </div>
          <p className="text-3xl font-display text-foreground">{formatCurrency(totalReceitas)}</p>
        </div>

        <div className="bg-card border border-border rounded-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-sm">
              <TrendingDown size={20} className="text-red-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Gastos</span>
          </div>
          <p className="text-3xl font-display text-foreground">{formatCurrency(totalGastos)}</p>
        </div>

        <div className="bg-card border border-border rounded-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-sm ${liquido >= 0 ? "bg-green-500/20" : "bg-red-500/20"}`}>
              <DollarSign size={20} className={liquido >= 0 ? "text-green-500" : "text-red-500"} />
            </div>
            <span className="text-sm text-muted-foreground">Resultado Líquido</span>
          </div>
          <p className={`text-3xl font-display ${liquido >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(liquido)}
          </p>
        </div>
      </div>

      {/* Trabalhos do Mês */}
      <div className="bg-card border border-border rounded-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Briefcase size={20} className="text-primary" />
          <h3 className="font-display text-lg text-foreground">Trabalhos do Mês</h3>
        </div>
        {trabalhosData.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum trabalho registrado neste mês.</p>
        ) : (
          <div className="space-y-3">
            {trabalhosData.map((trabalho) => (
              <div key={trabalho.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{trabalho.titulo}</p>
                  <div className="flex items-center gap-2">
                    {trabalho.cliente_nome && (
                      <span className="text-sm text-muted-foreground">{trabalho.cliente_nome}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-sm ${
                      trabalho.status === 'concluido' ? 'bg-green-500/20 text-green-500' :
                      trabalho.status === 'em_andamento' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {trabalho.status === 'concluido' ? 'Concluído' :
                       trabalho.status === 'em_andamento' ? 'Em andamento' :
                       trabalho.status === 'novo' ? 'Novo' : trabalho.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {trabalho.valor_estimado ? (
                    <p className="font-medium text-foreground">{formatCurrency(trabalho.valor_estimado)}</p>
                  ) : null}
                  {trabalho.valor_recebido && trabalho.valor_recebido > 0 ? (
                    <p className="text-sm text-green-500">
                      Recebido: {formatCurrency(trabalho.valor_recebido)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Não recebido</p>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="font-medium text-foreground">Total Estimado</span>
              <span className="font-medium text-foreground">{formatCurrency(totalValorEstimadoTrabalhos)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Total Recebido</span>
              <span className="font-medium text-green-500">{formatCurrency(totalValorRecebidoTrabalhos)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Ações/Custos do Calendário */}
      <div className="bg-card border border-border rounded-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity size={20} className="text-blue-500" />
          <h3 className="font-display text-lg text-foreground">Ações do Mês (Calendário)</h3>
        </div>
        {acoesData.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma ação registrada neste mês.</p>
        ) : (
          <div className="space-y-3">
            {acoesData.map((acao) => (
              <div key={acao.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{acao.descricao}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(acao.data_inicio)}</p>
                </div>
                <p className={`font-medium ${acao.custo ? "text-red-500" : "text-muted-foreground"}`}>
                  {acao.custo ? `- ${formatCurrency(acao.custo)}` : "-"}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="font-medium text-foreground">Total Custos de Ações</span>
              <span className="font-medium text-red-500">- {formatCurrency(custosAcoes)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Resumo Detalhado */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border border-border rounded-sm p-6">
          <h3 className="font-display text-lg text-foreground mb-4">Detalhamento de Receitas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Recebimentos (tabela)</span>
              <span className="font-medium text-foreground">{formatCurrency(recebimentosPagos)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Valor Recebido de Trabalhos</span>
              <span className="font-medium text-foreground">{formatCurrency(totalValorRecebidoTrabalhos)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-foreground">Total Receitas</span>
              <span className="font-medium text-green-500">{formatCurrency(totalReceitas)}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-6">
          <h3 className="font-display text-lg text-foreground mb-4">Detalhamento de Gastos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Custos Gerais</span>
              <span className="font-medium text-foreground">{formatCurrency(custosTotais)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Custos de Ações (Calendário)</span>
              <span className="font-medium text-foreground">{formatCurrency(custosAcoes)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-foreground">Total Gastos</span>
              <span className="font-medium text-red-500">{formatCurrency(totalGastos)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Final */}
      <div className="bg-card border border-border rounded-sm p-6">
        <h3 className="font-display text-lg text-foreground mb-4">Resumo do Mês</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Total Receitas</span>
            <span className="font-medium text-green-500">+ {formatCurrency(totalReceitas)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Total Despesas</span>
            <span className="font-medium text-red-500">- {formatCurrency(totalGastos)}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="font-medium text-foreground">Resultado Líquido</span>
            <span className={`text-xl font-medium ${liquido >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(liquido)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatorioPage;
