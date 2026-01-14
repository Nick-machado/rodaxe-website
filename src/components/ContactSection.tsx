import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import { useState, memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Memoize animation variants
const containerVariants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
};

const containerTransition = {
  duration: 0.8,
};

const titleVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const titleTransition = {
  duration: 0.6,
};

const socialHoverVariants = {
  hover: { scale: 1.1 },
  tap: { scale: 0.95 },
};

// Memoize ContactInfo component
const ContactInfo = memo(({ icon: Icon, label, href, index }: {
  icon: React.ElementType;
  label: string;
  href: string;
  index: number;
}) => {
  const cardVariants = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  }), []);

  const cardTransition = useMemo(() => ({
    duration: 0.5,
    delay: index * 0.1,
  }), [index]);

  const hoverVariants = useMemo(() => ({
    hover: { scale: 1.02, x: 10 },
  }), []);

  const viewport = useMemo(() => ({ once: true }), []);

  return (
    <motion.a
      href={href}
      variants={cardVariants}
      initial="initial"
      whileInView="animate"
      transition={cardTransition}
      viewport={viewport}
      whileHover={{ scale: 1.02, x: 10 }}
      className="flex items-center gap-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 transition-all duration-300 hover:border-primary/30 group"
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon size={20} className="text-primary" />
      </div>
      <span className="text-foreground/80 group-hover:text-foreground transition-colors">
        {label}
      </span>
    </motion.a>
  );
});

ContactInfo.displayName = "ContactInfo";

const ContactSection = memo(() => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    setFormData({ name: "", email: "", phone: "", message: "" });
    setIsSubmitting(false);
  }, []);

  const handleInputChange = useCallback((field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const contactInfo = useMemo(() => [
    {
      icon: Mail,
      label: "contato@rodaxe.com.br",
      href: "mailto:contato@rodaxe.com.br",
    },
    {
      icon: Phone,
      label: "+55 11 99999-9999",
      href: "tel:+5511999999999",
    },
    {
      icon: MapPin,
      label: "São Paulo, SP - Brasil",
      href: "#",
    },
  ], []);

  const socialLinks = useMemo(() => [
    { icon: Instagram, href: "#", label: "Instagram", ariaLabel: "Visite nosso Instagram" },
    { icon: Facebook, href: "#", label: "Facebook", ariaLabel: "Visite nossa página no Facebook" },
    { icon: Youtube, href: "#", label: "Youtube", ariaLabel: "Visite nosso canal no YouTube" },
  ], []);

  const viewport = useMemo(() => ({ once: true }), []);

  return (
    <section id="contact" className="relative py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Title & Contact Info */}
          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            transition={containerTransition}
            viewport={viewport}
          >
            <div className="mb-12">
              <motion.h2
                variants={titleVariants}
                initial="initial"
                whileInView="animate"
                transition={titleTransition}
                viewport={viewport}
                className="font-display text-6xl md:text-7xl lg:text-8xl font-light text-foreground leading-none"
              >
                Let's
              </motion.h2>
              <motion.h2
                variants={titleVariants}
                initial="initial"
                whileInView="animate"
                transition={{ ...titleTransition, delay: 0.1 }}
                viewport={viewport}
                className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-primary italic"
              >
                Talk!
              </motion.h2>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4 mb-12">
              {contactInfo.map((info, index) => (
                <ContactInfo key={info.label} {...info} index={index} />
              ))}
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            transition={{ ...containerTransition, delay: 0.2 }}
            viewport={viewport}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Nome</label>
                <Input
                  placeholder="Nome..."
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  required
                  className="bg-card/50 border-border/50 focus:border-primary h-12 rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="Email..."
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  required
                  className="bg-card/50 border-border/50 focus:border-primary h-12 rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Telefone</label>
                <Input
                  type="tel"
                  placeholder="Telefone..."
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                  className="bg-card/50 border-border/50 focus:border-primary h-12 rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Mensagem</label>
                <Textarea
                  placeholder="Mensagem..."
                  value={formData.message}
                  onChange={handleInputChange("message")}
                  required
                  rows={5}
                  className="bg-card/50 border-border/50 focus:border-primary rounded-lg resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium tracking-wide rounded-lg transition-all duration-300"
              >
                {isSubmitting ? "Enviando..." : "Comece sua jornada"}
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Footer Links */}
        <motion.div
          variants={titleVariants}
          initial="initial"
          whileInView="animate"
          transition={titleTransition}
          viewport={viewport}
          className="mt-24 pt-12 border-t border-border/50"
        >
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Menu */}
            <div className="text-center md:text-left">
              <p className="text-primary text-sm font-medium mb-4 italic">Menu</p>
              <nav className="flex flex-wrap justify-center md:justify-start gap-4">
                <a href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Home</a>
                <a href="#services" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Serviços</a>
                <a href="#niches" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Portfólio</a>
                <a href="#about" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Sobre</a>
              </nav>
            </div>

            {/* Social */}
            <div className="text-center">
              <p className="text-primary text-sm font-medium mb-4 italic">Siga-nos</p>
              <div className="flex justify-center gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.ariaLabel}
                    variants={socialHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-10 h-10 rounded-full bg-card/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
                  >
                    <social.icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} Rodaxe Audiovisual
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Todos os direitos reservados.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

ContactSection.displayName = "ContactSection";

export default ContactSection;
