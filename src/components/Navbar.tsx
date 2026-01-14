import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { Menu, X, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import logoLight from "@/assets/logo-rodaxe-light.png";

// Memoize navbar animation variants
const navbarVariants = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

const navbarTransition = {
  duration: 0.6,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

const mobileMenuVariants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
};

const mobileMenuTransition = {
  duration: 0.3,
};

const logoHoverVariants = {
  hover: { scale: 1.05 },
};

const logoTransition = {
  duration: 0.3,
};

const Navbar = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      lastScrollY = window.scrollY;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(lastScrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = useMemo(() => [
    { href: "/", label: "HOME" },
    { href: "/portfolio", label: "PORTFÓLIO" },
    { href: "/#services", label: "SERVIÇOS" },
    { href: "/#about", label: "SOBRE" },
  ], []);

  const scrollToContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <motion.nav
      variants={navbarVariants}
      initial="initial"
      animate="animate"
      transition={navbarTransition}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled 
          ? "bg-background/95 backdrop-blur-md py-3 border-b border-border/50" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center h-14 md:h-16 overflow-hidden">
          <motion.img 
            src={logoLight} 
            alt="Rodaxe Audiovisual" 
            className="h-36 md:h-44 w-auto object-cover object-center -my-10"
            variants={logoHoverVariants}
            whileHover="hover"
            transition={logoTransition}
          />
        </Link>

        {/* Desktop Navigation - Centered with pill background */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-1 bg-card/80 backdrop-blur-sm rounded-full px-2 py-2 border border-border/30">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-xs font-medium tracking-widest transition-all duration-300 px-5 py-2 rounded-full",
                  location.pathname === link.href
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={scrollToContact}
          className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-xs font-semibold tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-primary/30"
        >
          FALE CONOSCO
          <ArrowDown size={14} />
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={mobileMenuTransition}
            className="md:hidden bg-card/95 backdrop-blur-md mt-2 mx-4 rounded-2xl p-6 border border-border/50"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "text-sm font-medium tracking-widest transition-colors py-3 px-4 rounded-lg block",
                      location.pathname === link.href
                        ? "text-foreground bg-foreground/10"
                        : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                onClick={() => {
                  closeMobileMenu();
                  scrollToContact();
                }}
                className="mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-xs font-semibold tracking-widest"
              >
                FALE CONOSCO
                <ArrowDown size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
