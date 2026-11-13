import { generateChatResponse, type ChatMessage } from "../src/services/gemini.service";

export const config = {
  maxDuration: 15,
};

export default async function handler(req: any, res?: any) {
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Soporte para runtime Node.js clásico en Vercel Serverless
  if (res && typeof res.status === "function") {
    if (req.method === "OPTIONS") {
      res.writeHead(204, corsHeaders);
      res.end();
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Método no permitido. Use POST." });
      return;
    }

    const startTime = performance.now();
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const userMessage = (body.message || body.query || "").trim();
      const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

      if (!userMessage) {
        res.status(400).json({ error: "El mensaje del usuario es requerido." });
        return;
      }

      const chatResult = await generateChatResponse(userMessage, history);
      const durationMs = Math.round(performance.now() - startTime);

      res.status(200).json({
        success: true,
        reply: chatResult.reply,
        unresolved: chatResult.unresolved,
        reason: chatResult.reason,
        category: chatResult.category,
        modelUsed: chatResult.modelUsed,
        durationMs,
        promptTokens: chatResult.promptTokens,
        completionTokens: chatResult.completionTokens,
        totalTokens: chatResult.totalTokens,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("[api/chat] Error:", err);
      res.status(500).json({
        error: "Error interno del servidor",
        details: err?.message || String(err),
      });
    }
    return;
  }

  // Soporte para Web Standard Request/Response (Vercel Edge / Modern runtime)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Método no permitido. Use POST." }, { status: 405, headers: corsHeaders });
  }

  const startTime = performance.now();
  try {
    const body = await req.json().catch(() => ({}));
    const userMessage = (body.message || body.query || "").trim();
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

    if (!userMessage) {
      return Response.json({ error: "El mensaje del usuario es requerido." }, { status: 400, headers: corsHeaders });
    }

    const chatResult = await generateChatResponse(userMessage, history);
    const durationMs = Math.round(performance.now() - startTime);

    return Response.json(
      {
        success: true,
        reply: chatResult.reply,
        unresolved: chatResult.unresolved,
        reason: chatResult.reason,
        category: chatResult.category,
        modelUsed: chatResult.modelUsed,
        durationMs,
        promptTokens: chatResult.promptTokens,
        completionTokens: chatResult.completionTokens,
        totalTokens: chatResult.totalTokens,
        timestamp: new Date().toISOString(),
      },
      { headers: corsHeaders },
    );
  } catch (err: any) {
    console.error("[api/chat] Error:", err);
    return Response.json(
      { error: "Error interno del servidor", details: err?.message || String(err) },
      { status: 500, headers: corsHeaders },
    );
  }
}
