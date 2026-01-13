import { motion } from "framer-motion";
import { Award, Users, Camera, Clock } from "lucide-react";

const stats = [
  { icon: Camera, value: "500+", label: "Projetos" },
  { icon: Users, value: "200+", label: "Clientes" },
  { icon: Award, value: "5+", label: "Anos" },
  { icon: Clock, value: "24h", label: "Suporte" },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative py-32 bg-card/50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-xs tracking-[0.3em] text-primary mb-4 font-medium uppercase">
              Sobre nós
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6 leading-tight">
              Criamos <span className="text-primary font-medium">experiências</span> visuais memoráveis
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Somos especialistas em captação aérea e produção audiovisual para o mercado imobiliário. 
              Nossa missão é transformar propriedades em experiências visuais que conectam e inspiram.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Com equipamentos de última geração e uma equipe apaixonada por contar histórias, 
              entregamos conteúdo que valoriza cada detalhe dos seus empreendimentos.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <stat.icon size={24} className="text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Decorative Element / Team placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              {/* Main decorative card */}
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-border/50 flex items-center justify-center overflow-hidden">
                {/* Placeholder pattern */}
                <div className="absolute inset-0 opacity-30">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {[...Array(10)].map((_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 10}
                        x2="100"
                        y2={i * 10}
                        stroke="currentColor"
                        strokeWidth="0.2"
                        className="text-foreground/20"
                      />
                    ))}
                  </svg>
                </div>
                
                <div className="text-center p-8">
                  <p className="font-display text-6xl md:text-7xl italic text-foreground/10 mb-4">
                    Founders
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Conheça nossa equipe
                  </p>
                </div>
              </div>

              {/* Floating accent */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/20 blur-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
