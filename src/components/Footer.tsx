// Footer is now integrated into ContactSection
// This file is kept for backwards compatibility with other pages

import { Link } from "react-router-dom";
import { Instagram, Youtube, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/50 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-xl font-bold mb-2 text-foreground">Rodaxe</h3>
            <p className="text-muted-foreground text-sm">
              Captação aérea & produção audiovisual
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <nav className="flex flex-wrap justify-center gap-6">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Home
              </Link>
              <Link to="/#niches" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Portfólio
              </Link>
              <Link to="/#contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Contato
              </Link>
            </nav>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center md:justify-end gap-3"
          >
            <a
              href="#"
              aria-label="Visite nosso Instagram"
              className="w-10 h-10 rounded-full bg-card/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              aria-label="Visite nosso canal no YouTube"
              className="w-10 h-10 rounded-full bg-card/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
            >
              <Youtube size={18} />
            </a>
          </motion.div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-muted-foreground/60 text-sm">
            © {new Date().getFullYear()} Rodaxe Audiovisual. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
