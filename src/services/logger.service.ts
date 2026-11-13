import { existsSync, appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { sanitizeText } from "./unresolved.service";

/**
 * Retorna la ruta absoluta del archivo logs.txt, priorizando el directorio del proyecto RSA.
 */
export function getLogsFilePath(): string {
  if (process.env.LOG_FILE_PATH) {
    return process.env.LOG_FILE_PATH;
  }
  const rsaPath = resolve("C:/Users/cris/Desktop/RSA/logs.txt");
  if (existsSync("C:/Users/cris/Desktop/RSA")) {
    return rsaPath;
  }
  return resolve(process.cwd(), "logs.txt");
}

const LOGS_FILE_PATH = getLogsFilePath();

/**
 * Retorna la ruta absoluta del archivo logs-mensajes.csv.
 */
export function getLogsMensajesCSVPath(): string {
  if (process.env.LOGS_MENSAJES_CSV_PATH) {
    return process.env.LOGS_MENSAJES_CSV_PATH;
  }
  const rsaPath = resolve("C:/Users/cris/Desktop/RSA/logs-mensajes.csv");
  if (existsSync("C:/Users/cris/Desktop/RSA")) {
    return rsaPath;
  }
  return resolve(process.cwd(), "logs-mensajes.csv");
}

const LOGS_MENSAJES_CSV_PATH = getLogsMensajesCSVPath();

/**
 * Inicializa el archivo logs.txt si aún no existe.
 */
export function ensureLogsFileExists(): void {
  try {
    if (!existsSync(LOGS_FILE_PATH)) {
      const header = [
        "================================================================================",
        "  RED SALUD ANDINA (RSA) - REGISTRO OFICIAL DE OPERACIONES Y PRUEBAS (logs.txt)",
        `  Fecha de Creación: ${new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })} (${new Date().toISOString()})`,
        "  Alcance: Registro continuo de interacciones del agente, consultas, respuestas,",
        "           modelos utilizados, tiempos de respuesta y resultados de pruebas.",
        "================================================================================",
        ""
      ].join("\n");
      writeFileSync(LOGS_FILE_PATH, header, "utf-8");
    }
  } catch (error) {
    console.error("[LoggerService] Error al inicializar logs.txt:", error);
  }
}

/**
 * Agrega una cadena de texto sin procesar al archivo de logs.
 */
export function appendRawLog(text: string): void {
  try {
    ensureLogsFileExists();
    appendFileSync(LOGS_FILE_PATH, text + "\n", "utf-8");
  } catch (error) {
    console.error("[LoggerService] Error al escribir en logs.txt:", error);
  }
}

/**
 * Formatea la fecha y hora actual en formato legible de Colombia.
 */
function getFormattedTimestamp(): string {
  const now = new Date();
  const dateStr = now.toISOString().replace("T", " ").replace("Z", "");
  return `[${dateStr}]`;
}

/**
 * Inicializa el archivo logs-mensajes.csv con sus encabezados oficiales si aún no existe.
 */
export function ensureLogsMensajesCSVExists(): void {
  try {
    if (!existsSync(LOGS_MENSAJES_CSV_PATH)) {
      const header = '"Fecha_Hora","Tipo_Evento","Consulta_Usuario","Respuesta_Agente","Modelo_Utilizado","Estado_Resultado","Motivo","Categoria","Tiempo_Respuesta","Tokens_Recepcion_Entrada","Tokens_Respuesta_Salida","Tokens_Totales"\n';
      writeFileSync(LOGS_MENSAJES_CSV_PATH, header, "utf-8");
      backfillMessageLogsFromLogsTxt();
    }
  } catch (error) {
    console.error("[LoggerService] Error al inicializar logs-mensajes.csv:", error);
  }
}

/**
 * Puebla el archivo logs-mensajes.csv con las interacciones previas registradas en logs.txt.
 */
export function backfillMessageLogsFromLogsTxt(): void {
  try {
    const logsPath = getLogsFilePath();
    if (!existsSync(logsPath)) return;
    const content = readFileSync(logsPath, "utf-8");
    const blocks = content.split("--------------------------------------------------------------------------------");

    for (const block of blocks) {
      if (!block.includes("[USO_AGENTE / CHAT]")) continue;

      const timeMatch = block.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\]/);
      const queryMatch = block.match(/• Consulta Usuario\s*:\s*"([^"]+)"/);
      const replyMatch = block.match(/• Respuesta Agente\s*:\s*"([^"]+)"/);
      const modelMatch = block.match(/• Modelo Utilizado\s*:\s*([^\n\r]+)/);
      const statusMatch = block.match(/• Estado Resultado\s*:\s*([^\n\r]+)/);
      const reasonMatch = block.match(/• Motivo\s*:\s*([^\n\r]+)/);
      const categoryMatch = block.match(/• Categoría\s*:\s*([^\n\r]+)/);
      const durationMatch = block.match(/• Tiempo Respuesta\s*:\s*([^\n\r]+)/);

      if (queryMatch?.[1] && replyMatch?.[1]) {
        const fechaHora = timeMatch?.[1] ?? new Date().toISOString().replace("T", " ").replace("Z", "");
        const tipoEvento = "USO_AGENTE / CHAT";
        const consultaUsuario = queryMatch[1];
        const respuestaAgente = replyMatch[1];
        const modelLabel = modelMatch?.[1]?.trim() || "gemini-3.1-flash-lite (Contingencia / Timeout activado)";
        const rawStatus = statusMatch?.[1]?.trim() || "RESUELTO";
        const estadoResultado = rawStatus.includes("NO RESUELTO") || rawStatus.includes("NO_RESUELTO") ? "NO_RESUELTO" : "RESUELTO";
        const motivo = reasonMatch?.[1]?.trim() || "";
        const categoria = categoryMatch?.[1]?.trim() || "general";
        const tiempoRespuesta = durationMatch?.[1]?.trim() || "N/D";

        const tokensEntrada = Math.max(1, Math.ceil(consultaUsuario.length / 4));
        const tokensSalida = Math.max(1, Math.ceil(respuestaAgente.length / 4));
        const tokensTotales = tokensEntrada + tokensSalida;

        const row = [
          escapeCsv(fechaHora),
          escapeCsv(tipoEvento),
          escapeCsv(consultaUsuario),
          escapeCsv(respuestaAgente),
          escapeCsv(modelLabel),
          escapeCsv(estadoResultado),
          escapeCsv(motivo),
          escapeCsv(categoria),
          escapeCsv(tiempoRespuesta),
          tokensEntrada,
          tokensSalida,
          tokensTotales
        ].join(",") + "\n";

        appendFileSync(LOGS_MENSAJES_CSV_PATH, row, "utf-8");
      }
    }
  } catch (error) {
    console.error("[LoggerService] Error al poblar histórico de logs-mensajes.csv:", error);
  }
}

