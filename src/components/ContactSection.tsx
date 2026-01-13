import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    setFormData({ name: "", email: "", phone: "", message: "" });
    setIsSubmitting(false);
  };

  const contactInfo = [
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
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Youtube, href: "#", label: "Youtube" },
  ];

  return (
    <section id="contact" className="relative py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Title & Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="font-display text-6xl md:text-7xl lg:text-8xl font-light text-foreground leading-none"
              >
                Let's
              </motion.h2>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-primary italic"
              >
                Talk!
              </motion.h2>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4 mb-12">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={info.label}
                  href={info.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="flex items-center gap-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 transition-all duration-300 hover:border-primary/30 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <info.icon size={20} className="text-primary" />
                  </div>
                  <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                    {info.label}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Nome</label>
                <Input
                  placeholder="Nome..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-card/50 border-border/50 focus:border-primary h-12 rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Telemóvel</label>
                <Input
                  type="tel"
                  placeholder="Telemóvel..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-card/50 border-border/50 focus:border-primary h-12 rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Mensagem</label>
                <Textarea
                  placeholder="Mensagem..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                {isSubmitting ? "Enviando..." : "Começa a tua jornada..."}
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
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
              <p className="text-primary text-sm font-medium mb-4 italic">Segue-nos</p>
              <div className="flex justify-center gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
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
};

export default ContactSection;
