import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TagsManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["admin-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("tags").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      queryClient.invalidateQueries({ queryKey: ["tags-count"] });
      toast.success("Tag criada com sucesso");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar tag");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from("tags").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag atualizada com sucesso");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar tag");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      queryClient.invalidateQueries({ queryKey: ["tags-count"] });
      toast.success("Tag deletada com sucesso");
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deletar tag");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tagData = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
    };

    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, data: tagData });
    } else {
      createMutation.mutate(tagData);
    }
  };

  const openEditModal = (tag: any) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, slug: tag.slug });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTag(null);
    setFormData({ name: "", slug: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    setFormData({ name: "", slug: "" });
  };

  const filteredTags = tags.filter((tag: any) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar tags..."
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
          Nova Tag
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 text-muted-foreground text-sm font-body">
                    Nome
                  </th>
                  <th className="text-left px-6 py-4 text-muted-foreground text-sm font-body hidden sm:table-cell">
                    Slug
                  </th>
                  <th className="text-right px-6 py-4 text-muted-foreground text-sm font-body">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTags.map((tag: any) => (
                  <tr key={tag.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-sm text-sm">
                        {tag.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                      /{tag.slug}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(tag)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        {deleteConfirm === tag.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteMutation.mutate(tag.id)}
                              className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-sm"
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
                          <button
                            onClick={() => setDeleteConfirm(tag.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTags.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              Nenhuma tag encontrada
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-xl text-foreground">
                {editingTag ? "Editar Tag" : "Nova Tag"}
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
                  placeholder="Nome da tag"
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
                  placeholder="slug-da-tag (auto-gerado se vazio)"
                />
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 btn-gold py-2 rounded-sm disabled:opacity-50"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsManagement;
