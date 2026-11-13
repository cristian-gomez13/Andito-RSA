import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { serve } from "bun";
import {
  CANALES_DERIVACION,
  CUOTAS_MODERADORAS,
  REGLAS_CITAS_Y_SERVICIOS,
  SEDES_RSA
} from "./data/rsa_knowledge";
import index from "./index.html";
import { generateChatResponse, type ChatMessage } from "./services/gemini.service";
import {
  getLogsFilePath,
  getLogsMensajesCSVPath,
  logChatInteraction,
  logSystemEvent,
  readLogs,
  readLogsMensajesCSV
} from "./services/logger.service";
import {
  generateAllMetricsCSVs,
  generateBusinessCaseKPIsCSV,
  generateCallReasonsAndDeflectionCSV,
  generateComplaintsReductionCSV,
  generateHourlyDemandAndLatencyCSV,
  generateROIFinancialProjectionCSV,
  generateTestBenchmarksCSV,
  recordLiveChatTest,
  LIVE_TESTING_CSV_FILENAME
} from "./services/metrics.service";
import {
  exportUnresolvedToCSV,
  loadUnresolvedQuestions,
  logUnresolvedQuestion
} from "./services/unresolved.service";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const port = Number(process.env.PORT) || 3000;

const server = serve({
  port,
  routes: {
    // Servir aplicación frontend en cualquier ruta no API
    "/*": index,

    // Healthcheck
    "/api/health": {
      async GET() {
        return Response.json(
          {
            status: "ok",
            service: "Red Salud Andina (RSA) Chatbot API",
            model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
            apiKeyConfigured: Boolean(
              process.env.GEMINI_API_KEY &&
              process.env.GEMINI_API_KEY !== "your_gemini_api_key_here",
            ),
            timestamp: new Date().toISOString(),
          },
          { headers: corsHeaders },
        );
      }
    },

    // Endpoint principal de conversación con el agente
    "/api/chat": {
      async OPTIONS() {
        return new Response(null, { headers: corsHeaders });
      },
      async POST(req) {
        const startTime = performance.now();
        try {
          const body = await req.json().catch(() => ({}));
          const userMessage = (body.message || body.query || "").trim();
          const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

          if (!userMessage) {
            return Response.json(
              { error: "El mensaje del usuario es requerido." },
              { status: 400, headers: corsHeaders }
            );
          }

          const chatResult = await generateChatResponse(userMessage, history);
          const durationMs = Math.round(performance.now() - startTime);

          // Guardar interacción del agente en logs.txt y logs-mensajes.csv en tiempo real
          logChatInteraction({
            userMessage,
            reply: chatResult.reply,
            modelUsed: chatResult.modelUsed,
            unresolved: chatResult.unresolved,
            reason: chatResult.reason,
            category: chatResult.category,
            durationMs,
            timeoutFallback: chatResult.timeoutFallback,
            promptTokens: chatResult.promptTokens,
            completionTokens: chatResult.completionTokens,
            totalTokens: chatResult.totalTokens
          });

          // Autocompletar el dataset CSV de testing en tiempo real con cada interacción
          recordLiveChatTest({
            userMessage,
            reply: chatResult.reply,
            modelUsed: chatResult.modelUsed,
            latencyMs: durationMs,
            unresolved: chatResult.unresolved,
            reason: chatResult.reason,
            category: chatResult.category,
            timeoutFallback: chatResult.timeoutFallback
          });

          return Response.json(
            {
              success: true,
              reply: chatResult.reply,
              unresolved: chatResult.unresolved,
              reason: chatResult.reason,
              category: chatResult.category,
              durationMs,
              promptTokens: chatResult.promptTokens,
              completionTokens: chatResult.completionTokens,
              totalTokens: chatResult.totalTokens,
              timestamp: new Date().toISOString()
            },
            { headers: corsHeaders }
          );
        } catch (error: any) {
          const durationMs = Math.round(performance.now() - startTime);
          console.error("Error en POST /api/chat:", error);
          logSystemEvent("Error en POST /api/chat", `${error?.message || error} (${durationMs}ms)`);
          return Response.json(
            {
              error: "Error interno al procesar el mensaje.",
              details: error?.message || String(error)
            },
            { status: 500, headers: corsHeaders }
          );
        }
      }
    },

    // Consulta y registro de preguntas no resueltas
    "/api/unresolved": {
      async OPTIONS() {
        return new Response(null, { headers: corsHeaders });
      },
      async GET() {
        try {
          const items = loadUnresolvedQuestions();
          return Response.json(
            {
              success: true,
              count: items.length,
              items
            },
            { headers: corsHeaders }
          );
        } catch (error: any) {
          return Response.json(
            { error: "Error al consultar preguntas no resueltas", details: error?.message },
            { status: 500, headers: corsHeaders }
          );
        }
      },
      async POST(req) {
        try {
          const body = await req.json().catch(() => ({}));
          const question = (body.question || "").trim();
          const reason = body.reason || "Registro manual";
          const category = body.category || "manual";

          if (!question) {
            return Response.json(
              { error: "El campo 'question' es requerido." },
              { status: 400, headers: corsHeaders }
            );
          }

          const entry = logUnresolvedQuestion(question, reason, category);
          return Response.json(
            { success: true, entry },
            { status: 201, headers: corsHeaders }
          );
        } catch (error: any) {
          return Response.json(
            { error: "Error al registrar pregunta no resuelta", details: error?.message },
            { status: 500, headers: corsHeaders }
          );
        }
      }
    },

    // Exportación de preguntas no resueltas (CSV / JSON) para revisión semanal
    "/api/unresolved/export": {
      async GET(req) {
        try {
          const url = new URL(req.url);
          const format = url.searchParams.get("format") || "csv";

          if (format.toLowerCase() === "json") {
            const items = loadUnresolvedQuestions();
            return new Response(JSON.stringify(items, null, 2), {
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json; charset=utf-8",
                "Content-Disposition": 'attachment; filename="unresolved_questions_rsa.json"'
              }
            });
          }

          const csvData = exportUnresolvedToCSV();
          return new Response(csvData, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": 'attachment; filename="unresolved_questions_rsa.csv"'
            }
          });
        } catch (error: any) {
          return Response.json(
            { error: "Error al exportar preguntas no resueltas", details: error?.message },
            { status: 500, headers: corsHeaders }
          );
        }
      }
    },

    // Consulta de la base de conocimiento estructurada
    "/api/knowledge": {
      async GET() {
        return Response.json(
          {
            success: true,
            sedes: SEDES_RSA,
            cuotas: CUOTAS_MODERADORAS,
            canales: CANALES_DERIVACION,
            reglas: REGLAS_CITAS_Y_SERVICIOS
          },
          { headers: corsHeaders }
        );
      }
    },

    // Consulta y descarga de logs operativos y de pruebas (logs.txt)
    "/api/logs": {
      async OPTIONS() {
        return new Response(null, { headers: corsHeaders });
      },
      async GET(req) {
        try {
          const url = new URL(req.url);
          const format = url.searchParams.get("format") || "json";
          const maxLines = url.searchParams.get("lines") ? Number(url.searchParams.get("lines")) : undefined;
          const logContent = readLogs(maxLines);

          if (format.toLowerCase() === "text") {
            return new Response(logContent, {
              headers: {
                ...corsHeaders,
                "Content-Type": "text/plain; charset=utf-8",
                "Content-Disposition": 'attachment; filename="logs.txt"'
              }
            });
          }

          return Response.json(
            {
              success: true,
              path: getLogsFilePath(),
              timestamp: new Date().toISOString(),
              content: logContent
            },
            { headers: corsHeaders }
          );
        } catch (error: any) {
          return Response.json(
            { error: "Error al leer logs.txt", details: error?.message },
            { status: 500, headers: corsHeaders }
          );
        }
      }
    },

    // Acceso directo a logs.txt como archivo de texto plano
    "/logs.txt": {
      async GET() {
        try {
          const logContent = readLogs();
          return new Response(logContent, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/plain; charset=utf-8"
            }
          });
        } catch (error: any) {
          return new Response(`Error al leer logs.txt: ${error?.message || error}`, {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" }
          });
        }
      }
    },

    // Acceso directo y descarga de logs-mensajes.csv con tokens y trazabilidad de chats
    "/logs-mensajes.csv": {
      async OPTIONS() {
        return new Response(null, { headers: corsHeaders });
      },
      async GET() {
        try {
          const csvContent = readLogsMensajesCSV();
          return new Response(csvContent, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": 'attachment; filename="logs-mensajes.csv"'
            }
          });
        } catch (error: any) {
          return new Response(`Error al leer logs-mensajes.csv: ${error?.message || error}`, {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" }
          });
        }
      }
    },

    // Endpoint de exportación de logs-mensajes en formato CSV o JSON
    "/api/logs-mensajes/export": {
      async OPTIONS() {
        return new Response(null, { headers: corsHeaders });
      },
      async GET() {
        try {
          const csvContent = readLogsMensajesCSV();
          return new Response(csvContent, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": 'attachment; filename="logs-mensajes.csv"'
            }
          });
        } catch (error: any) {
          return Response.json(
            { error: "Error al exportar logs-mensajes.csv", details: error?.message },
            { status: 500, headers: corsHeaders }
          );
        }
      }
    },

    // Consulta y descarga de CSVs de métricas para gráficos y business case
    "/api/metrics/export": {
      async OPTIONS() {
        return new Response(null, { headers: corsHeaders });
      },
      async GET(req) {
        try {
          const url = new URL(req.url);
          const type = (url.searchParams.get("type") || "kpis").toLowerCase();

          let csvData = "";
          let fileName = "rsa_business_case_kpis.csv";

          if (type.includes("live") || type.includes("real")) {
            const livePath = resolve("C:/Users/cris/Desktop/RSA", LIVE_TESTING_CSV_FILENAME);
            csvData = existsSync(livePath) ? readFileSync(livePath, "utf-8") : "";
            fileName = LIVE_TESTING_CSV_FILENAME;
          } else if (type.includes("bench") || type.includes("test")) {
            csvData = generateTestBenchmarksCSV();
            fileName = "rsa_test_benchmarks_and_performance.csv";
          } else if (type.includes("hour") || type.includes("hora") || type.includes("demand")) {
            csvData = generateHourlyDemandAndLatencyCSV();
            fileName = "rsa_hourly_demand_and_latency.csv";
          } else if (type.includes("roi") || type.includes("finan") || type.includes("ahorro")) {
            csvData = generateROIFinancialProjectionCSV();
            fileName = "rsa_roi_financial_projection_12m.csv";
          } else if (type.includes("reason") || type.includes("motivo") || type.includes("deflect")) {
            csvData = generateCallReasonsAndDeflectionCSV();
            fileName = "rsa_call_reasons_and_deflection.csv";
          } else if (type.includes("queja") || type.includes("complaint")) {
            csvData = generateComplaintsReductionCSV();
            fileName = "rsa_complaints_reduction_impact.csv";
          } else {
            csvData = generateBusinessCaseKPIsCSV();
            fileName = "rsa_business_case_kpis.csv";
          }

          return new Response(csvData, {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="${fileName}"`
            }
          });
        } catch (error: any) {
          return Response.json(
            { error: "Error al exportar métricas", details: error?.message },
            { status: 500, headers: corsHeaders }
          );
        }
      }
    }
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true
  }
});

// Asegurar generación de CSVs de métricas para gráficos
generateAllMetricsCSVs();

logSystemEvent("Servidor iniciado", `Puerto: ${port} | URL: ${server.url}`);
console.log(`🚀 Red Salud Andina Backend iniciado en ${server.url}`);
