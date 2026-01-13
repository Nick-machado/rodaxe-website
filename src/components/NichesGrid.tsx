import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NichesGrid = () => {
  // Placeholder - será populado pelo sistema admin externo via banco de dados
  const niches: any[] = [];

  return (
    <section id="niches" className="py-32 bg-card/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.3em] text-primary mb-4 font-medium uppercase">
            Nosso Trabalho
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-4">
            Explore o <span className="text-primary font-medium">Portfólio</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Especializados em captação aérea para o mercado imobiliário.
            Navegue pelos nossos nichos e descubra como valorizamos cada propriedade.
          </p>
        </motion.div>

        {/* CTA para Portfolio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all hover:scale-105"
          >
            Ver Portfolio Completo
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default NichesGrid;
