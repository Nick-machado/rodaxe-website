import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateImageFile, sanitizeFileName } from "@/lib/fileValidation";

const NichesManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNiche, setEditingNiche] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: niches = [], isLoading } = useQuery({
    queryKey: ["admin-niches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("niches")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("niches").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-niches"] });
      queryClient.invalidateQueries({ queryKey: ["niches-count"] });
      toast.success("Nicho criado com sucesso");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar nicho");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("niches").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-niches"] });
      toast.success("Nicho atualizado com sucesso");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar nicho");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("niches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-niches"] });
      queryClient.invalidateQueries({ queryKey: ["niches-count"] });
      toast.success("Nicho deletado com sucesso");
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deletar nicho");
    },
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = sanitizeFileName(file.name, "niches");

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Erro ao fazer upload da imagem");
      return null;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate image file
    if (imageFile) {
      const imageValidation = validateImageFile(imageFile);
      if (!imageValidation.valid) {
        toast.error(imageValidation.error);
        return;
      }
    }

    setIsUploading(true);

    let imageUrl = editingNiche?.featured_image_url || null;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const nicheData = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      description: formData.description,
      featured_image_url: imageUrl,
    };

    if (editingNiche) {
      updateMutation.mutate({ id: editingNiche.id, data: nicheData });
    } else {
      createMutation.mutate(nicheData);
    }

    setIsUploading(false);
  };

  const openEditModal = (niche: any) => {
    setEditingNiche(niche);
    setFormData({
      name: niche.name,
      slug: niche.slug,
      description: niche.description || "",
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingNiche(null);
    setFormData({ name: "", slug: "", description: "" });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNiche(null);
    setFormData({ name: "", slug: "", description: "" });
    setImageFile(null);
  };

  const filteredNiches = niches.filter((niche: any) =>
    niche.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Buscar nichos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-sm pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={openCreateModal}
          className="btn-gold px-4 py-2 rounded-sm flex items-center gap-2 text-sm"
        >
          <Plus size={18} />
          Novo Nicho
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNiches.map((niche: any) => (
            <div
              key={niche.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
            >
              {niche.featured_image_url ? (
                <img
                  src={niche.featured_image_url}
                  alt={niche.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">Sem imagem</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display text-lg text-foreground">
                      {niche.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">/{niche.slug}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {niche.description || "Sem descrição"}
                </p>
                <div className="flex items-center gap-2">
                  {deleteConfirm === niche.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteMutation.mutate(niche.id)}
                        className="text-xs bg-destructive text-destructive-foreground px-3 py-1 rounded-sm"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => openEditModal(niche)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(niche.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredNiches.length === 0 && !isLoading && (
        <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-lg">
          Nenhum nicho encontrado
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-xl text-foreground">
                {editingNiche ? "Editar Nicho" : "Novo Nicho"}
              </h2>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-secondary border border-border rounded-sm px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                  placeholder="Nome do nicho"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full bg-secondary border border-border rounded-sm px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                  placeholder="slug-do-nicho (auto-gerado se vazio)"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-sm px-4 py-2 text-foreground focus:outline-none focus:border-primary resize-none"
                  placeholder="Descrição do nicho"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Imagem de Destaque
                </label>
                <div className="flex items-center gap-4">
                  {(editingNiche?.featured_image_url || imageFile) && (
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : editingNiche?.featured_image_url
                      }
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-sm"
                    />
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 justify-center border border-dashed border-border rounded-sm py-4 hover:border-primary transition-colors">
                      <Upload size={18} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {imageFile ? imageFile.name : "Escolher arquivo"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 border border-border rounded-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading || createMutation.isPending || updateMutation.isPending}
                  className="flex-1 btn-gold py-2 rounded-sm disabled:opacity-50"
                >
                  {isUploading ? "Enviando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NichesManagement;
