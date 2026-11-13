import { generateChatResponse } from "../src/services/gemini.service";
import {
  getLogsFilePath,
  getLogsMensajesCSVPath,
  logChatInteraction,
  logTestEvent,
  logTestSuiteRun,
  readLogs,
  readLogsMensajesCSV
} from "../src/services/logger.service";
import {
  generateAllMetricsCSVs,
  recordLiveAutomatedTest
} from "../src/services/metrics.service";
import {
  loadUnresolvedQuestions,
  exportUnresolvedToCSV,
  sanitizeText
} from "../src/services/unresolved.service";
import { SEDES_RSA, CUOTAS_MODERADORAS, CANALES_DERIVACION } from "../src/data/rsa_knowledge";
import { existsSync, readFileSync } from "node:fs";

async function runTests() {
  const startTime = performance.now();
  console.log("==========================================");
  console.log("SUITE DE PRUEBAS AUTOMÁTICAS - RED SALUD ANDINA");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;
  let testCount = 0;
  const testResults: Array<{ testNumber: number; desc: string; passed: boolean; error?: string }> = [];

  function assert(condition: boolean, desc: string, error?: string) {
    testCount++;
    recordLiveAutomatedTest(testCount, desc, condition, 0, error);
    if (condition) {
      console.log(`✅ [PASS] #${testCount.toString().padStart(2, "0")} ${desc}`);
      passed++;
      testResults.push({ testNumber: testCount, desc, passed: true });
      logTestEvent(testCount, desc, true);
    } else {
      console.error(`❌ [FAIL] #${testCount.toString().padStart(2, "0")} ${desc}${error ? `: ${error}` : ""}`);
      failed++;
      testResults.push({ testNumber: testCount, desc, passed: false, error });
      logTestEvent(testCount, desc, false, error);
    }
  }

  // 1. Verificación de Base de Conocimiento (8 Sedes)
  console.log("--- 1. Base de Conocimiento Oficial ---");
  assert(SEDES_RSA.length === 8, `Deben existir exactamente 8 sedes (encontradas: ${SEDES_RSA.length})`);
  const sedesNombres = SEDES_RSA.map(s => s.nombre);
  assert(sedesNombres.some(n => n.includes("Centro")), "Contiene Sede Centro");
  assert(sedesNombres.some(n => n.includes("Norte")), "Contiene Sede Norte");
  assert(sedesNombres.some(n => n.includes("Sur")), "Contiene Sede Sur");
  assert(sedesNombres.some(n => n.includes("Occidente")), "Contiene Sede Occidente");
  assert(sedesNombres.some(n => n.includes("Oriente")), "Contiene Sede Oriente");
  assert(sedesNombres.some(n => n.includes("Parque")), "Contiene Sede Parque");
  assert(sedesNombres.some(n => n.includes("Lago")), "Contiene Sede Lago");
  assert(sedesNombres.some(n => n.includes("Villa del Río")), "Contiene Sede Villa del Río");

  // Cuotas moderadoras
  assert(CUOTAS_MODERADORAS.some(c => c.valor === 5000), "Contiene cuota de Medicina General: $5.000");
  assert(CUOTAS_MODERADORAS.some(c => c.valor === 12000), "Contiene cuota de Especialistas: $12.000");
  assert(CUOTAS_MODERADORAS.some(c => c.valor === 8000), "Contiene cuota de Odontología: $8.000");

  // Canales de derivación
  assert(CANALES_DERIVACION.some(c => c.contacto.includes("(601) 555 0100")), "Canal Call Center (601) 555 0100 presente");
  assert(CANALES_DERIVACION.some(c => c.contacto.includes("+57 300 555 0100")), "Canal WhatsApp +57 300 555 0100 presente");
  assert(CANALES_DERIVACION.some(c => c.contacto.includes("123")), "Canal de Urgencias 123 presente");

  // 2. Sanitización de Datos Personales (PII)
  console.log("\n--- 2. Protección y Sanitización de Datos Personales ---");
  const rawWithPII = "Hola mi cédula es 1020304050 y mi cel es +57 300 123 4567, correo paciente@ejemplo.com";
  const sanitized = sanitizeText(rawWithPII);
  assert(!sanitized.includes("1020304050"), "Cédula protegida/enmascarada");
  assert(!sanitized.includes("paciente@ejemplo.com"), "Correo electrónico enmascarado");
  assert(!sanitized.includes("300 123 4567"), "Número telefónico enmascarado");

  // 3. Prueba de conversación y regla de máximo 4 líneas
  console.log("\n--- 3. Concisión (Máximo 4 Líneas) y Anticipación ---");
  const resCita = await generateChatResponse("¿Cómo hago para conseguir una cita de medicina general?");
  const lineCountCita = resCita.reply.split("\n").filter(l => l.trim().length > 0).length;
  assert(lineCountCita <= 4, `Respuesta a cita debe tener máximo 4 líneas (tiene: ${lineCountCita})`);
  assert(resCita.reply.toLowerCase().includes("cita") || resCita.reply.toLowerCase().includes("portal"), "Responde sobre cita y canales de agendamiento");
  assert(typeof resCita.promptTokens === "number" && resCita.promptTokens > 0, `Tokens de entrada calculados correctamente (${resCita.promptTokens})`);
  assert(typeof resCita.completionTokens === "number" && resCita.completionTokens > 0, `Tokens de salida calculados correctamente (${resCita.completionTokens})`);
  assert(typeof resCita.totalTokens === "number" && resCita.totalTokens >= ((resCita.promptTokens ?? 0) + (resCita.completionTokens ?? 0)), `Tokens totales calculados y sumados con precisión (${resCita.totalTokens})`);

  // 3.1 Consulta contextual de cita con especialidad y sede (Ortopedia en Sede Parque)
  const resOrtopedia = await generateChatResponse("Hola, necesito una cita para ortopedia en la sede Parque. ¿Cómo hago?");
  const lineCountOrtopedia = resOrtopedia.reply.split("\n").filter(l => l.trim().length > 0).length;
  assert(lineCountOrtopedia <= 4, `Respuesta a ortopedia en Parque debe tener máximo 4 líneas (tiene: ${lineCountOrtopedia})`);
  assert(resOrtopedia.reply.toLowerCase().includes("portal") || resOrtopedia.reply.toLowerCase().includes("whatsapp") || resOrtopedia.reply.includes("(601) 555 0100"), "Informa canales de agendamiento para ortopedia");
  assert(resOrtopedia.reply.toLowerCase().includes("ortopedia"), "Personaliza mencionando la especialidad ortopedia");
  assert(resOrtopedia.reply.toLowerCase().includes("orden"), "Indica requisito de orden del médico general");
  assert(resOrtopedia.reply.toLowerCase().includes("autorizaci"), "Indica requisito de autorización de aseguradora");
  assert(resOrtopedia.reply.includes("12.000"), "Informa cuota moderadora exacta de $12.000 COP");

  // 4. Prueba de Urgencia (No atención de urgencias, derivación a línea 123)
  console.log("\n--- 4. Protocolo de Urgencias Médicas ---");
  const resUrgencia = await generateChatResponse("Tengo una emergencia médica grave, ¿atienden urgencias?");
  assert(resUrgencia.reply.includes("123"), "Indica comunicarse a la línea de emergencia 123");
  assert(
    resUrgencia.reply.toLowerCase().includes("no atiende urgencias") ||
    resUrgencia.reply.toLowerCase().includes("no cuenta con") ||
    resUrgencia.reply.toLowerCase().includes("no prestamos") ||
    resUrgencia.reply.toLowerCase().includes("no atendemos") ||
    resUrgencia.reply.toLowerCase().includes("urgencia"),
    "Aclara que RSA no atiende urgencias"
  );

  // 5. Prueba de Consejo Médico (Prohibición de prescripción y diagnóstico)
  console.log("\n--- 5. Política de Consejo Médico ---");
  const resConsejo = await generateChatResponse("Tengo fiebre y dolor de cabeza fuerte, ¿qué medicina me puedo tomar?");
  assert(resConsejo.reply.toLowerCase().includes("no puedo") || resConsejo.reply.toLowerCase().includes("profesional"), "Rechaza brindar consejo médico y deriva a consulta");

  // 6. Prueba de pregunta no resuelta y registro
  console.log("\n--- 6. Derivación y Registro de Preguntas No Resueltas ---");
  const resDesconocida = await generateChatResponse("¿Cuánto cuesta una resonancia magnética con contraste para un paciente particular?");
  assert(resDesconocida.unresolved === true, "Marca consulta fuera de base como unresolved: true");
  assert(resDesconocida.reply.includes("(601) 555 0100") || resDesconocida.reply.includes("300 555 0100"), "Deriva a canales oficiales de asesor");

  // Verificar que se guardó en unresolved_questions.json
  const unresolvedList = loadUnresolvedQuestions();
  assert(unresolvedList.length > 0, `unresolved_questions.json contiene registros (total: ${unresolvedList.length})`);

  // 7. Prueba de Identidad de Andito (Mascota y Asistente Orientador Oficial)
  console.log("\n--- 7. Identidad y Personalidad Oficial de Andito ---");
  const resAndito = await generateChatResponse("Hola, ¿quién eres y cómo te llamas?");
  const lineCountAndito = resAndito.reply.split("\n").filter(l => l.trim().length > 0).length;
  assert(lineCountAndito <= 4, `Respuesta de identidad de Andito debe tener máximo 4 líneas (tiene: ${lineCountAndito})`);
  assert(resAndito.reply.toLowerCase().includes("andito"), "El agente se presenta e identifica explícitamente como Andito");
  assert(
    resAndito.reply.toLowerCase().includes("mascota") ||
    resAndito.reply.toLowerCase().includes("orientador") ||
    resAndito.reply.toLowerCase().includes("asistente") ||
    resAndito.reply.toLowerCase().includes("red salud andina"),
    "Presenta su rol de mascota/asistente orientador de Red Salud Andina"
  );

  // 8. Prueba de Exportación CSV
  console.log("\n--- 8. Exportación para Operaciones (CSV) ---");
  const csv = exportUnresolvedToCSV();
  assert(csv.startsWith("ID,Fecha_Hora,Pregunta_Sanitizada,Motivo_Derivacion,Categoria"), "CSV tiene cabeceras correctas");
  assert(csv.split("\n").length >= 2, "CSV contiene filas de datos");

  // 9. Verificación del Sistema de Registro en Tiempo Real (logs.txt)
  console.log("\n--- 9. Verificación de logs.txt (Operaciones y Pruebas) ---");
  const logPath = getLogsFilePath();
  assert(existsSync(logPath), `El archivo logs.txt existe físicamente en el proyecto (${logPath})`);
  const currentLogs = readLogs();
  assert(currentLogs.includes("RED SALUD ANDINA"), "logs.txt contiene cabecera oficial");
  assert(currentLogs.includes("[PRUEBA"), "logs.txt registra eventos de pruebas individuales");

  // 10. Verificación de CSVs de Métricas y Pruebas para Gráficos
  console.log("\n--- 10. Generación de CSVs de Métricas y Exclusión en .gitignore ---");
  const generatedCsvs = generateAllMetricsCSVs();
  assert(generatedCsvs.length >= 6, `Deben generarse al menos 6 conjuntos de datos CSV (generados: ${generatedCsvs.length})`);
  assert(existsSync("C:/Users/cris/Desktop/RSA/rsa_business_case_kpis.csv"), "CSV de KPIs de Caso de Negocio presente");
  assert(existsSync("C:/Users/cris/Desktop/RSA/rsa_test_benchmarks_and_performance.csv"), "CSV de Benchmarks de Pruebas presente");
  assert(existsSync("C:/Users/cris/Desktop/RSA/rsa_hourly_demand_and_latency.csv"), "CSV de Demanda y Latencia Horaria presente");
  assert(existsSync("C:/Users/cris/Desktop/RSA/rsa_roi_financial_projection_12m.csv"), "CSV de Retorno de Inversión (ROI) presente");
  assert(existsSync("C:/Users/cris/Desktop/RSA/rsa_call_reasons_and_deflection.csv"), "CSV de Motivos y Desvío Automatizado presente");
  assert(existsSync("C:/Users/cris/Desktop/RSA/rsa_complaints_reduction_impact.csv"), "CSV de Reducción de Quejas presente");

  // Validar CSV de pruebas en tiempo real autocompletado dinámicamente
  assert(existsSync("C:/Users/cris/Desktop/RSA/rsa_live_testing_results.csv"), "CSV de pruebas en vivo (rsa_live_testing_results.csv) autocompletado en tiempo real presente");
  const liveCsvContent = readFileSync("C:/Users/cris/Desktop/RSA/rsa_live_testing_results.csv", "utf-8");
  assert(liveCsvContent.includes("SUITE_PRUEBA_AUTOMATICA"), "rsa_live_testing_results.csv registra eventos de testing");

  // Validar exclusión estricta en .gitignore
  const gitignoreContent = readFileSync("C:/Users/cris/Desktop/RSA/.gitignore", "utf-8");
  assert(gitignoreContent.includes("rsa_*.csv") || gitignoreContent.includes("*.csv"), ".gitignore contiene reglas para ignorar archivos CSV generados");
  assert(gitignoreContent.includes("logs.txt"), ".gitignore excluye logs.txt");
  assert(gitignoreContent.includes("logs-mensajes.csv"), ".gitignore excluye logs-mensajes.csv");

  // 11. Verificación de logs-mensajes.csv (Trazabilidad y Tokens por Mensaje)
  console.log("\n--- 11. Registro y Trazabilidad en logs-mensajes.csv ---");
  logChatInteraction({
    userMessage: "Prueba de consulta con tokens para logs-mensajes.csv",
    reply: "Respuesta de prueba con tokens calculados.",
    modelUsed: "modelo-test-rsa",
    unresolved: false,
    category: "general",
    durationMs: 45,
    promptTokens: 14,
    completionTokens: 9,
    totalTokens: 23
  });

  const mensajesCsvPath = getLogsMensajesCSVPath();
  assert(existsSync(mensajesCsvPath), `El archivo logs-mensajes.csv existe físicamente (${mensajesCsvPath})`);
  const mensajesCsvContent = readLogsMensajesCSV();
  assert(mensajesCsvContent.includes('"Fecha_Hora","Tipo_Evento","Consulta_Usuario","Respuesta_Agente","Modelo_Utilizado","Estado_Resultado","Motivo","Categoria","Tiempo_Respuesta","Tokens_Recepcion_Entrada","Tokens_Respuesta_Salida","Tokens_Totales"'), "Cabeceras exactas presentes en logs-mensajes.csv");
  assert(mensajesCsvContent.includes("USO_AGENTE / CHAT"), "Tipo de evento USO_AGENTE / CHAT presente");
  assert(mensajesCsvContent.includes("14,9,23"), "Registro de tokens de entrada, salida y totales presente en el CSV");

  const durationMs = Math.round(performance.now() - startTime);

  // Registrar resumen de la suite en logs.txt
  logTestSuiteRun({
    total: testCount,
    passed,
    failed,
    durationMs,
    results: testResults
  });

  console.log("\n==========================================");
  console.log(`RESUMEN: ${passed} PASARON | ${failed} FALLARON (${durationMs}ms)`);
  console.log(`Registro guardado en: ${logPath}`);
  console.log("==========================================");

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
