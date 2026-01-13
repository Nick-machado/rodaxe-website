import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, X, Upload, FileText, Eye, Link, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type StatusTrabalho = "novo" | "em_andamento" | "aguardando_cliente" | "aguardando_pagamento" | "concluido" | "cancelado";

interface Cliente {
  id: string;
  nome_ou_razao: string;
}

interface Arquivo {
  id: string;
  nome: string;
  url: string;
  tipo: string;
}

interface Trabalho {
  id: string;
  cliente_id: string | null;
  titulo: string;
  descricao: string | null;
  briefing_texto: string | null;
  briefing_anexos: Arquivo[] | null;
  arquivos_finais: Arquivo[] | null;
  status: StatusTrabalho;
  data_inicio: string | null;
  data_entrega_prevista: string | null;
  data_conclusao: string | null;
  valor_estimado: number | null;
  valor_recebido: number | null;
  criado_em: string;
  clientes?: Cliente | null;
}

const STATUS_LABELS: Record<StatusTrabalho, string> = {
  novo: "Novo",
  em_andamento: "Em Andamento",
  aguardando_cliente: "Aguardando Cliente",
  aguardando_pagamento: "Aguardando Pagamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const STATUS_COLORS: Record<StatusTrabalho, string> = {
  novo: "bg-blue-500/20 text-blue-500",
  em_andamento: "bg-yellow-500/20 text-yellow-500",
  aguardando_cliente: "bg-orange-500/20 text-orange-500",
  aguardando_pagamento: "bg-purple-500/20 text-purple-500",
  concluido: "bg-green-500/20 text-green-500",
  cancelado: "bg-red-500/20 text-red-500",
};

const TrabalhosManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusTrabalho | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrabalho, setEditingTrabalho] = useState<Trabalho | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingFinal, setIsUploadingFinal] = useState(false);
  const [showLinkConfirmDialog, setShowLinkConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: "",
    titulo: "",
    descricao: "",
    briefing_texto: "",
    status: "novo" as StatusTrabalho,
    data_inicio: "",
    data_entrega_prevista: "",
    valor_estimado: "",
    valor_recebido: "",
  });
  const [anexos, setAnexos] = useState<Arquivo[]>([]);
  const [arquivosFinais, setArquivosFinais] = useState<Arquivo[]>([]);
  const [currentLink, setCurrentLink] = useState<{ token: string; expira_em: string } | null>(null);
  const [isLoadingLink, setIsLoadingLink] = useState(false);

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("id, nome_ou_razao").order("nome_ou_razao");
      if (error) throw error;
      return data as Cliente[];
    },
  });

  const { data: trabalhos = [], isLoading } = useQuery({
    queryKey: ["trabalhos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trabalhos")
        .select("*, clientes(id, nome_ou_razao)")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return (data || []).map((t) => ({
        ...t,
        briefing_anexos: (t.briefing_anexos as unknown as Arquivo[]) || [],
        arquivos_finais: (t.arquivos_finais as unknown as Arquivo[]) || [],
      })) as Trabalho[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { briefing_anexos: Arquivo[]; arquivos_finais: Arquivo[] }) => {
      const { error } = await supabase.from("trabalhos").insert([{
        cliente_id: data.cliente_id || null,
        titulo: data.titulo,
        descricao: data.descricao || null,
        briefing_texto: data.briefing_texto || null,
        briefing_anexos: JSON.parse(JSON.stringify(data.briefing_anexos)),
        arquivos_finais: JSON.parse(JSON.stringify(data.arquivos_finais)),
        status: data.status,
        data_inicio: data.data_inicio || null,
        data_entrega_prevista: data.data_entrega_prevista || null,
        valor_estimado: data.valor_estimado ? parseFloat(data.valor_estimado) : null,
        valor_recebido: data.valor_recebido ? parseFloat(data.valor_recebido) : 0,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trabalhos"] });
      toast.success("Trabalho criado com sucesso!");
      closeModal();
    },
    onError: () => toast.error("Erro ao criar trabalho"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData & { briefing_anexos: Arquivo[]; arquivos_finais: Arquivo[] } }) => {
      // Buscar trabalho atual para verificar se já tem data_conclusao
      const { data: currentTrabalho } = await supabase
        .from("trabalhos")
        .select("data_conclusao")
        .eq("id", id)
        .single();

      const updateData: Record<string, unknown> = {
        cliente_id: data.cliente_id || null,
        titulo: data.titulo,
        descricao: data.descricao || null,
        briefing_texto: data.briefing_texto || null,
        briefing_anexos: JSON.parse(JSON.stringify(data.briefing_anexos)),
        arquivos_finais: JSON.parse(JSON.stringify(data.arquivos_finais)),
        status: data.status,
        data_inicio: data.data_inicio || null,
        data_entrega_prevista: data.data_entrega_prevista || null,
        valor_estimado: data.valor_estimado ? parseFloat(data.valor_estimado) : null,
        valor_recebido: data.valor_recebido ? parseFloat(data.valor_recebido) : 0,
      };

      // Auto-preencher data_conclusao quando status mudar para concluido e ainda não tiver
      if (data.status === "concluido" && !currentTrabalho?.data_conclusao) {
        updateData.data_conclusao = new Date().toISOString().split("T")[0];
      }

      const { error } = await supabase.from("trabalhos").update(updateData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trabalhos"] });
      toast.success("Trabalho atualizado com sucesso!");
      closeModal();
    },
    onError: () => toast.error("Erro ao atualizar trabalho"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trabalhos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trabalhos"] });
      toast.success("Trabalho excluído com sucesso!");
    },
    onError: () => toast.error("Erro ao excluir trabalho"),
  });

  // File validation constants
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
  ];
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `Tipo de arquivo não permitido: ${file.type}. Use PDF, imagens, documentos Office, ZIP, ou arquivos de mídia.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo permitido: 50MB.`;
    }
    return null;
  };

  const uploadAnexo = async (file: File) => {
    // Validate file before upload
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage.from("briefings").upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store the file path for private bucket - we'll generate signed URLs when needed
      const novoAnexo = {
        id: crypto.randomUUID(),
        nome: file.name,
        url: `briefings/${fileName}`, // Store bucket/path for signed URL generation
        tipo: file.type,
      };

      setAnexos([...anexos, novoAnexo]);
      toast.success("Arquivo anexado com sucesso!");
    } catch {
      toast.error("Erro ao fazer upload do arquivo");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAnexo = (id: string) => {
    setAnexos(anexos.filter((a) => a.id !== id));
  };

  const uploadArquivoFinal = async (file: File) => {
    // Validate file before upload
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploadingFinal(true);
    try {
      const fileName = `finais/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage.from("briefings").upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store the file path for private bucket - edge function handles downloads for public links
      const novoArquivo: Arquivo = {
        id: crypto.randomUUID(),
        nome: file.name,
        url: `briefings/${fileName}`, // Store bucket/path for signed URL generation
        tipo: file.type,
      };

      setArquivosFinais([...arquivosFinais, novoArquivo]);
      toast.success("Arquivo final anexado!");
    } catch {
      toast.error("Erro ao fazer upload do arquivo");
    } finally {
      setIsUploadingFinal(false);
    }
  };

  // Generate signed URL for viewing/downloading files (admin access)
  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    try {
      // Handle both old public URLs and new path format
      let bucket = "briefings";
      let path = filePath;
      
      if (filePath.includes("/storage/v1/object/public/")) {
        // Extract from old public URL format
        const match = filePath.match(/\/storage\/v1\/object\/public\/(.+)/);
        if (match) {
          const fullPath = decodeURIComponent(match[1]);
          const parts = fullPath.split('/');
          bucket = parts[0];
          path = parts.slice(1).join('/');
        }
      } else if (filePath.startsWith("briefings/")) {
        // New format: bucket/path
        path = filePath.substring("briefings/".length);
      }
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600); // 1 hour expiry
      
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return null;
    }
  };

  const handleFileDownload = async (arquivo: Arquivo) => {
    const signedUrl = await getSignedUrl(arquivo.url);
    if (signedUrl) {
      window.open(signedUrl, "_blank");
    } else {
      toast.error("Erro ao gerar link de download");
    }
  };

  const removeArquivoFinal = (id: string) => {
    setArquivosFinais(arquivosFinais.filter((a) => a.id !== id));
  };

  const fetchCurrentLink = async (trabalhoId: string) => {
    setIsLoadingLink(true);
    try {
      const { data, error } = await supabase
        .from("unique_links")
        .select("token, expira_em")
        .eq("alvo_id", trabalhoId)
        .eq("tipo", "trabalho")
        .gt("expira_em", new Date().toISOString())
        .order("criado_em", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setCurrentLink({ token: data.token, expira_em: data.expira_em! });
      } else {
        setCurrentLink(null);
      }
    } catch {
      setCurrentLink(null);
    } finally {
      setIsLoadingLink(false);
    }
  };

  const generateUniqueLink = async () => {
    if (!editingTrabalho) return;
    
    try {
      // Invalidate all existing links for this trabalho
      await supabase
        .from("unique_links")
        .delete()
        .eq("alvo_id", editingTrabalho.id)
        .eq("tipo", "trabalho");

      // Generate new link with 1 week expiration
      const token = crypto.randomUUID();
      const expiraEm = new Date();
      expiraEm.setDate(expiraEm.getDate() + 7);

      const { error } = await supabase.from("unique_links").insert({
        token,
        tipo: "trabalho",
        alvo_id: editingTrabalho.id,
        expira_em: expiraEm.toISOString(),
      });

      if (error) throw error;

      const link = `${window.location.origin}/link/${token}`;
      await navigator.clipboard.writeText(link);
      
      setCurrentLink({ token, expira_em: expiraEm.toISOString() });
      toast.success("Novo link gerado e copiado!");
    } catch {
      toast.error("Erro ao gerar link único");
    }
  };

  const handleGenerateLinkClick = () => {
    setShowLinkConfirmDialog(true);
  };

  const confirmGenerateLink = () => {
    setShowLinkConfirmDialog(false);
    generateUniqueLink();
  };

  const copyCurrentLink = async () => {
    if (!currentLink) return;
    const link = `${window.location.origin}/link/${currentLink.token}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const openCreateModal = () => {
    setEditingTrabalho(null);
    setFormData({
      cliente_id: "",
      titulo: "",
      descricao: "",
      briefing_texto: "",
      status: "novo",
      data_inicio: "",
      data_entrega_prevista: "",
      valor_estimado: "",
      valor_recebido: "",
    });
    setAnexos([]);
    setArquivosFinais([]);
    setIsModalOpen(true);
  };

  const openEditModal = (trabalho: Trabalho) => {
    setEditingTrabalho(trabalho);
    setFormData({
      cliente_id: trabalho.cliente_id || "",
      titulo: trabalho.titulo,
      descricao: trabalho.descricao || "",
      briefing_texto: trabalho.briefing_texto || "",
      status: trabalho.status,
      data_inicio: trabalho.data_inicio || "",
      data_entrega_prevista: trabalho.data_entrega_prevista || "",
      valor_estimado: trabalho.valor_estimado?.toString() || "",
      valor_recebido: trabalho.valor_recebido?.toString() || "",
    });
    setAnexos(trabalho.briefing_anexos || []);
    setArquivosFinais(trabalho.arquivos_finais || []);
    setCurrentLink(null);
    fetchCurrentLink(trabalho.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTrabalho(null);
    setAnexos([]);
    setArquivosFinais([]);
    setCurrentLink(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo) {
      toast.error("Título é obrigatório");
      return;
    }
    const dataWithAnexos = { ...formData, briefing_anexos: anexos, arquivos_finais: arquivosFinais };
    if (editingTrabalho) {
      updateMutation.mutate({ id: editingTrabalho.id, data: dataWithAnexos });
    } else {
      createMutation.mutate(dataWithAnexos);
    }
  };

  const filteredTrabalhos = trabalhos.filter((t) => {
    const titulo = t.titulo ?? '';
    const clienteNome = t.clientes?.nome_ou_razao ?? '';
    const matchesSearch =
      titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clienteNome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar trabalhos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusTrabalho | "")}
            className="px-4 py-2 bg-card border border-border rounded-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          <span>Novo Trabalho</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">Carregando...</div>
        ) : filteredTrabalhos.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">Nenhum trabalho encontrado</div>
        ) : (
          filteredTrabalhos.map((trabalho) => (
            <div key={trabalho.id} className="bg-card border border-border rounded-sm p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-foreground line-clamp-1">{trabalho.titulo}</h3>
                  {trabalho.clientes && (
                    <p className="text-sm text-muted-foreground">{trabalho.clientes.nome_ou_razao}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[trabalho.status]}`}>
                  {STATUS_LABELS[trabalho.status]}
                </span>
              </div>

              {trabalho.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{trabalho.descricao}</p>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <span>{trabalho.data_entrega_prevista ? `Entrega: ${new Date(trabalho.data_entrega_prevista).toLocaleDateString("pt-BR")}` : "Sem prazo"}</span>
                <span className="font-medium text-foreground">{formatCurrency(trabalho.valor_estimado)}</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => openEditModal(trabalho)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Tem certeza que deseja excluir este trabalho?")) {
                      deleteMutation.mutate(trabalho.id);
                    }
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-sm w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-display text-foreground">
                {editingTrabalho ? "Editar Trabalho" : "Novo Trabalho"}
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Cliente</label>
                  <select
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Sem cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome_ou_razao}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusTrabalho })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Data Início</label>
                  <input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Entrega Prevista</label>
                  <input
                    type="date"
                    value={formData.data_entrega_prevista}
                    onChange={(e) => setFormData({ ...formData, data_entrega_prevista: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_estimado}
                    onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Valor Recebido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_recebido}
                    onChange={(e) => setFormData({ ...formData, valor_recebido: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Briefing</label>
                <textarea
                  value={formData.briefing_texto}
                  onChange={(e) => setFormData({ ...formData, briefing_texto: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Descreva o briefing do projeto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Anexos</label>
                <div className="space-y-2">
                  {anexos.map((anexo) => (
                    <div key={anexo.id} className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-sm">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        <span className="text-sm text-foreground truncate max-w-[200px]">{anexo.nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleFileDownload(anexo)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAnexo(anexo.id)}
                          className="p-1 text-muted-foreground hover:text-destructive"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-border rounded-sm cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload size={18} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isUploading ? "Enviando..." : "Adicionar anexo"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadAnexo(file);
                        e.target.value = "";
                      }}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              {/* Arquivos Finais */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Arquivos Finais (para compartilhar)</label>
                <div className="space-y-2">
                  {arquivosFinais.map((arquivo) => (
                    <div key={arquivo.id} className="flex items-center justify-between px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-sm">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-green-500" />
                        <span className="text-sm text-foreground truncate max-w-[200px]">{arquivo.nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleFileDownload(arquivo)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeArquivoFinal(arquivo.id)}
                          className="p-1 text-muted-foreground hover:text-destructive"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-green-500/50 rounded-sm cursor-pointer hover:border-green-500 hover:bg-green-500/5 transition-colors">
                    <Upload size={18} className="text-green-500" />
                    <span className="text-sm text-green-600">
                      {isUploadingFinal ? "Enviando..." : "Adicionar arquivo final"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadArquivoFinal(file);
                        e.target.value = "";
                      }}
                      disabled={isUploadingFinal}
                    />
                  </label>
                </div>
              </div>

              {/* Link Compartilhável */}
              {editingTrabalho && (
                <div className="p-4 bg-muted/30 border border-border rounded-sm">
                  <label className="block text-sm font-medium text-foreground mb-3">Link de Compartilhamento</label>
                  {isLoadingLink ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                  ) : currentLink ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/link/${currentLink.token}`}
                          className="flex-1 px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground"
                        />
                        <button
                          type="button"
                          onClick={copyCurrentLink}
                          className="px-3 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Expira em: {new Date(currentLink.expira_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <button
                          type="button"
                          onClick={handleGenerateLinkClick}
                          className="text-xs text-primary hover:underline"
                        >
                          Gerar novo link
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Nenhum link ativo</p>
                      <button
                        type="button"
                        onClick={handleGenerateLinkClick}
                        className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors text-sm"
                      >
                        <Link size={14} />
                        Gerar Link
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-sm hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showLinkConfirmDialog} onOpenChange={setShowLinkConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar novo link?</AlertDialogTitle>
            <AlertDialogDescription>
              {currentLink 
                ? "Ao gerar um novo link, o link anterior será invalidado e não funcionará mais. O novo link terá validade de 7 dias."
                : "Será gerado um link de compartilhamento com validade de 7 dias. O link será copiado automaticamente para a área de transferência."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGenerateLink}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrabalhosManagement;
