import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Activity, DollarSign, ArrowDownCircle, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  type: "acao" | "custo" | "recebimento";
  descricao: string;
  valor?: number;
  data: string;
  data_fim?: string;
}

interface Cliente {
  id: string;
  nome_ou_razao: string;
}

interface Trabalho {
  id: string;
  titulo: string;
  cliente_id: string | null;
}

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acaoForm, setAcaoForm] = useState({
    descricao: "",
    data_inicio: "",
    data_fim: "",
    custo: "",
    cliente_id: "",
    trabalho_id: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events", year, month],
    queryFn: async () => {
      const [acoesRes, custosRes, recebimentosRes] = await Promise.all([
        supabase
          .from("acoes")
          .select("id, descricao, custo, data_inicio, data_fim")
          .gte("data_inicio", startOfMonth.toISOString())
          .lte("data_inicio", endOfMonth.toISOString()),
        supabase
          .from("custos")
          .select("id, descricao, valor, data")
          .gte("data", startOfMonth.toISOString())
          .lte("data", endOfMonth.toISOString()),
        supabase
          .from("recebimentos")
          .select("id, descricao, valor, data")
          .gte("data", startOfMonth.toISOString())
          .lte("data", endOfMonth.toISOString()),
      ]);

      const allEvents: CalendarEvent[] = [];

      (acoesRes.data || []).forEach((a) => {
        allEvents.push({
          id: a.id,
          type: "acao",
          descricao: a.descricao,
          valor: a.custo || undefined,
          data: a.data_inicio,
          data_fim: a.data_fim || undefined,
        });
      });

      (custosRes.data || []).forEach((c) => {
        allEvents.push({
          id: c.id,
          type: "custo",
          descricao: c.descricao || "Custo",
          valor: c.valor,
          data: c.data,
        });
      });

      (recebimentosRes.data || []).forEach((r) => {
        allEvents.push({
          id: r.id,
          type: "recebimento",
          descricao: r.descricao || "Recebimento",
          valor: r.valor,
          data: r.data,
        });
      });

      return allEvents;
    },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome_ou_razao")
        .order("nome_ou_razao");
      if (error) throw error;
      return data as Cliente[];
    },
  });

  const { data: trabalhos = [] } = useQuery({
    queryKey: ["trabalhos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trabalhos")
        .select("id, titulo, cliente_id")
        .order("titulo");
      if (error) throw error;
      return data as Trabalho[];
    },
  });

  const createAcaoMutation = useMutation({
    mutationFn: async (data: typeof acaoForm) => {
      const { error } = await supabase.from("acoes").insert({
        descricao: data.descricao,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim || null,
        custo: data.custo ? parseFloat(data.custo) : null,
        cliente_id: data.cliente_id || null,
        trabalho_id: data.trabalho_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast({ title: "Ação criada com sucesso!" });
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao criar ação", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setAcaoForm({
      descricao: "",
      data_inicio: "",
      data_fim: "",
      custo: "",
      cliente_id: "",
      trabalho_id: "",
    });
    setSelectedDay(null);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const selectedDate = new Date(year, month, day);
    const dateStr = selectedDate.toISOString().split("T")[0];
    setAcaoForm((prev) => ({
      ...prev,
      data_inicio: dateStr,
    }));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acaoForm.descricao || !acaoForm.data_inicio) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    createAcaoMutation.mutate(acaoForm);
  };

  const filteredTrabalhos = acaoForm.cliente_id
    ? trabalhos.filter((t) => t.cliente_id === acaoForm.cliente_id)
    : trabalhos;

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  // Calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDay = (day: number) => {
    return events.filter((e) => {
      const eventDate = new Date(e.data);
      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "acao":
        return <Activity size={10} />;
      case "custo":
        return <DollarSign size={10} />;
      case "recebimento":
        return <ArrowDownCircle size={10} />;
      default:
        return null;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "acao":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "custo":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "recebimento":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

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

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-muted-foreground">Ações</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">Custos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Recebimentos</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-muted/50">
          {weekDays.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-medium text-muted-foreground uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            return (
              <div
                key={index}
                onClick={() => day && handleDayClick(day)}
                className={cn(
                  "min-h-[100px] border-t border-r border-border p-2 cursor-pointer hover:bg-muted/30 transition-colors",
                  index % 7 === 6 && "border-r-0",
                  !day && "bg-muted/20 cursor-default hover:bg-muted/20"
                )}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          isToday(day)
                            ? "w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                            : "text-foreground"
                        )}
                      >
                        {day}
                      </div>
                      <Plus size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border truncate",
                            getEventColor(event.type)
                          )}
                          title={event.descricao}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {getEventIcon(event.type)}
                          <span className="truncate">{event.descricao}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 3} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para criar ação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Ação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={acaoForm.descricao}
                onChange={(e) => setAcaoForm((prev) => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva a ação..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={acaoForm.data_inicio}
                  onChange={(e) => setAcaoForm((prev) => ({ ...prev, data_inicio: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={acaoForm.data_fim}
                  onChange={(e) => setAcaoForm((prev) => ({ ...prev, data_fim: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custo">Custo (R$)</Label>
              <Input
                id="custo"
                type="number"
                step="0.01"
                value={acaoForm.custo}
                onChange={(e) => setAcaoForm((prev) => ({ ...prev, custo: e.target.value }))}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select
                value={acaoForm.cliente_id}
                onValueChange={(value) =>
                  setAcaoForm((prev) => ({ ...prev, cliente_id: value, trabalho_id: "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome_ou_razao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trabalho">Trabalho</Label>
              <Select
                value={acaoForm.trabalho_id}
                onValueChange={(value) => setAcaoForm((prev) => ({ ...prev, trabalho_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um trabalho" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTrabalhos.map((trabalho) => (
                    <SelectItem key={trabalho.id} value={trabalho.id}>
                      {trabalho.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createAcaoMutation.isPending}>
                {createAcaoMutation.isPending ? "Salvando..." : "Criar Ação"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
