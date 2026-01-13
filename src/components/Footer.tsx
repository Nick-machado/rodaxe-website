import { Link } from "react-router-dom";
import { Instagram, Youtube, Mail, Phone } from "lucide-react";


const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl font-bold mb-4 text-foreground">Rodaxe</h3>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Especialistas em captação aérea e produção audiovisual para o mercado imobiliário.
              Transformamos propriedades em experiências visuais memoráveis.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-foreground">Links</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Home
              </Link>
              <Link to="/#niches" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Portfólio
              </Link>
              <Link to="/contato" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Contato
              </Link>
            </nav>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-foreground">Contato</h4>
            <div className="space-y-3 mb-6">
              <a href="mailto:contato@rodaxe.com.br" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                <Mail size={16} />
                contato@rodaxe.com.br
              </a>
              <a href="tel:+5511999999999" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                <Phone size={16} />
                (11) 99999-9999
              </a>
            </div>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Rodaxe Audiovisual. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
