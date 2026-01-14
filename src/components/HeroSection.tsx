import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-aerial.jpg";
import { memo, useCallback, useMemo } from "react";

// Memoize animation variants
const headlineVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const headlineTransition = {
  duration: 0.8,
  ease: "easeOut",
};

const ctaVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const ctaTransition = {
  duration: 0.8,
  delay: 0.3,
  ease: "easeOut",
};

const showcaseVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const showcaseTransition = {
  duration: 1,
  delay: 0.5,
  ease: "easeOut",
};

const overlayTextVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const overlayTextTransition = {
  delay: 1,
  duration: 0.8,
};

const buttonHoverVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const arrowHoverVariants = {
  hover: { scale: 1.1, rotate: 90 },
  tap: { scale: 0.95 },
};

const HeroSection = memo(() => {
  const scrollToNiches = useCallback(() => {
    document.getElementById("niches")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Decorative curved line in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-10"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M-100 400 Q 400 100 800 400 T 1700 400"
            stroke="currentColor"
            strokeWidth="2"
            className="text-foreground/30"
            fill="none"
          />
          <path
            d="M-100 500 Q 500 200 900 500 T 1800 500"
            stroke="currentColor"
            strokeWidth="1"
            className="text-foreground/20"
            fill="none"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-start pt-32 md:pt-40 px-6">
        {/* Main Headline */}
        <motion.div
          variants={headlineVariants}
          initial="initial"
          animate="animate"
          transition={headlineTransition}
          className="max-w-5xl mb-8 text-center"
        >
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-foreground leading-[1.1] tracking-tight">
            Cria a tua{" "}
            <span className="text-primary font-medium">marca</span>,
            <br />
            Eleva o teu{" "}
            <span className="text-primary font-medium">negócio</span>.
          </h1>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={ctaVariants}
          initial="initial"
          animate="animate"
          transition={ctaTransition}
          className="flex items-center gap-4 mb-12"
        >
          <button
            onClick={scrollToNiches}
            className="bg-foreground/10 backdrop-blur-sm text-foreground px-8 py-4 rounded-full text-sm font-medium tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-foreground/20 border border-foreground/20"
          >
            CONTACTAR
          </button>
          <button
            onClick={scrollToNiches}
            className="w-12 h-12 rounded-full bg-foreground/5 border border-foreground/20 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/10 hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-300"
          >
            <ArrowDown size={18} />
          </button>
        </motion.div>

        {/* Video Showcase Card */}
        <motion.div
          variants={showcaseVariants}
          initial="initial"
          animate="animate"
          transition={showcaseTransition}
          className="w-full max-w-4xl"
        >
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-background/50 group cursor-pointer border border-border/30">
            <img 
              src={heroImage} 
              alt="Rodaxe Audiovisual - Captação Aérea" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Overlay with text */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
            
            {/* Video title overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                variants={overlayTextVariants}
                initial="initial"
                animate="animate"
                transition={overlayTextTransition}
                className="text-center"
              >
                <p className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-foreground/90 italic tracking-wide">
                  Rodaxe
                </p>
                <p className="text-xs md:text-sm tracking-[0.5em] text-foreground/60 uppercase mt-2">
                  Audiovisual
                </p>
              </motion.div>
            </div>

            {/* Play indicator on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[12px] border-l-primary-foreground border-y-[8px] border-y-transparent ml-1" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
