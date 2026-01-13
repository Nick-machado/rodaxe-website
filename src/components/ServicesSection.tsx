import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Camera, Film, Clapperboard, Sparkles, Video } from "lucide-react";

const services = [
  {
    icon: Camera,
    title: "Captação Aérea",
    description: "Imagens aéreas de alta qualidade com drones profissionais para valorizar seus empreendimentos.",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Film,
    title: "Produção Audiovisual",
    description: "Vídeos institucionais e promocionais que contam a história do seu negócio de forma impactante.",
    color: "from-orange-500/20 to-orange-500/5",
  },
  {
    icon: Clapperboard,
    title: "Edição Profissional",
    description: "Pós-produção de alta qualidade com correção de cor, efeitos visuais e trilha sonora.",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    icon: Sparkles,
    title: "Motion Graphics",
    description: "Animações e gráficos em movimento para tornar seu conteúdo ainda mais dinâmico.",
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    icon: Video,
    title: "Transmissão ao Vivo",
    description: "Cobertura de eventos em tempo real com qualidade cinematográfica profissional.",
    color: "from-green-500/20 to-green-500/5",
  },
];

const ServicesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const titleX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section id="services" ref={containerRef} className="relative py-32 bg-background overflow-hidden">
      {/* Large Background Title */}
      <motion.div
        style={{ x: titleX }}
        className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none select-none"
      >
        <h2 className="text-[20vw] font-display font-bold text-foreground/[0.03] tracking-tight whitespace-nowrap">
          SERVIÇOS
        </h2>
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.3em] text-primary mb-4 font-medium uppercase">
            O que fazemos
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
            Nossos <span className="text-primary font-medium">Serviços</span>
          </h2>
        </motion.div>

        {/* Services Cards - Stacked with perspective */}
        <div className="max-w-4xl mx-auto space-y-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative"
            >
              <div className={`bg-gradient-to-r ${service.color} backdrop-blur-sm border border-border/50 rounded-2xl p-8 flex items-center gap-6 transition-all duration-300 hover:border-primary/30`}>
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-card flex items-center justify-center shrink-0 border border-border/50">
                  <service.icon size={28} className="text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-display text-xl md:text-2xl font-medium text-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Index */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-border/50 text-foreground/30 font-display text-lg">
                  0{index + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
