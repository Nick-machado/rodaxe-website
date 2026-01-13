import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import NichesGrid from "@/components/NichesGrid";
import AboutSection from "@/components/AboutSection";
import PartnersMarquee from "@/components/PartnersMarquee";
import ContactSection from "@/components/ContactSection";

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
        <ServicesSection />
        <NichesGrid />
        <AboutSection />
        <PartnersMarquee />
        <ContactSection />
      </div>
    </>
  );
};

export default Index;
