import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, X, Phone, Mail, MapPin, CheckCircle2, AlertCircle, Building2, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDocument, validateDocument, cleanDocument, getDocumentType, formatPhone, validateEmail, validatePhone, validateAddress, formatCEP, validateCEP, fetchAddressByCEP, formatAddressFromViaCEP } from "@/lib/documentValidation";

interface Cliente {
  id: string;
  nome_ou_razao: string;
  documento: string;
  email: string | null;
  telefone: string | null;
  whatsapp: boolean | null;
  endereco: string | null;
  criado_em: string;
}

const ClientesManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nome_ou_razao: "",
    documento: "",
    email: "",
    telefone: "",
    whatsapp: false,
    cep: "",
    endereco: "",
  });
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome_ou_razao");
      if (error) throw error;
      return data as Cliente[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("clientes").insert({
        nome_ou_razao: data.nome_ou_razao,
        documento: data.documento,
        email: data.email || null,
        telefone: data.telefone || null,
        whatsapp: data.whatsapp,
        endereco: data.endereco || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente criado com sucesso!");
      closeModal();
    },
    onError: () => toast.error("Erro ao criar cliente"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("clientes")
        .update({
          nome_ou_razao: data.nome_ou_razao,
          documento: data.documento,
          email: data.email || null,
          telefone: data.telefone || null,
          whatsapp: data.whatsapp,
          endereco: data.endereco || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente atualizado com sucesso!");
      closeModal();
    },
    onError: () => toast.error("Erro ao atualizar cliente"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: () => toast.error("Erro ao excluir cliente"),
  });

  const openCreateModal = () => {
    setEditingCliente(null);
    setFormData({
      nome_ou_razao: "",
      documento: "",
      email: "",
      telefone: "",
      whatsapp: false,
      cep: "",
      endereco: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome_ou_razao: cliente.nome_ou_razao,
      documento: cliente.documento,
      email: cliente.email || "",
      telefone: cliente.telefone || "",
      whatsapp: cliente.whatsapp || false,
      cep: "",
      endereco: cliente.endereco || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
  };

  // Validação do documento em tempo real
  const documentValidation = useMemo(() => {
    return validateDocument(formData.documento);
  }, [formData.documento]);

  // Validação do e-mail em tempo real (obrigatório)
  const emailValidation = useMemo(() => {
    return validateEmail(formData.email, true);
  }, [formData.email]);

  // Validação do telefone em tempo real (obrigatório)
  const phoneValidation = useMemo(() => {
    return validatePhone(formData.telefone, true);
  }, [formData.telefone]);

  // Validação do endereço em tempo real (obrigatório)
  const addressValidation = useMemo(() => {
    return validateAddress(formData.endereco, true);
  }, [formData.endereco]);

  // Validação do CEP em tempo real (opcional)
  const cepValidation = useMemo(() => {
    return validateCEP(formData.cep);
  }, [formData.cep]);

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value);
    setFormData({ ...formData, documento: formatted });
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  const handleCEPChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setFormData(prev => ({ ...prev, cep: formatted }));
    
    // Busca endereço quando CEP estiver completo
    const validation = validateCEP(formatted);
    if (validation.isComplete) {
      setIsLoadingCEP(true);
      const addressData = await fetchAddressByCEP(formatted);
      setIsLoadingCEP(false);
      
      if (addressData) {
        const fullAddress = formatAddressFromViaCEP(addressData);
        setFormData(prev => ({ ...prev, endereco: fullAddress }));
        toast.success("Endereço encontrado!");
      } else {
        toast.error("CEP não encontrado");
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valida todos os campos obrigatórios
    if (!formData.nome_ou_razao.trim()) {
      toast.error("Nome/Razão Social é obrigatório");
      return;
    }
    
    if (!documentValidation.isValid) {
      toast.error(documentValidation.message);
      return;
    }
    
    if (!emailValidation.isValid) {
      toast.error(emailValidation.message);
      return;
    }
    
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.message);
      return;
    }
    
    if (!addressValidation.isValid) {
      toast.error(addressValidation.message);
      return;
    }
    
    if (editingCliente) {
      updateMutation.mutate({ id: editingCliente.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredClientes = clientes.filter(
    (c) =>
      c.nome_ou_razao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.documento.includes(searchTerm) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Nome/Razão</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Documento</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Contato</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{cliente.nome_ou_razao}</div>
                      {cliente.endereco && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin size={12} />
                          <span className="truncate max-w-[200px]">{cliente.endereco}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {getDocumentType(cliente.documento) === 'cpf' ? (
                          <User size={14} className="text-muted-foreground/70" />
                        ) : (
                          <Building2 size={14} className="text-muted-foreground/70" />
                        )}
                        <span>{cliente.documento}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {cliente.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail size={12} />
                            <span>{cliente.email}</span>
                          </div>
                        )}
                        {cliente.telefone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone size={12} />
                            <span>{cliente.telefone}</span>
                            {cliente.whatsapp && (
                              <span className="text-xs bg-green-500/20 text-green-500 px-1 rounded">WhatsApp</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cliente)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este cliente?")) {
                              deleteMutation.mutate(cliente.id);
                            }
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-sm w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-display text-foreground">
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nome/Razão Social *</label>
                <input
                  type="text"
                  value={formData.nome_ou_razao}
                  onChange={(e) => setFormData({ ...formData, nome_ou_razao: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Documento (CPF/CNPJ) *
                  {formData.documento && (
                    <span className="ml-2 text-xs font-normal">
                      {documentValidation.type === 'cpf' && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <User size={12} /> CPF
                        </span>
                      )}
                      {documentValidation.type === 'cnpj' && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Building2 size={12} /> CNPJ
                        </span>
                      )}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.documento}
                    onChange={handleDocumentoChange}
                    placeholder="Digite CPF ou CNPJ"
                    className={`w-full px-4 py-2 pr-10 bg-background border rounded-sm text-foreground focus:outline-none focus:ring-1 transition-colors ${
                      formData.documento
                        ? documentValidation.isValid
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-amber-500 focus:ring-amber-500'
                        : 'border-border focus:ring-primary'
                    }`}
                    required
                  />
                  {formData.documento && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {documentValidation.isValid ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <AlertCircle size={18} className="text-amber-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.documento && (
                  <p className={`mt-1 text-xs ${documentValidation.isValid ? 'text-green-500' : 'text-amber-500'}`}>
                    {documentValidation.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">E-mail *</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="exemplo@email.com"
                    className={`w-full px-4 py-2 pr-10 bg-background border rounded-sm text-foreground focus:outline-none focus:ring-1 transition-colors ${
                      formData.email
                        ? emailValidation.isValid
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-amber-500 focus:ring-amber-500'
                        : 'border-border focus:ring-primary'
                    }`}
                    required
                  />
                  {formData.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailValidation.isValid ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <AlertCircle size={18} className="text-amber-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.email && emailValidation.message && (
                  <p className={`mt-1 text-xs ${emailValidation.isValid ? 'text-green-500' : 'text-amber-500'}`}>
                    {emailValidation.message}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-1">Telefone *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.telefone}
                      onChange={handleTelefoneChange}
                      placeholder="(XX) XXXXX-XXXX"
                      className={`w-full px-4 py-2 pr-10 bg-background border rounded-sm text-foreground focus:outline-none focus:ring-1 transition-colors ${
                        formData.telefone
                          ? phoneValidation.isValid
                            ? 'border-green-500 focus:ring-green-500'
                            : 'border-amber-500 focus:ring-amber-500'
                          : 'border-border focus:ring-primary'
                      }`}
                      required
                    />
                    {formData.telefone && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {phoneValidation.isValid ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <AlertCircle size={18} className="text-amber-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {formData.telefone && phoneValidation.message && (
                    <p className={`mt-1 text-xs ${phoneValidation.isValid ? 'text-green-500' : 'text-amber-500'}`}>
                      {phoneValidation.message}
                    </p>
                  )}
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">WhatsApp</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">CEP</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={handleCEPChange}
                    placeholder="XXXXX-XXX"
                    className={`w-full px-4 py-2 pr-10 bg-background border rounded-sm text-foreground focus:outline-none focus:ring-1 transition-colors ${
                      formData.cep
                        ? cepValidation.isValid
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-amber-500 focus:ring-amber-500'
                        : 'border-border focus:ring-primary'
                    }`}
                  />
                  {formData.cep && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isLoadingCEP ? (
                        <Loader2 size={18} className="text-muted-foreground animate-spin" />
                      ) : cepValidation.isValid ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <AlertCircle size={18} className="text-amber-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.cep && cepValidation.message && (
                  <p className={`mt-1 text-xs ${cepValidation.isValid ? 'text-green-500' : 'text-amber-500'}`}>
                    {cepValidation.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Endereço *</label>
                <div className="relative">
                  <textarea
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    rows={2}
                    placeholder="Rua, número, bairro, cidade - UF"
                    className={`w-full px-4 py-2 pr-10 bg-background border rounded-sm text-foreground focus:outline-none focus:ring-1 resize-none transition-colors ${
                      formData.endereco
                        ? addressValidation.isValid
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-amber-500 focus:ring-amber-500'
                        : 'border-border focus:ring-primary'
                    }`}
                    required
                  />
                  {formData.endereco && (
                    <div className="absolute right-3 top-3">
                      {addressValidation.isValid ? (
                        <CheckCircle2 size={18} className="text-green-500" />
                      ) : (
                        <AlertCircle size={18} className="text-amber-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.endereco && addressValidation.message && (
                  <p className={`mt-1 text-xs ${addressValidation.isValid ? 'text-green-500' : 'text-amber-500'}`}>
                    {addressValidation.message}
                  </p>
                )}
              </div>
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
    </div>
  );
};

export default ClientesManagement;
