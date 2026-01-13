import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, X, Upload, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateVideoFile, validateImageFile, sanitizeFileName } from "@/lib/fileValidation";

const VideosManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          video_niches(niche_id, niches(id, name)),
          video_tags(tag_id, tags(id, name))
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: niches = [] } = useQuery({
    queryKey: ["all-niches"],
    queryFn: async () => {
      const { data } = await supabase.from("niches").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["all-tags"],
    queryFn: async () => {
      const { data } = await supabase.from("tags").select("id, name").order("name");
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { video: any; niches: string[]; tags: string[] }) => {
      const { data: newVideo, error: videoError } = await supabase
        .from("videos")
        .insert(data.video)
        .select()
        .single();

      if (videoError) throw videoError;

      // Insert niche relations
      if (data.niches.length > 0) {
        const nicheRelations = data.niches.map((nicheId) => ({
          video_id: newVideo.id,
          niche_id: nicheId,
        }));
        await supabase.from("video_niches").insert(nicheRelations);
      }

      // Insert tag relations
      if (data.tags.length > 0) {
        const tagRelations = data.tags.map((tagId) => ({
          video_id: newVideo.id,
          tag_id: tagId,
        }));
        await supabase.from("video_tags").insert(tagRelations);
      }

      return newVideo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos-count"] });
      toast.success("Vídeo criado com sucesso");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar vídeo");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; video: any; niches: string[]; tags: string[] }) => {
      const { error: videoError } = await supabase
        .from("videos")
        .update(data.video)
        .eq("id", data.id);

      if (videoError) throw videoError;

      // Delete existing relations and insert new ones
      await supabase.from("video_niches").delete().eq("video_id", data.id);
      await supabase.from("video_tags").delete().eq("video_id", data.id);

      if (data.niches.length > 0) {
        const nicheRelations = data.niches.map((nicheId) => ({
          video_id: data.id,
          niche_id: nicheId,
        }));
        await supabase.from("video_niches").insert(nicheRelations);
      }

      if (data.tags.length > 0) {
        const tagRelations = data.tags.map((tagId) => ({
          video_id: data.id,
          tag_id: tagId,
        }));
        await supabase.from("video_tags").insert(tagRelations);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      toast.success("Vídeo atualizado com sucesso");
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar vídeo");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["videos-count"] });
      toast.success("Vídeo deletado com sucesso");
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deletar vídeo");
    },
  });

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileName = sanitizeFileName(file.name, folder);

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, file);

    if (uploadError) {
      toast.error(`Erro ao fazer upload: ${uploadError.message}`);
      return null;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVideo && !videoFile) {
      toast.error("Selecione um arquivo de vídeo");
      return;
    }

    // Validate video file
    if (videoFile) {
      const videoValidation = validateVideoFile(videoFile);
      if (!videoValidation.valid) {
        toast.error(videoValidation.error);
        return;
      }
    }

    // Validate thumbnail file
    if (thumbnailFile) {
      const thumbnailValidation = validateImageFile(thumbnailFile);
      if (!thumbnailValidation.valid) {
        toast.error(thumbnailValidation.error);
        return;
      }
    }
    
    setIsUploading(true);

    try {
      let thumbnailUrl = editingVideo?.thumbnail_url || null;
      let videoUrl = editingVideo?.video_url || "";

      if (thumbnailFile) {
        setUploadProgress("Enviando thumbnail...");
        thumbnailUrl = await uploadFile(thumbnailFile, "thumbnails");
      }

      if (videoFile) {
        setUploadProgress("Enviando vídeo... (pode demorar alguns minutos)");
        videoUrl = await uploadFile(videoFile, "videos");
        if (!videoUrl) {
          setIsUploading(false);
          setUploadProgress("");
          return;
        }
      }

      const videoData = {
        title: formData.title,
        description: formData.description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
      };

      if (editingVideo) {
        updateMutation.mutate({
          id: editingVideo.id,
          video: videoData,
          niches: selectedNiches,
          tags: selectedTags,
        });
      } else {
        createMutation.mutate({
          video: videoData,
          niches: selectedNiches,
          tags: selectedTags,
        });
      }
    } catch (error) {
      toast.error("Erro ao processar upload");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const openEditModal = (video: any) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
    });
    setSelectedNiches(video.video_niches?.map((vn: any) => vn.niche_id) || []);
    setSelectedTags(video.video_tags?.map((vt: any) => vt.tag_id) || []);
    setThumbnailFile(null);
    setVideoFile(null);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    setFormData({ title: "", description: "" });
    setSelectedNiches([]);
    setSelectedTags([]);
    setThumbnailFile(null);
    setVideoFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
    setFormData({ title: "", description: "" });
    setSelectedNiches([]);
    setSelectedTags([]);
    setThumbnailFile(null);
    setVideoFile(null);
  };

  const toggleNiche = (nicheId: string) => {
    setSelectedNiches((prev) =>
      prev.includes(nicheId)
        ? prev.filter((id) => id !== nicheId)
        : [...prev, nicheId]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const filteredVideos = videos.filter((video: any) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar vídeos..."
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
          Novo Vídeo
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
                    Vídeo
                  </th>
                  <th className="text-left px-6 py-4 text-muted-foreground text-sm font-body hidden md:table-cell">
                    Nichos
                  </th>
                  <th className="text-left px-6 py-4 text-muted-foreground text-sm font-body hidden lg:table-cell">
                    Tags
                  </th>
                  <th className="text-left px-6 py-4 text-muted-foreground text-sm font-body hidden sm:table-cell">
                    Data
                  </th>
                  <th className="text-right px-6 py-4 text-muted-foreground text-sm font-body">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVideos.map((video: any) => (
                  <tr key={video.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-20 h-12 object-cover rounded-sm"
                          />
                        ) : (
                          <div className="w-20 h-12 bg-muted rounded-sm flex items-center justify-center">
                            <Video size={20} className="text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="text-foreground font-body">{video.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex gap-2 flex-wrap">
                        {video.video_niches?.map((vn: any) => (
                          <span
                            key={vn.niche_id}
                            className="text-xs bg-secondary px-2 py-1 rounded-sm text-muted-foreground"
                          >
                            {vn.niches?.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex gap-2 flex-wrap">
                        {video.video_tags?.map((vt: any) => (
                          <span
                            key={vt.tag_id}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-sm"
                          >
                            {vt.tags?.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm hidden sm:table-cell">
                      {new Date(video.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(video)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        {deleteConfirm === video.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteMutation.mutate(video.id)}
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
                            onClick={() => setDeleteConfirm(video.id)}
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

          {filteredVideos.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              Nenhum vídeo encontrado
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-xl text-foreground">
                {editingVideo ? "Editar Vídeo" : "Novo Vídeo"}
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
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-secondary border border-border rounded-sm px-4 py-2 text-foreground focus:outline-none focus:border-primary"
                  placeholder="Título do vídeo"
                  required
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
                  placeholder="Descrição do vídeo"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Arquivo de Vídeo {!editingVideo && "*"}
                </label>
                <div className="flex items-center gap-4">
                  {editingVideo?.video_url && !videoFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Video size={16} />
                      <span>Vídeo atual mantido</span>
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 justify-center border border-dashed border-border rounded-sm py-4 hover:border-primary transition-colors">
                      <Upload size={18} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {videoFile ? videoFile.name : editingVideo ? "Substituir vídeo" : "Escolher vídeo"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
                {videoFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Tamanho: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Thumbnail
                </label>
                <div className="flex items-center gap-4">
                  {(editingVideo?.thumbnail_url || thumbnailFile) && (
                    <img
                      src={
                        thumbnailFile
                          ? URL.createObjectURL(thumbnailFile)
                          : editingVideo?.thumbnail_url
                      }
                      alt="Preview"
                      className="w-24 h-16 object-cover rounded-sm"
                    />
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 justify-center border border-dashed border-border rounded-sm py-4 hover:border-primary transition-colors">
                      <Upload size={18} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {thumbnailFile ? thumbnailFile.name : "Escolher thumbnail"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setThumbnailFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Nichos
                </label>
                <div className="flex flex-wrap gap-2">
                  {niches.map((niche: any) => (
                    <button
                      key={niche.id}
                      type="button"
                      onClick={() => toggleNiche(niche.id)}
                      className={`px-3 py-1 rounded-sm text-sm transition-colors ${
                        selectedNiches.includes(niche.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {niche.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: any) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-sm text-sm transition-colors ${
                        selectedTags.includes(tag.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {uploadProgress && (
                <div className="bg-secondary rounded-sm p-3 text-center">
                  <p className="text-sm text-muted-foreground">{uploadProgress}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isUploading}
                  className="flex-1 py-2 border border-border rounded-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-50"
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

export default VideosManagement;
