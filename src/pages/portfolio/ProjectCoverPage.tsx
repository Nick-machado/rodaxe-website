import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/logo-rodaxe-light.png";

const ProjectCoverPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Placeholder - será implementado quando as tabelas forem criadas pelo sistema admin
  const project = null;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <p className="text-sm text-muted-foreground/60">
          Os projetos serão adicionados através do sistema administrativo.
        </p>
        <Button onClick={() => navigate("/portfolio")} variant="outline">
          Voltar ao Portfolio
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Projeto | Rodaxe Portfolio</title>
      </Helmet>

      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Projeto será carregado do banco de dados.</p>
      </div>
    </>
  );
};

export default ProjectCoverPage;
