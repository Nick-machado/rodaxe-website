import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioShowcase from "@/components/PortfolioShowcase";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  const siteUrl = "https://rodaxemidia.com.br";
  const ogImageUrl = `${siteUrl}/og-image.jpg`;
  
  // JSON-LD Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Rodaxe Audiovisual",
    "alternateName": "Rodaxe Mídia",
    "description": "Especialistas em captação aérea e produção de vídeos para o mercado imobiliário. Transformamos propriedades em experiências visuais memoráveis.",
    "url": siteUrl,
    "logo": `${siteUrl}/og-image.jpg`,
    "image": ogImageUrl,
    "telephone": "+55 (11) 99999-9999",
    "email": "contato@rodaxemidia.com.br",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "São Paulo",
      "addressRegion": "SP",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-23.5505",
      "longitude": "-46.6333"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Brasil"
    },
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://instagram.com/rodaxemidia",
      "https://youtube.com/@rodaxemidia"
    ],
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Captação Aérea",
          "description": "Imagens aéreas de alta qualidade com drones profissionais para valorizar empreendimentos imobiliários."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Produção Audiovisual",
          "description": "Vídeos institucionais e promocionais que contam a história do seu negócio de forma impactante."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Edição Profissional",
          "description": "Pós-produção de alta qualidade com correção de cor cinematográfica e efeitos visuais."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Motion Graphics",
          "description": "Animações e gráficos em movimento para tornar seu conteúdo mais dinâmico."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Transmissão ao Vivo",
          "description": "Cobertura de eventos em tempo real com qualidade cinematográfica profissional."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Rodaxe Audiovisual | Captação Aérea para Mercado Imobiliário</title>
        <meta
          name="description"
          content="Especialistas em captação aérea e produção de vídeos para o mercado imobiliário. Transformamos propriedades em experiências visuais memoráveis que conectam e inspiram. Conheça nosso portfólio."
        />
        <link rel="canonical" href={siteUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Rodaxe Audiovisual | Captação Aérea" />
        <meta property="og:description" content="Especialistas em captação aérea e produção de vídeos para o mercado imobiliário. Transformamos propriedades em experiências visuais memoráveis." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Rodaxe Audiovisual" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rodaxe Audiovisual | Captação Aérea" />
        <meta name="twitter:description" content="Especialistas em captação aérea e produção de vídeos para o mercado imobiliário." />
        <meta name="twitter:image" content={ogImageUrl} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background dark">
        <Navbar />
        <HeroSection />
        <ServicesSection />
        <PortfolioShowcase />
        <AboutSection />
        <ContactSection />
      </div>
    </>
  );
};

export default Index;
