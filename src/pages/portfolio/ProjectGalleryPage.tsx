import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

const ProjectGalleryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Placeholder - será implementado quando as tabelas forem criadas pelo sistema admin
  const project = null;

  if (!project) {
    return (
      <>
        <Helmet>
          <title>Galeria | Rodaxe Portfolio</title>
        </Helmet>

        <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center gap-4">
          <p className="text-white/70">Galeria não encontrada.</p>
          <p className="text-sm text-white/50">
            Os projetos serão adicionados através do sistema administrativo.
          </p>
          <Button
            onClick={() => navigate("/portfolio")}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Voltar ao Portfolio
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Galeria | Rodaxe Portfolio</title>
      </Helmet>

      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <p className="text-white/70">Galeria será carregada do banco de dados.</p>
      </div>
    </>
  );
};

export default ProjectGalleryPage;
