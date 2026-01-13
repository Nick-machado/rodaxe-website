import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NichePage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Placeholder - será implementado quando o sistema admin criar as tabelas
  return (
    <>
      <Helmet>
        <title>Nicho | Rodaxe Audiovisual</title>
        <meta name="description" content="Explore nossos nichos de atuação - Rodaxe Audiovisual" />
      </Helmet>

      <div className="min-h-screen bg-background dark">
        <Navbar />

        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
          <div className="relative text-center px-6 pt-20">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Em Breve
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mb-8">
              Esta página será configurada pelo sistema administrativo.
            </p>
            <Link 
              to="/portfolio" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              Ver Portfolio
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default NichePage;
