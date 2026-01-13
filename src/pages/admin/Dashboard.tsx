import { useQuery } from "@tanstack/react-query";
import { Video, Folder, Tag, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: videosCount = 0 } = useQuery({
    queryKey: ["videos-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: nichesCount = 0 } = useQuery({
    queryKey: ["niches-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("niches")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: tagsCount = 0 } = useQuery({
    queryKey: ["tags-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("tags")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: recentVideos = [] } = useQuery({
    queryKey: ["recent-videos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("videos")
        .select(`
          *,
          video_niches(
            niches(name)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: niches = [] } = useQuery({
    queryKey: ["niches-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("niches")
        .select("*")
        .order("name");
      return data || [];
    },
  });

  const stats = [
    {
      label: "Total de Vídeos",
      value: videosCount,
      icon: Video,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total de Nichos",
      value: nichesCount,
      icon: Folder,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Total de Tags",
      value: tagsCount,
      icon: Tag,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Visualizações",
      value: "0",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
            <p className="text-3xl font-display text-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-muted-foreground text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Videos */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-xl text-foreground">
            Vídeos Recentes
          </h2>
        </div>
        <div className="divide-y divide-border">
          {recentVideos.length > 0 ? (
            recentVideos.map((video: any) => (
              <div key={video.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
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
                <div className="flex-1 min-w-0">
                  <p className="font-body text-foreground truncate">{video.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {video.video_niches?.map((vn: any) => vn.niches?.name).filter(Boolean).join(", ") || "Sem nicho"}
                  </p>
                </div>
                <span className="text-muted-foreground text-sm">
                  {new Date(video.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum vídeo cadastrado ainda
            </div>
          )}
        </div>
      </div>

      {/* Niches */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-xl text-foreground">
            Nichos Cadastrados
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {niches.length > 0 ? (
            niches.map((niche: any) => (
              <div
                key={niche.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {niche.featured_image_url ? (
                  <img
                    src={niche.featured_image_url}
                    alt={niche.name}
                    className="w-12 h-12 object-cover rounded-sm"
                  />
                ) : (
                  <div className="w-12 h-12 bg-muted rounded-sm flex items-center justify-center">
                    <Folder size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-body text-foreground">{niche.name}</p>
                  <p className="text-muted-foreground text-sm">/{niche.slug}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-4">
              Nenhum nicho cadastrado ainda
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
