import { memo } from "react";

const partners = [
  { name: "Partner 1", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Partner 2", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Partner 3", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
  { name: "Partner 4", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Partner 5", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { name: "Partner 6", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Logo_of_YouTube_%282015-2017%29.svg" },
  { name: "Partner 7", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
  { name: "Partner 8", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg" },
];

// Memoize individual logo component
const PartnerLogo = memo(({ partner, keyPrefix }: { partner: typeof partners[0]; keyPrefix: string }) => (
  <div
    className="flex-shrink-0 mx-8 md:mx-12"
  >
    <img
      src={partner.logo}
      alt={partner.name}
      className="h-8 md:h-10 w-auto object-contain"
      style={{
        filter: "grayscale(100%) brightness(0.8) invert(1)",
        opacity: 0.7,
      }}
    />
  </div>
));

PartnerLogo.displayName = "PartnerLogo";

const PartnersMarquee = memo(() => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 mb-8">
        <p className="text-xs tracking-[0.3em] text-primary mb-2 font-medium uppercase text-center">
          Parceiros
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-light text-foreground text-center">
          Empresas que <span className="text-primary font-medium">confiam</span> em nós
        </h2>
      </div>

      {/* Marquee container */}
      <div 
        className="logo-marquee relative overflow-hidden mx-4 md:mx-8 rounded-2xl py-8"
        style={{ 
          backgroundColor: "rgb(22, 22, 22)",
          contain: "layout style paint",
        }}
      >
        {/* Left fade gradient */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-24 md:w-32 z-10 pointer-events-none"
          style={{ 
            background: "linear-gradient(to right, rgb(22, 22, 22), transparent)" 
          }}
        />

        {/* Right fade gradient */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-24 md:w-32 z-10 pointer-events-none"
          style={{ 
            background: "linear-gradient(to left, rgb(22, 22, 22), transparent)" 
          }}
        />

        {/* Logo track - duplicated for infinite loop */}
        <div className="logo-track flex items-center will-animate">
          {/* First set of logos */}
          {partners.map((partner, index) => (
            <PartnerLogo key={`first-${index}`} partner={partner} keyPrefix="first" />
          ))}

          {/* Duplicated set for seamless loop */}
          {partners.map((partner, index) => (
            <PartnerLogo key={`second-${index}`} partner={partner} keyPrefix="second" />
          ))}
        </div>
      </div>

      {/* CSS Keyframes via style tag */}
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .logo-track {
          animation: scroll-left 30s linear infinite;
          will-change: transform;
        }

        .logo-marquee:hover .logo-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
});

PartnersMarquee.displayName = "PartnersMarquee";

export default PartnersMarquee;
