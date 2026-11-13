import { generateChatResponse } from "../src/services/gemini.service";
import { logChatInteraction } from "../src/services/logger.service";
import { recordLiveChatTest } from "../src/services/metrics.service";
import { loadUnresolvedQuestions, exportUnresolvedToCSV } from "../src/services/unresolved.service";
import { readFileSync, existsSync } from "node:fs";

interface TestQuery {
  category: string;
  query: string;
}

const QUERIES: TestQuery[] = [
  // 1. Horarios y ubicación de las sedes (14)
  { category: "sedes", query: "¿Dónde queda la sede Centro?" },
  { category: "sedes", query: "¿Cuál es el horario de atención de la sede Norte?" },
  { category: "sedes", query: "¿La sede Sur abre los sábados?" },
  { category: "sedes", query: "¿Qué dirección tiene la sede Occidente?" },
  { category: "sedes", query: "¿En qué sede atienden los días festivos?" },
  { category: "sedes", query: "¿Cuál es el horario de la sede Oriente?" },
  { category: "sedes", query: "¿Dónde está ubicada la sede Parque?" },
  { category: "sedes", query: "¿La sede Lago atiende medicina general?" },
  { category: "sedes", query: "¿Dónde queda la sede Villa del Río?" },
  { category: "sedes", query: "¿Qué sedes cuentan con parqueadero?" },
  { category: "sedes", query: "¿Cuál es la sede más cercana a Chapinero?" },
  { category: "sedes", query: "¿Hasta qué hora abre la farmacia en sede Centro?" },
  { category: "sedes", query: "¿Tienen sede en el norte de la ciudad?" },
  { category: "sedes", query: "¿Cuáles sedes abren a las 6:30 de la mañana?" },

  // 2. Agendar una cita (28)
  { category: "citas", query: "¿Cómo puedo sacar una cita de medicina general?" },
  { category: "citas", query: "¿Puedo pedir cita médica por WhatsApp?" },
  { category: "citas", query: "¿Cuál es el enlace para agendar cita por internet?" },
  { category: "citas", query: "¿Qué número marco para pedir cita por teléfono?" },
  { category: "citas", query: "¿Puedo sacar cita con ginecólogo directamente?" },
  { category: "citas", query: "¿Cómo agendo cita con pediatría para mi hijo?" },
  { category: "citas", query: "¿Con cuántos días de anticipación pido medicina general?" },
  { category: "citas", query: "¿Puedo agendar una cita para odontología?" },
  { category: "citas", query: "¿Cómo hago para agendar con un ortopedista?" },
  { category: "citas", query: "¿Cómo saco cita con dermatólogo?" },
  { category: "citas", query: "¿Puedo pedir cita presencial en la sede Centro?" },
  { category: "citas", query: "¿Ustedes me pueden agendar la cita directamente por aquí?" },
  { category: "citas", query: "¿Puedo agendar cita de psicología por el portal?" },
  { category: "citas", query: "¿Hay citas de medicina general para hoy mismo?" },
  { category: "citas", query: "¿Cómo agendo cita si soy afiliado a Previsalud?" },
  { category: "citas", query: "¿Cómo agendo cita para control prenatal?" },
  { category: "citas", query: "¿Puedo pedir cita de odontología en sede Occidente?" },
  { category: "citas", query: "¿Cómo pedir cita de especialista si tengo MediPlan?" },
  { category: "citas", query: "¿Se puede agendar cita médica los domingos?" },
  { category: "citas", query: "¿Puedo apartar dos citas el mismo día?" },
  { category: "citas", query: "¿A qué hora habilitan la agenda web de citas?" },
  { category: "citas", query: "¿Puedo pedir cita para un adulto mayor?" },
  { category: "citas", query: "¿Cómo solicitar cita de medicina general en sede Parque?" },
  { category: "citas", query: "¿Cuánto tiempo antes debo llegar a mi cita médica?" },
  { category: "citas", query: "¿Qué canal es más rápido para pedir cita médica?" },
  { category: "citas", query: "¿Puedo agendar cita de pediatría en sede Oriente?" },
  { category: "citas", query: "¿Puedo sacar cita para limpieza dental?" },
  { category: "citas", query: "¿Puedo agendar cita de ortopedia en sede Lago?" },

  // 3. Cancelar o reprogramar (12)
  { category: "citas", query: "¿Cómo puedo cancelar mi cita médica?" },
  { category: "citas", query: "¿Con cuánta anticipación debo cancelar una cita para no pagar multa?" },
  { category: "citas", query: "¿Puedo reprogramar mi cita de medicina general por WhatsApp?" },
  { category: "citas", query: "¿Cobran multa si no asisto a la cita médica?" },
  { category: "citas", query: "¿Cómo cambio la fecha de mi cita con especialista?" },
  { category: "citas", query: "¿Puedo cancelar mi cita desde el portal web?" },
  { category: "citas", query: "¿Qué datos me piden para cancelar una cita?" },
  { category: "citas", query: "¿Hasta cuántas horas antes puedo cancelar la cita médica?" },
  { category: "citas", query: "¿Puedo reprogramar una cita de odontología por teléfono?" },
  { category: "citas", query: "¿Si cancelo con 2 horas de anticipación me cobran penalidad?" },
  { category: "citas", query: "¿Puedo cancelar la cita de mi hijo con su tarjeta de identidad?" },
  { category: "citas", query: "¿A qué número llamo para cancelar una cita hoy?" },

  // 4. Requisitos (qué llevar, órdenes, autorizaciones) (13)
  { category: "requisitos", query: "¿Qué documentos debo llevar el día de mi cita médica?" },
  { category: "requisitos", query: "¿Se necesita orden médica para ir al pediatra?" },
  { category: "requisitos", query: "¿Ortopedia requiere orden del médico general?" },
  { category: "requisitos", query: "¿Ginecología necesita autorización de la EPS?" },
  { category: "requisitos", query: "¿Cuánto tiempo de vigencia tiene una orden médica?" },
  { category: "requisitos", query: "¿Quién tramita la autorización para cita con especialista?" },
  { category: "requisitos", query: "¿Cuánto tiempo tarda la aseguradora en autorizar un especialista?" },
  { category: "requisitos", query: "¿Dermatología requiere remisión previa?" },
  { category: "requisitos", query: "¿Qué necesito llevar para la toma de muestras de laboratorio?" },
  { category: "requisitos", query: "¿Para odontología necesito orden de médico general?" },
  { category: "requisitos", query: "¿Puedo ir a mi cita mostrando el documento en el celular?" },
  { category: "requisitos", query: "¿Qué documento deben presentar los menores de edad?" },
  { category: "requisitos", query: "¿Psicología requiere autorización o solo orden médica?" },

  // 5. Cuotas y costos (6)
  { category: "cuotas", query: "¿Cuánto cuesta la cuota moderadora de medicina general?" },
  { category: "cuotas", query: "¿Cuál es el valor a pagar para cita con especialista?" },
  { category: "cuotas", query: "¿Cuánto vale la consulta de odontología general?" },
  { category: "cuotas", query: "¿Quiénes están exentos de pagar cuota moderadora?" },
  { category: "cuotas", query: "¿Los niños menores de 5 años pagan cuota moderadora?" },
  { category: "cuotas", query: "¿Puedo pagar la cuota moderadora por internet?" },

  // 6. Resultados de laboratorio (8)
  { category: "laboratorio", query: "¿Cómo puedo consultar los resultados de mis exámenes de laboratorio?" },
  { category: "laboratorio", query: "¿Los exámenes de sangre se reclaman en la sede o por internet?" },
  { category: "laboratorio", query: "¿En qué horario toman muestras de laboratorio en sede Centro?" },
  { category: "laboratorio", query: "¿Se necesita cita previa para los exámenes de laboratorio?" },
  { category: "laboratorio", query: "¿La sede Norte hace exámenes de laboratorio los sábados?" },
  { category: "laboratorio", query: "¿Qué requisitos debo cumplir para el examen de glucosa en ayunas?" },
  { category: "laboratorio", query: "¿Cuánto tiempo tardan en salir los resultados de laboratorio?" },
  { category: "laboratorio", query: "¿La sede Villa del Río tiene servicio de laboratorio clínico?" },

  // 7. Historia clínica y certificados (4)
  { category: "historia_clinica", query: "¿Cómo solicito una copia de mi historia clínica?" },
  { category: "certificados", query: "¿Ustedes me pueden expedir un certificado médico laboral por aquí?" },
  { category: "historia_clinica", query: "¿Dónde radico la solicitud para copia de historia clínica?" },
  { category: "certificados", query: "¿Cuánto tiempo tarda la entrega de un certificado de asistencia médica?" },

  // 8. Estado de una autorización (7)
  { category: "autorizaciones", query: "¿Cómo consulto si mi autorización de ortopedia ya fue aprobada?" },
  { category: "autorizaciones", query: "¿Puedo saber por aquí si Previsalud ya autorizó mi cita con dermatólogo?" },
  { category: "autorizaciones", query: "¿Dónde puedo ver el estado de trámite de una autorización médica?" },
  { category: "autorizaciones", query: "¿Cuánto tiempo debo esperar para que AutorizaPlus apruebe mi especialista?" },
  { category: "autorizaciones", query: "¿Qué pasa si mi autorización médica ya venció?" },
  { category: "autorizaciones", query: "¿Ustedes pueden revisar si mi autorización está activa en el sistema?" },
  { category: "autorizaciones", query: "¿A qué número de teléfono consulto el estado de mi autorización?" },

  // 9. Quejas y reclamos (5)
  { category: "pqrs", query: "¿Dónde puedo radicar una queja o inconformidad por mala atención?" },
  { category: "pqrs", query: "¿Cuánto tiempo tarda la clínica en responder un derecho de petición o PQRS?" },
  { category: "pqrs", query: "¿Puedo poner una queja sobre el servicio del Call Center por el portal web?" },
  { category: "pqrs", query: "¿Cuál es el canal oficial para presentar un reclamo a Red Salud Andina?" },
  { category: "pqrs", query: "¿Quién atiende los reclamos de facturación y cobro de cuotas?" },

  // 10. Otros (3)
  { category: "otros", query: "¿Hacen servicios de ortodoncia o diseño de sonrisa en la clínica?" },
  { category: "otros", query: "¿Tienen servicio de ambulancia particular o traslado de pacientes?" },
  { category: "otros", query: "¿Atienden urgencias pediátricas los domingos por la noche?" }
];

