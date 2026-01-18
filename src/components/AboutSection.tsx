import { motion } from "framer-motion";
import { Award, Users, Camera, Clock, Plane, Video, Zap } from "lucide-react";
import { memo, useMemo } from "react";

const stats = [
  { icon: Camera, value: "500+", label: "Projetos Realizados" },
  { icon: Users, value: "200+", label: "Clientes Satisfeitos" },
  { icon: Award, value: "5+", label: "Anos de Experiência" },
  { icon: Clock, value: "24h", label: "Suporte Dedicado" },
];

const highlights = [
  {
    icon: Plane,
    title: "Drones Profissionais",
    description: "Equipamentos de última geração para captação aérea em 4K e 8K."
  },
  {
    icon: Video,
    title: "Edição Cinematográfica",
    description: "Pós-produção profissional com correção de cor e efeitos visuais."
  },
  {
    icon: Zap,
    title: "Entrega Rápida",
    description: "Projetos entregues com agilidade sem comprometer a qualidade."
  },
];

const contentVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const contentTransition = {
  duration: 0.8,
};

const statTransition = (index: number) => ({
  duration: 0.5,
  delay: index * 0.1,
});

const AboutSection = memo(() => {
  const viewport = useMemo(() => ({ once: true }), []);

  return (
    <section id="about" className="relative py-32 bg-card/50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-primary/3 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Main content */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={contentVariants}
            initial="initial"
            whileInView="animate"
            transition={contentTransition}
            viewport={viewport}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-[0.3em] text-primary mb-4 font-medium uppercase">
              Sobre nós
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6 leading-tight">
              Criamos <span className="text-primary font-medium">experiências</span> visuais memoráveis
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-3xl mx-auto">
              Somos especialistas em captação aérea e produção audiovisual para o mercado imobiliário. 
              Nossa missão é transformar propriedades em experiências visuais que conectam e inspiram 
              potenciais compradores.
            </p>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Com equipamentos de última geração e uma equipe apaixonada por contar histórias, 
              entregamos conteúdo que valoriza cada detalhe dos seus empreendimentos, 
              elevando o padrão de apresentação no mercado imobiliário.
            </p>
          </motion.div>

          {/* Highlights Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={viewport}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                viewport={viewport}
                className="bg-card/50 border border-border/30 rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <highlight.icon size={26} className="text-primary" />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground mb-2">
                  {highlight.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {highlight.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={statTransition(index)}
                viewport={viewport}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon size={24} className="text-primary" />
                </div>
                <p className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = "AboutSection";

export default AboutSection;
