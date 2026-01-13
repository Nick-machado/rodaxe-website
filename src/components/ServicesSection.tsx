import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Camera, Film, Clapperboard, Sparkles, Video } from "lucide-react";
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

const ServicesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = cardsContainerRef.current;
    const bgText = bgTextRef.current;

    if (!section || !container) return;

    const cards = gsap.utils.toArray<HTMLElement>(".service-card");
    const totalCards = cards.length;
    const totalTransitions = totalCards - 1; // 4 transitions for 5 cards

    // Use only 80% of scroll for transitions, leaving 20% for last card to stay visible
    const scrollUsed = 80;
    const transitionPercent = scrollUsed / totalTransitions; // ~20% per transition

    // Create context for cleanup
    const ctx = gsap.context(() => {
      // Background text parallax
      if (bgText) {
        gsap.to(bgText, {
          xPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Set initial states
      cards.forEach((card, i) => {
        // First card on top with highest z-index
        gsap.set(card, {
          zIndex: totalCards - i,
        });

        // Cards behind the first one start scaled down and offset
        if (i > 0) {
          gsap.set(card, {
            scale: 0.85 - (i - 1) * 0.02,
            yPercent: 6 + (i - 1) * 3,
            rotateX: -6,
            opacity: 1,
          });
        }
      });

      // Create sequential animations for each transition
      cards.forEach((card, i) => {
        // Calculate the start of this card's transition phase
        const phaseStart = i * transitionPercent;
        
        // EXIT animation: Card i exits (first 60% of its phase)
        if (i < totalTransitions) {
          gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: `top+=${phaseStart}% top`,
              end: `top+=${phaseStart + transitionPercent * 0.6}% top`,
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          }).to(card, {
            yPercent: -120,
            opacity: 0,
            scale: 0.9,
            rotateX: 8,
            ease: "power2.in",
          });
        }

        // ENTRY animation: Card i comes to front (last 60% of PREVIOUS phase)
        if (i > 0) {
          const prevPhaseStart = (i - 1) * transitionPercent;
          
          gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: `top+=${prevPhaseStart + transitionPercent * 0.4}% top`,
              end: `top+=${prevPhaseStart + transitionPercent}% top`,
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          }).to(card, {
            scale: 1,
            yPercent: 0,
            rotateX: 0,
            ease: "power2.out",
          });
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      style={{ height: "500vh" }}
    >
      {/* Background parallax text */}
      <div
        ref={bgTextRef}
        className="fixed top-1/2 left-0 -translate-y-1/2 pointer-events-none select-none z-0"
        style={{ transform: "translateX(-15%)" }}
      >
        <h2 className="text-[22vw] font-display font-bold text-foreground/[0.03] tracking-tight whitespace-nowrap">
          SERVIÇOS
        </h2>
      </div>

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
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
              >
                {/* Number */}
                <span className="absolute top-5 left-6 text-primary/50 font-display text-base font-bold tracking-wider">
                  {service.number}
                </span>

                {/* Logo watermark */}
                <div className="absolute top-2 right-2 h-10 md:h-12 overflow-hidden flex items-center opacity-15">
                  <img
                    src={logoLight}
                    alt="Rodaxe"
                    className="h-24 md:h-28 w-auto object-cover object-center -my-6"
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
};

export default ServicesSection;