/**
 * Escapa comillas dobles para formato CSV estándar.
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Agrega una fila de registro a logs-mensajes.csv.
 */
export function appendLogsMensajesRow(data: ChatLogData): void {
  try {
    ensureLogsMensajesCSVExists();
    const now = new Date();
    const fechaHora = now.toISOString().replace("T", " ").replace("Z", "");
    const tipoEvento = "USO_AGENTE / CHAT";
    const consultaUsuario = sanitizeText(data.userMessage);
    const respuestaAgente = data.reply.replace(/\r?\n/g, " // ");
    const modelLabel = (data.modelUsed || "desconocido") + (data.timeoutFallback ? " (Contingencia / Timeout activado)" : "");
    const estadoResultado = data.unresolved ? "NO_RESUELTO" : "RESUELTO";
    const motivo = data.reason || "";
    const categoria = data.category || "general";
    const tiempoRespuesta = data.durationMs !== undefined ? `${data.durationMs}ms` : "N/D";
    const tokensEntrada = data.promptTokens ?? Math.max(1, Math.ceil(data.userMessage.length / 4));
    const tokensSalida = data.completionTokens ?? Math.max(1, Math.ceil(data.reply.length / 4));
    const tokensTotales = data.totalTokens ?? (tokensEntrada + tokensSalida);

    const row = [
      escapeCsv(fechaHora),
      escapeCsv(tipoEvento),
      escapeCsv(consultaUsuario),
      escapeCsv(respuestaAgente),
      escapeCsv(modelLabel),
      escapeCsv(estadoResultado),
      escapeCsv(motivo),
      escapeCsv(categoria),
      escapeCsv(tiempoRespuesta),
      tokensEntrada,
      tokensSalida,
      tokensTotales
    ].join(",") + "\n";

    appendFileSync(LOGS_MENSAJES_CSV_PATH, row, "utf-8");
  } catch (error) {
    console.error("[LoggerService] Error al registrar fila en logs-mensajes.csv:", error);
  }
}

/**
 * Lee el contenido del archivo logs-mensajes.csv.
 */
export function readLogsMensajesCSV(): string {
  try {
    ensureLogsMensajesCSVExists();
    return readFileSync(LOGS_MENSAJES_CSV_PATH, "utf-8");
  } catch (error) {
    console.error("[LoggerService] Error al leer logs-mensajes.csv:", error);
    return "";
  }
}

/**
 * Registra una interacción del usuario con el agente durante el uso del chat.
 */
