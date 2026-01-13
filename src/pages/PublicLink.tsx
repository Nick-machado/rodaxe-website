import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, Calendar, User, Clock, AlertCircle, Mail, Phone } from "lucide-react";
import logoLight from "@/assets/logo-rodaxe-light.png";
import logoDark from "@/assets/logo-rodaxe-dark.png";

interface Arquivo {
  id: string;
  nome: string;
  url: string;
  tipo: string;
}

interface Trabalho {
  id: string;
  titulo: string;
  descricao: string | null;
  data_conclusao: string | null;
  arquivos_finais: Arquivo[];
  clientes?: { nome_ou_razao: string } | null;
}

const PublicLink = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trabalho, setTrabalho] = useState<Trabalho | null>(null);

  useEffect(() => {
    const resolveLink = async () => {
      if (!token) {
        setError("Token inválido");
        setLoading(false);
        return;
      }

      try {
        // Use edge function to resolve link (bypasses RLS with service role)
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resolve-link?token=${encodeURIComponent(token)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Erro ao carregar o link");
          setLoading(false);
          return;
        }

        // Handle redirect type (briefing)
        if (data.type === "redirect" && data.url) {
          window.location.href = data.url;
          return;
        }

        // Handle trabalho type
        if (data.type === "trabalho" && data.trabalho) {
          setTrabalho(data.trabalho);
        }
      } catch {
        setError("Erro ao carregar o link");
      } finally {
        setLoading(false);
      }
    };

    resolveLink();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex justify-center">
            <img src={logoDark} alt="Rodaxe" className="h-8 dark:hidden" />
            <img src={logoLight} alt="Rodaxe" className="h-8 hidden dark:block" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-display text-foreground mb-3">Link Indisponível</h1>
            <p className="text-muted-foreground mb-8">
              {error === "Este link expirou" 
                ? "Este link de compartilhamento expirou ou foi substituído por um novo."
                : error}
            </p>
            
            <div className="p-6 bg-card border border-border rounded-sm text-left space-y-4">
              <p className="text-sm text-foreground font-medium">
                Para obter um novo link, entre em contato com a Rodaxe:
              </p>
              <div className="space-y-3">
                <a 
                  href="mailto:contato@rodaxe.com.br" 
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail size={18} />
                  contato@rodaxe.com.br
                </a>
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone size={18} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Rodaxe. Todos os direitos reservados.
          </div>
        </footer>
      </div>
    );
  }

  if (!trabalho) {
    return null;
  }

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith("image/")) return "🖼️";
    if (tipo.startsWith("video/")) return "🎬";
    if (tipo.includes("pdf")) return "📄";
    if (tipo.includes("zip") || tipo.includes("rar")) return "📦";
    return "📎";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-display text-foreground mb-2">{trabalho.titulo}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {trabalho.clientes && (
              <span className="flex items-center gap-1">
                <User size={14} />
                {trabalho.clientes.nome_ou_razao}
              </span>
            )}
            {trabalho.data_conclusao && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Concluído em {new Date(trabalho.data_conclusao).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {trabalho.descricao && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Descrição
            </h2>
            <p className="text-foreground">{trabalho.descricao}</p>
          </div>
        )}

        {/* Arquivos Finais */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Arquivos para Download
          </h2>
          
          {trabalho.arquivos_finais.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-sm border border-border">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum arquivo disponível ainda</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trabalho.arquivos_finais.map((arquivo) => {
                const downloadUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-file?token=${token}&fileId=${arquivo.id}`;
                
                return (
                  <a
                    key={arquivo.id}
                    href={downloadUrl}
                    download={arquivo.nome}
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-sm hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="text-2xl">{getFileIcon(arquivo.tipo)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium truncate">{arquivo.nome}</p>
                      <p className="text-xs text-muted-foreground">{arquivo.tipo}</p>
                    </div>
                    <Download size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          Link compartilhado de forma segura
        </div>
      </footer>
    </div>
  );
};

export default PublicLink;
