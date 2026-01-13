import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroImage from "@/assets/hero-aerial.jpg";

const HeroSection = () => {
  const scrollToNiches = () => {
    document.getElementById("niches")?.scrollIntoView({ behavior: "smooth" });
  };

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
      <div className="relative h-screen flex flex-col items-center justify-center text-center px-6">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mb-8"
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-foreground leading-[1.1] tracking-tight">
            Cria a tua{" "}
            <span className="text-primary font-medium">marca</span>,
            <br />
            Eleva o teu{" "}
            <span className="text-primary font-medium">negócio</span>.
          </h1>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex items-center gap-4"
        >
          <motion.button
            onClick={scrollToNiches}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-foreground/10 backdrop-blur-sm text-foreground px-8 py-4 rounded-full text-sm font-medium tracking-widest transition-all duration-300 hover:bg-foreground/20 border border-foreground/20"
          >
            CONTACTAR
          </motion.button>
          <motion.button
            onClick={scrollToNiches}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full bg-foreground/5 border border-foreground/20 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-all duration-300"
          >
            <ArrowDown size={18} />
          </motion.button>
        </motion.div>

        {/* Video Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6"
        >
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-background/50 group cursor-pointer">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-center"
              >
                <p className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground/90 italic tracking-wide">
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
};

export default HeroSection;
