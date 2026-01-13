import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import NichesGrid from "@/components/NichesGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Rodaxe Audiovisual | Captação Aérea para Mercado Imobiliário</title>
        <meta
          name="description"
          content="Especialistas em captação aérea e produção audiovisual para o mercado imobiliário. Valorizamos seus empreendimentos com imagens aéreas de alta qualidade."
        />
      </Helmet>

      <div className="min-h-screen bg-background dark">
        <Navbar />
        <HeroSection />
        <NichesGrid />
        <Footer />
      </div>
    </>
  );
};

export default Index;
