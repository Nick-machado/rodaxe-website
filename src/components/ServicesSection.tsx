import { useEffect, useRef, memo, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Camera, Film, Clapperboard, Sparkles, Video } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import logoLight from "@/assets/logo-rodaxe-light.png";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Camera,
    title: "Captação Aérea",
    description: "Imagens aéreas de alta qualidade com drones profissionais para valorizar seus empreendimentos.",
    number: "01",
  },
  {
    icon: Film,
    title: "Produção Audiovisual",
    description: "Vídeos institucionais e promocionais que contam a história do seu negócio de forma impactante.",
    number: "02",
  },
  {
    icon: Clapperboard,
    title: "Edição Profissional",
    description: "Pós-produção de alta qualidade com correção de cor, efeitos visuais e trilha sonora.",
    number: "03",
  },
  {
    icon: Sparkles,
    title: "Motion Graphics",
    description: "Animações e gráficos em movimento para tornar seu conteúdo ainda mais dinâmico.",
    number: "04",
  },
  {
    icon: Video,
    title: "Transmissão ao Vivo",
    description: "Cobertura de eventos em tempo real com qualidade cinematográfica profissional.",
    number: "05",
  },
];

const ServicesSection = memo(() => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Memoize animation configs
  const animationConfig = useMemo(() => ({
    totalCards: services.length,
    totalTransitions: services.length - 1,
    scrollUsed: 80,
  }), []);

  const { totalCards, totalTransitions, scrollUsed } = animationConfig;
  const transitionPercent = scrollUsed / totalTransitions;

  useEffect(() => {
    if (isMobile) return;

    const section = sectionRef.current;
    const container = cardsContainerRef.current;

    if (!section || !container) return;

    const cards = gsap.utils.toArray<HTMLElement>(".service-card");

    // Create context for cleanup
    const ctx = gsap.context(() => {
      // Background parallax removed per request

      // Set initial states
      cards.forEach((card, i) => {
        gsap.set(card, {
          zIndex: totalCards - i,
        });

        if (i > 0) {
          gsap.set(card, {
            scale: 0.85 - (i - 1) * 0.02,
            yPercent: 6 + (i - 1) * 3,
            rotateX: -6,
            opacity: 1,
          });
        }
      });

      // Single ScrollTrigger with onUpdate for all cards instead of multiple timelines
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress * 100;

          cards.forEach((card, i) => {
            const phaseStart = i * transitionPercent;
            const phaseEnd = phaseStart + transitionPercent;

            // EXIT animation
            if (i < totalTransitions) {
              const exitStart = phaseStart;
              const exitEnd = phaseStart + transitionPercent * 0.6;

              if (progress >= exitStart && progress <= exitEnd) {
                const exitProgress = (progress - exitStart) / (exitEnd - exitStart);
                gsap.set(card, {
                  yPercent: -120 * exitProgress,
                  opacity: 1 - exitProgress,
                  scale: 1 - 0.1 * exitProgress,
                  rotateX: 8 * exitProgress,
                });
              } else if (progress > exitEnd) {
                gsap.set(card, {
                  yPercent: -120,
                  opacity: 0,
                  scale: 0.9,
                  rotateX: 8,
                });
              }
            }

            // ENTRY animation
            if (i > 0) {
              const prevPhaseStart = (i - 1) * transitionPercent;
              const entryStart = prevPhaseStart + transitionPercent * 0.4;
              const entryEnd = prevPhaseStart + transitionPercent;

              const initialScale = 0.85 - (i - 1) * 0.02;
              const initialYPercent = 6 + (i - 1) * 3;

              if (progress >= entryStart && progress <= entryEnd) {
                const entryProgress = (progress - entryStart) / (entryEnd - entryStart);
                gsap.set(card, {
                  scale: initialScale + (1 - initialScale) * entryProgress,
                  yPercent: initialYPercent - initialYPercent * entryProgress,
                  rotateX: -6 + 6 * entryProgress,
                });
              } else if (progress > entryEnd && i <= Math.floor(progress / transitionPercent)) {
                gsap.set(card, {
                  scale: 1,
                  yPercent: 0,
                  rotateX: 0,
                });
              }
            }
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, [isMobile, totalCards, totalTransitions, transitionPercent]);

  // Se for mobile, renderizar uma estrutura mais simples
  if (isMobile) {
    return (
      <section id="services" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-primary mb-2 font-medium uppercase">O que fazemos</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">
              Nossos <span className="text-primary font-medium">Serviços</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {services.map((service) => (
              <div
                key={service.number}
                className="w-full rounded-3xl border border-primary/30 p-6 md:p-8 relative overflow-hidden"
                style={{
                  backgroundColor: "rgba(18, 18, 18, 0.85)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }}
              >
                <span className="absolute top-4 left-5 text-primary/50 font-display text-sm font-bold tracking-wider">
                  {service.number}
                </span>
                
                <div className="absolute top-6 right-8 h-6 overflow-hidden flex items-center opacity-15">
                  <img
                    src={logoLight}
                    alt="Rodaxe"
                    className="h-5 w-auto object-cover object-center"
                  />
                </div>

                <div className="flex flex-col items-center pt-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <service.icon size={26} className="text-primary" />
                  </div>
                  
                  <h3 className="font-display text-xl font-medium text-foreground text-center mb-3">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-center text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-primary/20 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-primary/20 rounded-bl-lg" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="services"
      style={{ height: "500vh" }}
    >
      {/* Background parallax text removed */}

      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Section header */}
        <div className="absolute top-20 md:top-24 left-0 right-0 text-center z-20">
          <p className="text-xs tracking-[0.3em] text-primary mb-2 font-medium uppercase">
            O que fazemos
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">
            Nossos <span className="text-primary font-medium">Serviços</span>
          </h2>
        </div>

        {/* Cards container with 3D perspective */}
        <div
          ref={cardsContainerRef}
          className="relative w-[90vw] max-w-[700px] h-[400px] md:h-[450px]"
          style={{ 
            perspective: "1200px",
            perspectiveOrigin: "center center",
          }}
        >
          {services.map((service, index) => (
            <div
              key={service.number}
              className="service-card absolute inset-0 will-change-transform"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "center bottom",
              }}
            >
              {/* Card content */}
              <div
                className="w-full h-full rounded-3xl border border-primary/30 flex flex-col items-center justify-center p-6 md:p-10 relative overflow-hidden"
                style={{
                  backgroundColor: "rgba(18, 18, 18, 0.85)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
              >
                {/* Number */}
                <span className="absolute top-5 left-6 text-primary/50 font-display text-base font-bold tracking-wider">
                  {service.number}
                </span>

                {/* Logo watermark */}
                <div className="absolute top-6 right-8 h-6 md:h-7 overflow-hidden flex items-center opacity-15">
                  <img
                    src={logoLight}
                    alt="Rodaxe"
                    className="h-5 md:h-6 w-auto object-cover object-center"
                  />
                </div>

                {/* Icon */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <service.icon size={28} className="text-primary" />
                </div>

                {/* Title */}
                <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-medium text-foreground text-center mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-center text-sm md:text-base max-w-md leading-relaxed">
                  {service.description}
                </p>

                {/* Decorative elements */}
                <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-primary/20 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-primary/20 rounded-bl-lg" />
                
                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] text-muted-foreground/40 tracking-[0.2em] uppercase">
            Role para explorar
          </span>
          <div className="w-6 h-10 rounded-full border border-muted-foreground/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = "ServicesSection";

export default ServicesSection;