async function run() {
  console.log("==========================================================");
  console.log(`BATERÍA DE ${QUERIES.length} CONSULTAS REALES AL AGENTE RSA`);
  console.log("==========================================================\n");

  // Leer consultas ya registradas en logs-mensajes.csv para evitar duplicados al reanudar
  const existingQueries = new Set<string>();
  if (existsSync("logs-mensajes.csv")) {
    const rawCsv = readFileSync("logs-mensajes.csv", "utf-8");
    const lines = rawCsv.split("\n");
    for (const line of lines.slice(1)) {
      const match = line.match(/^"[^"]*","[^"]*","([^"]+)"/);
      if (match && match[1]) {
        existingQueries.add(match[1].trim().toLowerCase());
      }
    }
  }

  const pendingQueries = QUERIES.filter(
    (q) => !existingQueries.has(q.query.trim().toLowerCase())
  );

  console.log(`• Consultas ya registradas previamente : ${existingQueries.size}`);
  console.log(`• Consultas pendientes por procesar    : ${pendingQueries.length} / ${QUERIES.length}\n`);

  const startTimeTotal = performance.now();
  let completedCount = existingQueries.size;
  let resolvedCount = 0;
  let unresolvedCount = 0;
  let totalTokensAccum = 0;

  const CONCURRENCY = 4;

  for (let i = 0; i < pendingQueries.length; i += CONCURRENCY) {
    const batch = pendingQueries.slice(i, i + CONCURRENCY);
    const promises = batch.map(async (item, batchIndex) => {
      const globalIndex = completedCount + batchIndex + 1;
      const t0 = performance.now();
      try {
        const result = await generateChatResponse(item.query);
        const durationMs = Math.round(performance.now() - t0);

        logChatInteraction({
          userMessage: item.query,
          reply: result.reply,
          modelUsed: result.modelUsed,
          unresolved: result.unresolved,
          reason: result.reason,
          category: result.category || item.category,
          durationMs,
          timeoutFallback: result.timeoutFallback,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens: result.totalTokens
        });

        recordLiveChatTest({
          userMessage: item.query,
          reply: result.reply,
          modelUsed: result.modelUsed,
          latencyMs: durationMs,
          unresolved: result.unresolved,
          reason: result.reason,
          category: result.category || item.category,
          timeoutFallback: result.timeoutFallback
        });

        if (result.unresolved) {
          unresolvedCount++;
        } else {
          resolvedCount++;
        }
        totalTokensAccum += result.totalTokens || 0;
        completedCount++;

        const statusIcon = result.unresolved ? "⚠️ [NO RESUELTO/DERIVADO]" : "✅ [RESUELTO]";
        console.log(`[${completedCount.toString().padStart(3, "0")}/${QUERIES.length}] ${statusIcon} (${durationMs}ms | ${result.modelUsed || "local"} | tokens: ${result.totalTokens || 0})`);
        console.log(`   Q: "${item.query}"`);
        console.log(`   R: "${result.reply.replace(/\n/g, " ").slice(0, 110)}..."`);
      } catch (err: any) {
        console.error(`❌ Error en consulta #${globalIndex}: ${err?.message || err}`);
      }
    });

    await Promise.all(promises);
  }

  const durationSec = ((performance.now() - startTimeTotal) / 1000).toFixed(1);
  console.log("\n==========================================================");
  console.log("RESUMEN DE EJECUCIÓN DE PRUEBAS:");
  console.log(`• Total consultas procesadas : ${completedCount} / ${QUERIES.length}`);
  console.log(`• Consultas resueltas (turno): ${resolvedCount}`);
  console.log(`• Consultas derivadas (turno): ${unresolvedCount}`);
  console.log(`• Tokens totales estimados   : ${totalTokensAccum}`);
  console.log(`• Tiempo de procesamiento    : ${durationSec} segundos`);
  console.log("==========================================================");

  // Exportar preguntas no resueltas a CSV
  const csvData = exportUnresolvedToCSV();
  console.log(`✓ Archivo de preguntas no resueltas actualizado (filas: ${csvData.split("\n").length})`);
}

run();
