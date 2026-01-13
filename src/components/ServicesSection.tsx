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
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const bgTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    const bgText = bgTextRef.current;

    if (!section || cards.length === 0) return;

    // Create context for cleanup
    const ctx = gsap.context(() => {
      // Background text parallax
      if (bgText) {
        gsap.to(bgText, {
          x: "20%",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Cards animation
      const totalCards = cards.length;
      const scrollPerCard = 100 / totalCards; // percentage of scroll per card

      cards.forEach((card, i) => {
        // Set initial state for cards behind the first one
        if (i > 0) {
          gsap.set(card, {
            scale: 1 - i * 0.05,
            y: i * 40,
            rotateX: -10,
            zIndex: totalCards - i,
          });
        } else {
          gsap.set(card, {
            scale: 1,
            y: 0,
            rotateX: 0,
            zIndex: totalCards,
          });
        }

        // Exit animation for all cards except the last
        if (i < totalCards - 1) {
          gsap.to(card, {
            y: "-100vh",
            opacity: 0,
            scale: 0.8,
            ease: "power1.in",
            scrollTrigger: {
              trigger: section,
              start: `top+=${i * scrollPerCard}% top`,
              end: `top+=${(i + 1) * scrollPerCard}% top`,
              scrub: 1,
            },
          });
        }

        // Entrance animation for cards behind
        if (i > 0) {
          gsap.to(card, {
            scale: 1,
            y: 0,
            rotateX: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: `top+=${(i - 1) * scrollPerCard}% top`,
              end: `top+=${i * scrollPerCard}% top`,
              scrub: 1,
            },
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
      className="relative bg-background"
      style={{ height: "500vh" }}
    >
      {/* Background parallax text */}
      <div
        ref={bgTextRef}
        className="fixed top-1/2 left-0 -translate-y-1/2 pointer-events-none select-none z-0 will-change-transform"
        style={{ transform: "translateX(-10%)" }}
      >
        <h2 className="text-[25vw] font-display font-bold text-foreground/[0.03] tracking-tight whitespace-nowrap">
          SERVIÇOS
        </h2>
      </div>

      {/* Sticky container */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        {/* Section header */}
        <div className="absolute top-24 left-0 right-0 text-center z-10">
          <p className="text-xs tracking-[0.3em] text-primary mb-2 font-medium uppercase">
            O que fazemos
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">
            Nossos <span className="text-primary font-medium">Serviços</span>
          </h2>
        </div>

        {/* Cards stack */}
        <div
          className="relative w-[90vw] max-w-[700px] aspect-[4/3] flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {services.map((service, index) => (
            <div
              key={service.number}
              ref={(el) => (cardsRef.current[index] = el)}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 will-change-transform"
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Card content */}
              <div
                className="w-full h-full rounded-3xl border border-primary/30 flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden"
                style={{
                  backgroundColor: "rgba(20, 20, 20, 0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                {/* Number */}
                <span className="absolute top-6 left-8 text-primary/40 font-display text-lg font-bold">
                  {service.number}
                </span>

                {/* Logo */}
                <img
                  src={logoLight}
                  alt="Rodaxe"
                  className="h-12 w-auto mb-6 opacity-20"
                />

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <service.icon size={32} className="text-primary" />
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl md:text-3xl font-medium text-foreground text-center mb-4">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-center text-sm md:text-base max-w-md leading-relaxed">
                  {service.description}
                </p>

                {/* Decorative corner accents */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-primary/20 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-primary/20 rounded-bl-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground/50 tracking-widest uppercase">
            Role para explorar
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
