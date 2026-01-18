import { useEffect, useRef, memo, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from "@/hooks/use-mobile";
import logoLight from "@/assets/logo-rodaxe-light.png";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: "Captação Aérea",
    description: "Imagens aéreas de alta qualidade com drones profissionais para valorizar seus empreendimentos imobiliários.",
    number: "01",
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80",
  },
  {
    title: "Produção Audiovisual",
    description: "Vídeos institucionais e promocionais que contam a história do seu negócio de forma impactante e memorável.",
    number: "02",
    image: "https://images.unsplash.com/photo-1579632652768-6cb9dcf85912?w=800&q=80",
  },
  {
    title: "Edição Profissional",
    description: "Pós-produção de alta qualidade com correção de cor cinematográfica, efeitos visuais e trilha sonora.",
    number: "03",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
  },
  {
    title: "Motion Graphics",
    description: "Animações e gráficos em movimento para tornar seu conteúdo ainda mais dinâmico e profissional.",
    number: "04",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
  },
  {
    title: "Transmissão ao Vivo",
    description: "Cobertura de eventos em tempo real com qualidade cinematográfica profissional e multi-câmeras.",
    number: "05",
    image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80",
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

      // Single ScrollTrigger with onUpdate for all cards
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

  // Mobile layout
  if (isMobile) {
    return (
      <section id="services" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <header className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-primary mb-2 font-medium uppercase">O que fazemos</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">
              Nossos <span className="text-primary font-medium">Serviços</span>
            </h2>
          </header>
          <div className="grid grid-cols-1 gap-6">
            {services.map((service) => (
              <article
                key={service.number}
                className="w-full rounded-3xl border border-primary/30 overflow-hidden relative"
                style={{
                  backgroundColor: "rgba(18, 18, 18, 0.85)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }}
              >
                {/* Service Image */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={service.image}
                    alt={`${service.title} - Serviço de ${service.title.toLowerCase()} da Rodaxe Audiovisual`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={400}
                    height={225}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,18,18,0.95)] via-[rgba(18,18,18,0.5)] to-transparent" />
                  <span className="absolute top-4 left-5 text-primary/70 font-display text-sm font-bold tracking-wider">
                    {service.number}
                  </span>
                  <div className="absolute top-4 right-4 h-6 overflow-hidden flex items-center opacity-20">
                    <img
                      src={logoLight}
                      alt=""
                      className="h-5 w-auto object-cover object-center"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-display text-xl font-medium text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </article>
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
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col items-center overflow-hidden pt-20 md:pt-24">
        {/* Section header */}
        <header className="text-center mb-8 md:mb-10 flex-shrink-0">
          <p className="text-xs tracking-[0.3em] text-primary mb-2 font-medium uppercase">
            O que fazemos
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">
            Nossos <span className="text-primary font-medium">Serviços</span>
          </h2>
        </header>

        {/* Cards container with 3D perspective */}
        <div
          ref={cardsContainerRef}
          className="relative w-[90vw] max-w-[700px] h-[360px] md:h-[420px] flex-shrink-0"
          style={{ 
            perspective: "1200px",
            perspectiveOrigin: "center center",
          }}
        >
          {services.map((service, index) => (
            <article
              key={service.number}
              className="service-card absolute inset-0 will-change-transform"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "center bottom",
              }}
            >
              {/* Card content */}
              <div
                className="w-full h-full rounded-3xl border border-primary/30 flex flex-col overflow-hidden relative"
                style={{
                  backgroundColor: "rgba(18, 18, 18, 0.85)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
              >
                {/* Service Image */}
                <div className="absolute inset-0">
                  <img
                    src={service.image}
                    alt={`${service.title} - Serviço de ${service.title.toLowerCase()} da Rodaxe Audiovisual`}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    width={700}
                    height={450}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,18,18,0.98)] via-[rgba(18,18,18,0.7)] to-[rgba(18,18,18,0.3)]" />
                </div>

                {/* Content overlay */}
                <div className="relative z-10 flex flex-col items-center justify-end h-full p-6 md:p-10 pb-12">
                  {/* Number */}
                  <span className="absolute top-5 left-6 text-primary/70 font-display text-base font-bold tracking-wider">
                    {service.number}
                  </span>

                  {/* Logo watermark */}
                  <div className="absolute top-6 right-8 h-6 md:h-7 overflow-hidden flex items-center opacity-20">
                    <img
                      src={logoLight}
                      alt=""
                      className="h-5 md:h-6 w-auto object-cover object-center"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-medium text-foreground text-center mb-3">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-center text-sm md:text-base max-w-md leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-primary/20 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-primary/20 rounded-bl-lg" />
                
                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </div>
            </article>
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
