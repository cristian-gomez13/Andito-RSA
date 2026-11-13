export default async function handler(req: any, res?: any) {
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const payload = {
    status: "ok",
    service: "Red Salud Andina (RSA) Chatbot API on Vercel",
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    hasOfficialGeminiKey: Boolean(
      process.env.GEMINI_API_KEY &&
      !process.env.GEMINI_API_KEY.includes("your_") &&
      !process.env.GEMINI_API_KEY.startsWith("sk-")
    ),
    hasCustomKey: Boolean(
      process.env.CUSTOM_GEMINI_API_KEY ||
      (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("sk-"))
    ),
    hasCustomBaseUrl: Boolean(
      process.env.CUSTOM_GEMINI_BASE_URL ||
      (process.env.GOOGLE_GEMINI_BASE_URL && !process.env.GOOGLE_GEMINI_BASE_URL.includes("generativelanguage.googleapis.com"))
    ),
    timestamp: new Date().toISOString(),
  };

  if (res && typeof res.status === "function") {
    if (req.method === "OPTIONS") {
      res.writeHead(204, corsHeaders);
      res.end();
      return;
    }
    return res.status(200).json(payload);
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return Response.json(payload, { headers: corsHeaders });
}
