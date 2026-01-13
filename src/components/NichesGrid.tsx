import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NicheCard from "./NicheCard";

const NichesGrid = () => {
  const { data: niches = [], isLoading } = useQuery({
    queryKey: ["public-niches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("niches")
        .select(`
          *,
          video_niches(count)
        `)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="niches" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="cinematic-text text-sm text-primary tracking-[0.3em] mb-4 font-medium">
            Nossos Serviços
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Explore o Portfólio
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Especializados em captação aérea para o mercado imobiliário.
            Navegue pelos nossos nichos e descubra como valorizamos cada propriedade.
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando...
          </div>
        ) : niches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {niches.map((niche: any, index: number) => (
              <NicheCard
                key={niche.id}
                niche={{
                  id: niche.id,
                  name: niche.name,
                  slug: niche.slug,
                  description: niche.description || "",
                  featured_image_url: niche.featured_image_url || "",
                  video_count: niche.video_niches?.[0]?.count || 0,
                }}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground text-lg mb-4">
              Nenhum nicho cadastrado ainda.
            </p>
            <p className="text-sm text-muted-foreground">
              Acesse o painel administrativo para adicionar nichos.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NichesGrid;
