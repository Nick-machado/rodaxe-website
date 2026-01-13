import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Image, Upload, GripVertical, X } from "lucide-react";
import { format } from "date-fns";

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  cover_image_url: string;
  project_date: string | null;
  description: string | null;
  is_published: boolean;
  created_at: string;
}

interface PortfolioMedia {
  id: string;
  project_id: string;
  type: string;
  url: string;
  thumbnail_url: string | null;
  title: string | null;
  sort_order: number;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const PortfolioManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    cover_image_url: "",
    project_date: "",
    description: "",
    is_published: true,
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-portfolio-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PortfolioProject[];
    },
  });

  const { data: projectMedia = [] } = useQuery({
    queryKey: ["admin-portfolio-media", selectedProject?.id],
    queryFn: async () => {
      if (!selectedProject?.id) return [];
      const { data, error } = await supabase
        .from("portfolio_media")
        .select("*")
        .eq("project_id", selectedProject.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as PortfolioMedia[];
    },
    enabled: !!selectedProject?.id && isMediaModalOpen,
  });

  const createProject = useMutation({
    mutationFn: async (data: typeof formData) => {
      const slug = generateSlug(data.title);
      const { error } = await supabase.from("portfolio_projects").insert({
        title: data.title,
        slug,
        location: data.location || null,
        cover_image_url: data.cover_image_url,
        project_date: data.project_date || null,
        description: data.description || null,
        is_published: data.is_published,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio-projects"] });
      toast.success("Projeto criado com sucesso!");
      closeModal();
    },
    onError: () => toast.error("Erro ao criar projeto"),
  });

  const updateProject = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { error } = await supabase
        .from("portfolio_projects")
        .update({
          title: data.title,
          location: data.location || null,
          cover_image_url: data.cover_image_url,
          project_date: data.project_date || null,
          description: data.description || null,
          is_published: data.is_published,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio-projects"] });
      toast.success("Projeto atualizado!");
      closeModal();
    },
    onError: () => toast.error("Erro ao atualizar projeto"),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio-projects"] });
      toast.success("Projeto excluído!");
    },
    onError: () => toast.error("Erro ao excluir projeto"),
  });

  const addMedia = useMutation({
    mutationFn: async (mediaData: { project_id: string; url: string; type: string }) => {
      const maxOrder = projectMedia.reduce((max, m) => Math.max(max, m.sort_order), -1);
      const { error } = await supabase.from("portfolio_media").insert({
        ...mediaData,
        sort_order: maxOrder + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio-media"] });
      toast.success("Mídia adicionada!");
    },
    onError: () => toast.error("Erro ao adicionar mídia"),
  });

  const deleteMedia = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio_media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio-media"] });
      toast.success("Mídia removida!");
    },
    onError: () => toast.error("Erro ao remover mídia"),
  });

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `covers/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("portfolio")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, cover_image_url: publicUrl }));
      toast.success("Imagem de capa enviada!");
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleMediaUpload = async (files: FileList) => {
    if (!selectedProject) return;
    setUploadingMedia(true);
    
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop()?.toLowerCase();
        const isVideo = ["mp4", "webm", "mov"].includes(fileExt || "");
        const type = isVideo ? "video" : "image";
        const folder = isVideo ? "videos" : "images";
        const fileName = `${folder}/${selectedProject.id}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("portfolio")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("portfolio")
          .getPublicUrl(fileName);

        await addMedia.mutateAsync({
          project_id: selectedProject.id,
          url: publicUrl,
          type,
        });
      }
    } catch {
      toast.error("Erro ao enviar mídia");
    } finally {
      setUploadingMedia(false);
    }
  };

  const openCreateModal = () => {
    setSelectedProject(null);
    setFormData({
      title: "",
      location: "",
      cover_image_url: "",
      project_date: "",
      description: "",
      is_published: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: PortfolioProject) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      location: project.location || "",
      cover_image_url: project.cover_image_url,
      project_date: project.project_date || "",
      description: project.description || "",
      is_published: project.is_published,
    });
    setIsModalOpen(true);
  };

  const openMediaModal = (project: PortfolioProject) => {
    setSelectedProject(project);
    setIsMediaModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.cover_image_url) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (selectedProject) {
      updateProject.mutate({ ...formData, id: selectedProject.id });
    } else {
      createProject.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Gerencie seus projetos de portfolio</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center">
          <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum projeto criado ainda.</p>
          <Button onClick={openCreateModal} className="mt-4">
            Criar primeiro projeto
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                {!project.is_published && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/90 text-white text-xs rounded">
                    Rascunho
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium truncate">
                  {project.title}
                  {project.location && (
                    <span className="text-muted-foreground"> - {project.location}</span>
                  )}
                </h3>
                {project.project_date && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(project.project_date), "dd/MM/yyyy")}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openMediaModal(project)}
                  >
                    <Image className="w-4 h-4 mr-1" />
                    Mídia
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(project)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteProject.mutate(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? "Editar Projeto" : "Novo Projeto"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Casa de Praia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                placeholder="Ex: Cascais"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_date">Data do Projeto</Label>
              <Input
                id="project_date"
                type="date"
                value={formData.project_date}
                onChange={(e) => setFormData((p) => ({ ...p, project_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Imagem de Capa *</Label>
              {formData.cover_image_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img
                    src={formData.cover_image_url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, cover_image_url: "" }))}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {uploadingCover ? "Enviando..." : "Clique para enviar"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                    disabled={uploadingCover}
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição opcional do projeto"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_published">Publicado</Label>
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, is_published: checked }))
                }
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createProject.isPending || updateProject.isPending}>
                {selectedProject ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Media Modal */}
      <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Mídia - {selectedProject?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload area */}
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {uploadingMedia ? "Enviando..." : "Arraste ou clique para enviar imagens/vídeos"}
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
                disabled={uploadingMedia}
              />
            </label>

            {/* Media grid */}
            {projectMedia.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma mídia adicionada ainda.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {projectMedia.map((item) => (
                  <div key={item.id} className="relative group aspect-square">
                    <img
                      src={item.type === "video" ? item.thumbnail_url || item.url : item.url}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                          ▶
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => deleteMedia.mutate(item.id)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute top-2 left-2 p-1 text-white/70 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioManagement;