export interface ChatLogData {
  userMessage: string;
  reply: string;
  modelUsed?: string;
  unresolved?: boolean;
  reason?: string;
  category?: string;
  durationMs?: number;
  timeoutFallback?: boolean;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export function logChatInteraction(data: ChatLogData): void {
  const timestamp = getFormattedTimestamp();
  const sanitizedQuery = sanitizeText(data.userMessage);
  const statusLabel = data.unresolved ? "⚠️ NO RESUELTO (DERIVADO)" : "✅ RESUELTO";
  const durationLabel = data.durationMs !== undefined ? `${data.durationMs}ms` : "N/D";
  const modelLabel = data.modelUsed || "desconocido";
  const fallbackLabel = data.timeoutFallback ? " (Contingencia / Timeout activado)" : "";
  const tokensEntrada = data.promptTokens ?? Math.max(1, Math.ceil(data.userMessage.length / 4));
  const tokensSalida = data.completionTokens ?? Math.max(1, Math.ceil(data.reply.length / 4));
  const tokensTotales = data.totalTokens ?? (tokensEntrada + tokensSalida);

  const lines = [
    `${timestamp} [USO_AGENTE / CHAT]`,
    `  • Consulta Usuario : "${sanitizedQuery}"`,
    `  • Respuesta Agente : "${data.reply.replace(/\n/g, " // ")}"`,
    `  • Modelo Utilizado : ${modelLabel}${fallbackLabel}`,
    `  • Estado Resultado : ${statusLabel}`,
    data.reason ? `  • Motivo           : ${data.reason}` : null,
    data.category ? `  • Categoría        : ${data.category}` : null,
    `  • Tiempo Respuesta : ${durationLabel}`,
    `  • Tokens Entrada   : ${tokensEntrada}`,
    `  • Tokens Salida    : ${tokensSalida}`,
    `  • Tokens Totales   : ${tokensTotales}`,
    "--------------------------------------------------------------------------------"
  ].filter(Boolean).join("\n");

  appendRawLog(lines);

  // Registrar simultáneamente en logs-mensajes.csv
  appendLogsMensajesRow(data);
}

/**
 * Registra un evento de prueba individual en logs.txt.
 */
export function logTestEvent(testNumber: number, testName: string, passed: boolean, error?: string): void {
  const timestamp = getFormattedTimestamp();
  const status = passed ? "✅ [PASS]" : "❌ [FAIL]";
  let line = `${timestamp} [PRUEBA #${testNumber.toString().padStart(2, "0")}] ${status} ${testName}`;
  if (!passed && error) {
    line += ` | Error: ${error}`;
  }
  appendRawLog(line);
}

/**
 * Registra la ejecución completa de una suite de pruebas con su resumen estadístico.
 */
export interface TestSuiteSummaryData {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: Array<{ testNumber: number; desc: string; passed: boolean; error?: string }>;
}

export function logTestSuiteRun(data: TestSuiteSummaryData): void {
  const timestamp = getFormattedTimestamp();
  const successRate = data.total > 0 ? ((data.passed / data.total) * 100).toFixed(1) : "0.0";
  const outcomeLabel = data.failed === 0 ? "✅ ÉXITO TOTAL (100% APROBADO)" : `❌ FALLÓ (${data.failed} errores)`;

  const lines = [
    "================================================================================",
    `${timestamp} [EJECUCIÓN DE SUITE DE PRUEBAS AUTOMÁTICAS]`,
    `  • Resultado Global : ${outcomeLabel}`,
    `  • Total Pruebas    : ${data.total}`,
    `  • Pruebas Pasadas  : ${data.passed}`,
    `  • Pruebas Fallidas : ${data.failed}`,
    `  • Tasa de Éxito    : ${successRate}%`,
    `  • Tiempo Total     : ${data.durationMs}ms`,
    "  • Detalle de Casos :",
    ...data.results.map(r => `      ${r.passed ? "✅ [PASS]" : "❌ [FAIL]"} #${r.testNumber.toString().padStart(2, "0")}: ${r.desc}${r.error ? ` (Error: ${r.error})` : ""}`),
    "================================================================================"
  ].join("\n");

  appendRawLog(lines);
}

/**
 * Registra un evento del sistema o servidor en logs.txt.
 */
export function logSystemEvent(event: string, details?: string): void {
  const timestamp = getFormattedTimestamp();
  let line = `${timestamp} [SISTEMA] ${event}`;
  if (details) {
    line += ` | ${details}`;
  }
  appendRawLog(line);
}

/**
 * Lee el contenido actual del archivo logs.txt.
 */
export function readLogs(maxLines?: number): string {
  try {
    ensureLogsFileExists();
    const content = readFileSync(LOGS_FILE_PATH, "utf-8");
    if (!maxLines) return content;
    const lines = content.split("\n");
    if (lines.length <= maxLines) return content;
    return lines.slice(lines.length - maxLines).join("\n");
  } catch (error) {
    console.error("[LoggerService] Error al leer logs.txt:", error);
    return `Error al leer logs.txt: ${String(error)}`;
  }
}
