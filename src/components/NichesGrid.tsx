import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
    <section id="niches" className="py-32 bg-card/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.3em] text-primary mb-4 font-medium uppercase">
            Nosso Trabalho
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-4">
            Explore o <span className="text-primary font-medium">Portfólio</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Especializados em captação aérea para o mercado imobiliário.
            Navegue pelos nossos nichos e descubra como valorizamos cada propriedade.
          </p>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Carregando...
            </motion.div>
          </div>
        ) : niches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-card/50 rounded-2xl border border-border/50"
          >
            <p className="text-muted-foreground text-lg mb-4">
              Nenhum nicho cadastrado ainda.
            </p>
            <p className="text-sm text-muted-foreground/60">
              Acesse o painel administrativo para adicionar nichos.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default NichesGrid;
