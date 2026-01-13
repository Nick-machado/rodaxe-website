import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const fileId = url.searchParams.get("fileId");

    if (!token || !fileId) {
      return new Response(
        JSON.stringify({ error: "Token e fileId são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate token
    const { data: linkData, error: linkError } = await supabase
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
        JSON.stringify({ error: "Link expirado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get trabalho data
    const { data: trabalho, error: trabalhoError } = await supabase
      .from("trabalhos")
      .select("arquivos_finais")
      .eq("id", linkData.alvo_id)
      .single();

    if (trabalhoError || !trabalho) {
      return new Response(
        JSON.stringify({ error: "Trabalho não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the file in arquivos_finais
    const arquivos = (trabalho.arquivos_finais as any[]) || [];
    const arquivo = arquivos.find((a: any) => a.id === fileId);

    if (!arquivo) {
      return new Response(
        JSON.stringify({ error: "Arquivo não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle both old public URL format and new path format
    let bucket = "briefings";
    let filePath: string;
    
    if (arquivo.url.includes("/storage/v1/object/public/")) {
      // Old format: extract from public URL
      const fileUrl = new URL(arquivo.url);
      const pathMatch = fileUrl.pathname.match(/\/storage\/v1\/object\/public\/(.+)/);
      
      if (!pathMatch) {
        return new Response(
          JSON.stringify({ error: "URL de arquivo inválida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const fullPath = decodeURIComponent(pathMatch[1]);
      const [extractedBucket, ...pathParts] = fullPath.split('/');
      bucket = extractedBucket;
      filePath = pathParts.join('/');
    } else if (arquivo.url.startsWith("briefings/")) {
      // New format: bucket/path
      filePath = arquivo.url.substring("briefings/".length);
    } else {
      // Fallback: assume it's just a path
      filePath = arquivo.url;
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(
        JSON.stringify({ error: "Erro ao baixar arquivo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return file with proper headers for download
    return new Response(fileData, {
      headers: {
        ...corsHeaders,
        "Content-Type": arquivo.tipo || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(arquivo.nome)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
