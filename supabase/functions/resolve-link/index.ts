import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Arquivo {
  id: string;
  nome: string;
  url: string;
  tipo: string;
}

// UUID format validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Allowed domains for redirect URLs to prevent open redirect attacks
const ALLOWED_REDIRECT_DOMAINS = ['rodaxe.com', 'rodaxe.com.br', 'rodaxe.lovable.app'];

/**
 * Validates a redirect URL to prevent open redirect attacks
 * Only allows redirects to whitelisted domains with HTTPS
 */
function validateRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow HTTPS in production
    if (parsed.protocol !== 'https:') {
      return false;
    }
    
    // Check against allowed domains
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_REDIRECT_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    // Validate token exists
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate token format (UUID) - prevents injection and limits input size
    if (!UUID_REGEX.test(token)) {
      return new Response(
        JSON.stringify({ error: "Formato de token inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch the link by token
    const { data: linkData, error: linkError } = await supabaseAdmin
      .from("unique_links")
      .select("*")
      .eq("token", token)
      .single();

    if (linkError || !linkData) {
      return new Response(
        JSON.stringify({ error: "Link não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (linkData.expira_em && new Date(linkData.expira_em) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Este link expirou" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle briefing type - return redirect URL with server-side validation
    if (linkData.tipo === "briefing" && linkData.url) {
      // Validate redirect URL on server-side for defense in depth
      if (!validateRedirectUrl(linkData.url)) {
        return new Response(
          JSON.stringify({ error: "URL de redirecionamento inválida ou não permitida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ type: "redirect", url: linkData.url }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle trabalho type - fetch trabalho data
    if (linkData.tipo === "trabalho") {
      const { data: trabalhoData, error: trabalhoError } = await supabaseAdmin
        .from("trabalhos")
        .select("id, titulo, descricao, data_conclusao, arquivos_finais, clientes(nome_ou_razao)")
        .eq("id", linkData.alvo_id)
        .single();

      if (trabalhoError || !trabalhoData) {
        return new Response(
          JSON.stringify({ error: "Trabalho não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return trabalho data
      return new Response(
        JSON.stringify({
          type: "trabalho",
          trabalho: {
            ...trabalhoData,
            arquivos_finais: (trabalhoData.arquivos_finais as unknown as Arquivo[]) || [],
            clientes: trabalhoData.clientes,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Tipo de link inválido" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error resolving link:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
