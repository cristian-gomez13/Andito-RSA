import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface UnresolvedQuestionEntry {
  id: string;
  timestamp: string;
  question: string;
  reason?: string;
  category?: string;
}

const UNRESOLVED_FILE_PATH = resolve(process.cwd(), "unresolved_questions.json");

/**
 * Sanitiza el texto de la pregunta eliminando información personal identificable (PII):
 * Números de cédula/documento, teléfonos, correos y nombres personales detectables.
 */
export function sanitizeText(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // Reemplazar correos electrónicos
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, "[CORREO]");

  // Reemplazar teléfonos colombianos (ej: +57 300 123 4567, 3001234567, 601 555 0100)
  cleaned = cleaned.replace(/(\+?57\s?)?(\(?\d{2,3}\)?\s?)?\d{3,4}[-\s]?\d{4}/g, (match) => {
    // Evitar ocultar números cortos como años o horas
    const digitsOnly = match.replace(/\D/g, "");
    if (digitsOnly.length >= 7) {
      return "[TELÉFONO]";
    }
    return match;
  });

  // Reemplazar números de documento / cédula (6 a 11 dígitos continuos o con puntos)
  cleaned = cleaned.replace(/\b\d{1,3}(\.\d{3}){2,3}\b/g, "[DOCUMENTO]");
  cleaned = cleaned.replace(/\b\d{7,11}\b/g, (match) => {
    // Si no parece un año o número genérico
    return "[DOCUMENTO]";
  });

  return cleaned.trim();
}

/**
 * Carga la lista de preguntas no resueltas desde unresolved_questions.json
 */
export function loadUnresolvedQuestions(): UnresolvedQuestionEntry[] {
  try {
    if (!existsSync(UNRESOLVED_FILE_PATH)) {
      writeFileSync(UNRESOLVED_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const data = readFileSync(UNRESOLVED_FILE_PATH, "utf-8");
    if (!data.trim()) return [];
    return JSON.parse(data) as UnresolvedQuestionEntry[];
  } catch (error) {
    console.error("Error al leer unresolved_questions.json:", error);
    return [];
  }
}

/**
 * Registra una pregunta no resuelta de forma segura sin datos personales
 */
export function logUnresolvedQuestion(
  question: string,
  reason: string = "Requiere atención de asesor o está fuera de la base de conocimiento",
  category: string = "general"
): UnresolvedQuestionEntry {
  const list = loadUnresolvedQuestions();
  const sanitized = sanitizeText(question);

  // Evitar duplicar exactamente la misma pregunta reciente en menos de 5 minutos
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const existingIndex = list.findIndex(
    item => item.question.toLowerCase() === sanitized.toLowerCase() &&
    new Date(item.timestamp).getTime() > fiveMinutesAgo
  );

  if (existingIndex !== -1) {
    return list[existingIndex]!;
  }

  const newEntry: UnresolvedQuestionEntry = {
    id: `uq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    question: sanitized,
    reason,
    category
  };

  list.push(newEntry);

  try {
    writeFileSync(UNRESOLVED_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (error) {
    console.error("Error al guardar en unresolved_questions.json:", error);
  }

  return newEntry;
}

/**
 * Exporta el archivo en formato CSV para la revisión semanal de la operación
 */
export function exportUnresolvedToCSV(): string {
  const items = loadUnresolvedQuestions();
  const headers = ["ID", "Fecha_Hora", "Pregunta_Sanitizada", "Motivo_Derivacion", "Categoria"];
  const rows = items.map(item => [
    `"${item.id}"`,
    `"${item.timestamp}"`,
    `"${item.question.replace(/"/g, '""')}"`,
    `"${(item.reason || "").replace(/"/g, '""')}"`,
    `"${(item.category || "").replace(/"/g, '""')}"`
  ]);

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}
