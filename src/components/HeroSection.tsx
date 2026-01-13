import { ChevronDown, Play } from "lucide-react";
import heroImage from "@/assets/hero-aerial.jpg";

const HeroSection = () => {
  const scrollToNiches = () => {
    document.getElementById("niches")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Rodaxe Audiovisual - Captação Aérea" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-background/40" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <div className="opacity-0 animate-fade-up">
          <p className="cinematic-text text-sm md:text-base text-primary tracking-[0.3em] mb-4 font-medium">
            Captação Aérea & Produção Audiovisual
          </p>
        </div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 opacity-0 animate-fade-up delay-200 max-w-4xl">
          Perspectivas Únicas para o
          <span className="text-primary"> Mercado Imobiliário</span>
        </h1>

        <p className="font-body text-muted-foreground text-lg md:text-xl max-w-2xl mb-10 opacity-0 animate-fade-up delay-300">
          Valorizamos seus empreendimentos com imagens aéreas de alta qualidade.
          Cada frame conta a história do seu imóvel.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-up delay-400">
          <button
            onClick={scrollToNiches}
            className="btn-primary px-8 py-4 rounded font-display font-medium text-sm tracking-wide flex items-center gap-2"
          >
            Explorar Portfólio
          </button>
          <button className="btn-outline px-8 py-4 rounded font-display font-medium text-sm tracking-wide flex items-center gap-2">
            <Play size={16} />
            Ver Showreel
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToNiches}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/50 hover:text-primary transition-colors animate-pulse"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};

export default HeroSection;
