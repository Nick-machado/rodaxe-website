import { motion } from "framer-motion";
import { Award, Users, Camera, Clock } from "lucide-react";
import { memo, useMemo } from "react";

const stats = [
  { icon: Camera, value: "500+", label: "Projetos" },
  { icon: Users, value: "200+", label: "Clientes" },
  { icon: Award, value: "5+", label: "Anos" },
  { icon: Clock, value: "24h", label: "Suporte" },
];

// Memoize animation variants
const contentVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const contentTransition = {
  duration: 0.8,
};

const titleTransition = {
  duration: 0.6,
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
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Content */}
          <motion.div
            variants={contentVariants}
            initial="initial"
            whileInView="animate"
            transition={contentTransition}
            viewport={viewport}
          >
            <p className="text-xs tracking-[0.3em] text-primary mb-4 font-medium uppercase">
              Sobre nós
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6 leading-tight">
              Criamos <span className="text-primary font-medium">experiências</span> visuais memoráveis
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
              Somos especialistas em captação aérea e produção audiovisual para o mercado imobiliário. 
              Nossa missão é transformar propriedades em experiências visuais que conectam e inspiram.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto">
              Com equipamentos de última geração e uma equipe apaixonada por contar histórias, 
              entregamos conteúdo que valoriza cada detalhe dos seus empreendimentos.
            </p>

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
          </motion.div>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = "AboutSection";

export default AboutSection;
