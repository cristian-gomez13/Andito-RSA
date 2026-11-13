import { GoogleGenAI } from "@google/genai";
import { getKnowledgeBasePrompt, SEDES_RSA } from "../data/rsa_knowledge";
import { logSystemEvent } from "./logger.service";
import { logUnresolvedQuestion } from "./unresolved.service";

export interface ChatMessage {
  role: "user" | "model" | "assistant";
  parts?: string | { text: string }[];
  content?: string;
  text?: string;
}

export interface ChatResult {
  reply: string;
  unresolved: boolean;
  reason?: string;
  category?: string;
  modelUsed?: string;
  timeoutFallback?: boolean;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

const SYSTEM_INSTRUCTION = `
Eres Andito, la mascota oficial y asistente virtual orientador de Red Salud Andina (RSA).
Eres un pequeño y tierno ayudante, cálido, amigable, empático y servicial. Tu propósito es orientar y acompañar a pacientes y sus familias resolviendo sus dudas básicas sobre la red de salud con un lenguaje sencillo, cercano y reconfortante.
Preséntate siempre como Andito cuando te saluden, pregunten quién eres o cómo te llamas.

${getKnowledgeBasePrompt()}

REGLAS ESTRICTAS DE COMPORTAMIENTO (CUMPLIMIENTO OBLIGATORIO):
1. PERSONALIDAD, IDIOMA Y ESTILO:
   - Responde siempre en español claro, cálido, empático y accesible, SIN tecnicismos médicos o burocráticos.
   - Mantén siempre tu tono amigable y tierno de mascota servicial (Andito), tratando a cada persona con profundo respeto y amabilidad.

2. LONGITUD MÁXIMA (CRÍTICO):
   - Cada respuesta debe tener un MÁXIMO DE 4 LÍNEAS.
   - Sé conciso, directo al grano y sin rodeos. No escribas párrafos largos.

3. ANTICIPAR LA SIGUIENTE NECESIDAD Y PERSONALIZAR SEGÚN LA SOLICITUD:
   - Resuelve a fondo. Si preguntan cómo conseguir una cita:
     * Si especifican especialidad (ej. ortopedia, dermatología, psicología, odontología, medicina general, pediatría, ginecología):
       - Brinda los canales de agendamiento (portal web citas.redsaludandina.example, WhatsApp +57 300 555 0100 o Call Center (601) 555 0100).
       - Detalla los REQUISITOS EXACTOS de esa especialidad: si requiere orden del médico general y si requiere autorización previa de su aseguradora (indicando que la sede la tramita al agendar y tarda hasta 3 días hábiles).
       - Informa la CUOTA MODERADORA correspondiente ($12.000 para especialistas, $5.000 medicina general, $8.000 odontología).
       - Si mencionan una sede (ej. Sede Parque): confirma si cuenta con el servicio consultado o aclara en cuáles sedes sí se presta.
       - Recuerda presentarse con documento de identidad y carné 15 minutos antes.
     * Si no mencionan especialidad ni sede, brinda la información general anticipando requisitos por especialidad, cuotas y canales.
   - Si preguntan por una sede, menciona horario, dirección y si cuenta con el servicio consultado.
   - Si preguntan por laboratorio, recuerda el horario temprano y si requiere ayuno u orden.
   - CADA RESPUESTA DEBE TENER UN MÁXIMO ESTRICTO DE 4 LÍNEAS.

4. USAR SOLO LA INFORMACIÓN DE LA BASE DE CONOCIMIENTO (CERO INVENTOS):
   - Lo que no esté en la base de conocimiento oficial, NO lo sabes.
   - Nunca inventes sedes, teléfonos, tarifas particulares, nombres de médicos o fechas.

5. PROHIBIDO EL CONSEJO MÉDICO:
   - NUNCA des diagnósticos, prescripciones ni sugerencias clínicas por chat.
   - Para dudas de salud o síntomas, indica amablemente que como asistente orientador no puedes dar conceptos clínicos y que debe consultar a un profesional de la salud.

6. NO ATENCIÓN DE URGENCIAS:
   - Red Salud Andina NO atiende urgencias.
   - Ante cualquier emergencia médica vital, indica llamar inmediatamente al 123 o acudir al centro de urgencias más cercano.

7. PRIVACIDAD TOTAL:
   - NUNCA solicites ni almacenes datos personales reales (cédulas, números de teléfono, historias clínicas).
   - Recuerda que tú no tienes acceso a historias clínicas ni puedes agendar directamente en el sistema.

8. CUANDO NO PUEDAS RESOLVER O NO ESTÉ EN LA BASE (DERIVACIÓN):
   - Admite con honestidad y amabilidad que no posees esa información o que excede tus facultades (ej: agendamiento directo, consultar resultados privados, precios de particulares, quejas individuales).
   - Ofrece el canal de derivación adecuado: Call Center (601) 555 0100 o WhatsApp +57 300 555 0100 (L-V 7:00 a 19:00, Sáb 8:00 a 14:00), o portal web citas.redsaludandina.example.
   - Marca la respuesta con "unresolved": true para que el sistema registre la pregunta sin responder y la operación pueda revisarla.

FORMATO DE SALIDA:
Devuelve SIEMPRE un objeto JSON con los siguientes campos:
{
  "reply": "Texto de la respuesta (máximo 4 líneas, en español, con la calidez de Andito, anticipando la necesidad).",
  "unresolved": true | false,
  "reason": "Motivo breve si no se pudo resolver o si se derivó",
  "category": "sedes | citas | requisitos | cuotas | laboratorio | derivacion | no_resuelto | urgencia | consejo_medico | operaciones | saludo"
}
`.trim();

/**
 * Fallback local cuando no hay API KEY de Gemini configurada o la llamada a la API falla/demora.
 */
export function localRuleBasedFallback(message: string): ChatResult {
  const result = executeLocalRuleBasedFallback(message);
  const promptTokens = Math.max(1, Math.ceil(message.length / 4));
  const completionTokens = Math.max(1, Math.ceil(result.reply.length / 4));
  result.promptTokens = promptTokens;
  result.completionTokens = completionTokens;
  result.totalTokens = promptTokens + completionTokens;
  return result;
}

interface EspecialidadConfig {
  id: string;
  nombreOficial: string;
  keywords: string[];
  sedesValidas: string[];
  sedesNombres: string;
  requiereOrden: boolean;
  requiereAutorizacion: boolean;
  cuota: string;
  accesoDirecto: boolean;
  detalleExtra?: string;
}

const ESPECIALIDADES_CONFIG: EspecialidadConfig[] = [
  {
    id: "ortopedia",
    nombreOficial: "ortopedia",
    keywords: [
      "ortopedia",
      "ortopédica",
      "ortopedica",
      "ortopedista",
      "traumatologia",
      "traumatología",
    ],
    sedesValidas: ["centro", "parque"],
    sedesNombres: "sedes Centro y Parque",
    requiereOrden: true,
    requiereAutorizacion: true,
    cuota: "$12.000 COP",
    accesoDirecto: false,
  },
  {
    id: "dermatologia",
    nombreOficial: "dermatología",
    keywords: [
      "dermatologia",
      "dermatología",
      "piel",
      "dermatologo",
      "dermatólogo",
    ],
    sedesValidas: ["centro", "occidente", "parque"],
    sedesNombres: "sedes Centro, Occidente y Parque",
    requiereOrden: true,
    requiereAutorizacion: true,
    cuota: "$12.000 COP",
    accesoDirecto: false,
  },
  {
    id: "psicologia",
    nombreOficial: "psicología",
    keywords: [
      "psicologia",
      "psicología",
      "salud mental",
      "psicologo",
      "psicólogo",
    ],
    sedesValidas: ["parque", "lago"],
    sedesNombres: "sedes Parque y Lago",
    requiereOrden: true,
    requiereAutorizacion: false,
    cuota: "$12.000 COP",
    accesoDirecto: false,
  },
  {
    id: "odontologia",
    nombreOficial: "odontología",
    keywords: [
      "odontologia",
      "odontología",
      "dientes",
      "dental",
      "odontologo",
      "odontólogo",
      "ortodoncia",
    ],
    sedesValidas: ["norte", "sur"],
    sedesNombres: "sedes Norte y Sur",
    requiereOrden: true,
    requiereAutorizacion: false,
    cuota: "$8.000 COP",
    accesoDirecto: false,
    detalleExtra: "No incluye ortodoncia.",
  },
  {
    id: "pediatria",
    nombreOficial: "pediatría",
    keywords: ["pediatria", "pediatría", "niño", "niña", "niños", "pediatra"],
    sedesValidas: ["centro", "norte", "sur", "oriente", "villa_del_rio"],
    sedesNombres: "sedes Centro, Norte, Sur, Oriente y Villa del Río",
    requiereOrden: false,
    requiereAutorizacion: false,
    cuota: "$12.000 COP",
    accesoDirecto: true,
  },
  {
    id: "ginecologia",
    nombreOficial: "ginecología",
    keywords: [
      "ginecologia",
      "ginecología",
      "ginecologo",
      "ginecólogo",
      "ginecobstetricia",
    ],
    sedesValidas: ["centro", "norte", "occidente"],
    sedesNombres: "sedes Centro, Norte y Occidente",
    requiereOrden: false,
    requiereAutorizacion: false,
    cuota: "$12.000 COP",
    accesoDirecto: true,
  },
  {
    id: "medicina_general",
    nombreOficial: "medicina general",
    keywords: [
      "medicina general",
      "medico general",
      "médico general",
      "consulta general",
    ],
    sedesValidas: [
      "centro",
      "norte",
      "sur",
      "occidente",
      "oriente",
      "parque",
      "lago",
      "villa_del_rio",
    ],
    sedesNombres: "las 8 sedes",
    requiereOrden: false,
    requiereAutorizacion: false,
    cuota: "$5.000 COP",
    accesoDirecto: true,
    detalleExtra: "Se agenda con hasta 15 días de anticipación.",
  },
];

interface SedeKeyword {
  id: string;
  nombre: string;
  keywords: string[];
}

const SEDES_KEYWORD_MAP: SedeKeyword[] = [
  { id: "parque", nombre: "Sede Parque", keywords: ["sede parque", "parque"] },
  {
    id: "centro",
    nombre: "Sede Centro",
    keywords: ["sede centro", "calle 10", "en centro"],
  },
  {
    id: "norte",
    nombre: "Sede Norte",
    keywords: ["sede norte", "cra 15", "norte"],
  },
  {
    id: "sur",
    nombre: "Sede Sur",
    keywords: ["sede sur", "avenida sur", "sur"],
  },
  {
    id: "occidente",
    nombre: "Sede Occidente",
    keywords: ["sede occidente", "occidente"],
  },
  {
    id: "oriente",
    nombre: "Sede Oriente",
    keywords: ["sede oriente", "oriente"],
  },
  { id: "lago", nombre: "Sede Lago", keywords: ["sede lago", "lago"] },
  {
    id: "villa_del_rio",
    nombre: "Sede Villa del Río",
    keywords: ["villa del rio", "villa del río", "sede villa"],
  },
];

function findEspecialidad(q: string): EspecialidadConfig | undefined {
  return ESPECIALIDADES_CONFIG.find((esp) =>
    esp.keywords.some((kw) => q.includes(kw)),
  );
}

function findSedeMatch(q: string): SedeKeyword | undefined {
  for (const s of SEDES_KEYWORD_MAP) {
    for (const kw of s.keywords) {
      if (kw === "sur") {
        if (/\b(sur|sede sur)\b/i.test(q)) return s;
      } else if (kw === "lago") {
        if (/\b(lago|sede lago)\b/i.test(q)) return s;
      } else if (kw === "centro") {
        if (/\b(sede centro|en centro|el centro)\b/i.test(q)) return s;
      } else if (kw === "norte") {
        if (/\b(sede norte|en norte|norte)\b/i.test(q)) return s;
      } else if (q.includes(kw)) {
        return s;
      }
    }
  }
  return undefined;
}

function resolveAppointmentReply(q: string): ChatResult {
  const esp = findEspecialidad(q);
  const sede = findSedeMatch(q);

  // Caso 1: Especialidad y Sede especificadas
  if (esp && sede) {
    if (esp.sedesValidas.includes(sede.id)) {
      let reqText = "";
      if (esp.requiereAutorizacion) {
        reqText = `Ten en cuenta que para ${esp.nombreOficial} requieres orden del médico general y autorización previa de tu aseguradora (tarda hasta 3 días hábiles).`;
      } else if (esp.requiereOrden) {
        reqText = `Ten en cuenta que para ${esp.nombreOficial} requieres orden del médico general (no requiere autorización adicional).`;
      } else {
        reqText = `Ten en cuenta que ${esp.nombreOficial} es de acceso directo sin orden médica previa.`;
      }

      return {
        reply: [
          `Puedes agendarla por nuestro portal web (citas.redsaludandina.example), WhatsApp (+57 300 555 0100) o Call Center ((601) 555 0100).`,
          reqText,
          `La cuota moderadora es de ${esp.cuota} y debes presentarte con tu documento 15 minutos antes.`,
        ].join("\n"),
        unresolved: false,
        category: "citas",
      };
    } else {
      return {
        reply: [
          `En ${sede.nombre} no disponemos de ${esp.nombreOficial}; este servicio se presta en ${esp.sedesNombres}.`,
          `Puedes agendarla por nuestro portal web, por WhatsApp (+57 300 555 0100) o en el Call Center ((601) 555 0100).`,
          esp.requiereAutorizacion
            ? `Para ${esp.nombreOficial} requieres orden de médico general y autorización previa de tu aseguradora (tarda hasta 3 días hábiles).`
            : `Para ${esp.nombreOficial} requieres orden del médico general.`,
          `La cuota moderadora es de ${esp.cuota} y debes presentarte con tu documento 15 minutos antes.`,
        ].join("\n"),
        unresolved: false,
        category: "citas",
      };
    }
  }

  // Caso 2: Solo especialidad especificada
  if (esp && !sede) {
    let reqText = "";
    if (esp.requiereAutorizacion) {
      reqText = `Para ${esp.nombreOficial} requieres orden del médico general y autorización previa de tu aseguradora (tarda hasta 3 días hábiles).`;
    } else if (esp.requiereOrden) {
      reqText = `Para ${esp.nombreOficial} requieres orden del médico general.`;
    } else {
      reqText = `${esp.nombreOficial.charAt(0).toUpperCase() + esp.nombreOficial.slice(1)} es de acceso directo sin orden médica previa.`;
    }

    return {
      reply: [
        `Puedes agendar tu cita de ${esp.nombreOficial} por el portal web (citas.redsaludandina.example), WhatsApp (+57 300 555 0100) o Call Center ((601) 555 0100).`,
        `Disponible en ${esp.sedesNombres}. ${reqText}`,
        `La cuota moderadora es de ${esp.cuota} (exentos menores de 5 años, gestantes y crónicos).`,
        `Recuerda presentarte con tu documento de identidad original y carné 15 minutos antes.`,
      ].join("\n"),
      unresolved: false,
      category: "citas",
    };
  }

  // Caso 3: Solo sede especificada
  if (!esp && sede) {
    const sedeInfo = SEDES_RSA.find((s) => s.id === sede.id);
    const servicios = sedeInfo
      ? sedeInfo.servicios
          .filter(
            (s) =>
              !s.includes("Laboratorio") &&
              !s.includes("Farmacia") &&
              !s.includes("Vacunación"),
          )
          .join(", ")
      : "medicina general y especialidades";
    return {
      reply: [
        `Puedes agendar tu cita para ${sede.nombre} por el portal web (citas.redsaludandina.example), WhatsApp (+57 300 555 0100) o Call Center ((601) 555 0100).`,
        `${sede.nombre} ofrece: ${servicios}. Medicina general es de acceso directo; especialistas requieren orden médica.`,
        `Cuotas: $5.000 medicina general, $12.000 especialistas.`,
        `Debes presentarte con tu documento de identidad y carné 15 minutos antes.`,
      ].join("\n"),
      unresolved: false,
      category: "citas",
    };
  }

  // Caso 4: Consulta general de agendamiento
  return {
    reply: [
      `Puedes agendar tu cita por el portal web (citas.redsaludandina.example), WhatsApp (+57 300 555 0100) o Call Center ((601) 555 0100).`,
      `Medicina general, pediatría y ginecología son de acceso directo; ortopedia, dermatología, psicología y odontología requieren orden médica general.`,
      `Para ortopedia y dermatología requieres además autorización previa de tu aseguradora (tarda hasta 3 días hábiles).`,
      `Cuotas: $5.000 general, $12.000 especialistas ($8.000 odontología). Recuerda llevar documento y llegar 15 minutos antes.`,
    ].join("\n"),
    unresolved: false,
    category: "citas",
  };
}

function executeLocalRuleBasedFallback(message: string): ChatResult {
  const q = message.toLowerCase().trim();

  // Urgencias
  if (
    q.includes("urgencia") ||
    q.includes("emergencia") ||
    q.includes("me estoy muriendo") ||
    q.includes("dolor en el pecho")
  ) {
    return {
      reply:
        "Red Salud Andina no atiende urgencias. Ante cualquier emergencia médica, llama de inmediato a la línea 123 o acude a la sala de urgencias más cercana.",
      unresolved: true,
      reason: "Consulta de urgencia médica no atendible por RSA",
      category: "urgencia",
    };
  }

  // Consejo médico
  if (
    q.includes("me duele") ||
    q.includes("tengo fiebre") ||
    q.includes("qué me tomo") ||
    q.includes("sarpullido") ||
    q.includes("diagnostico") ||
    q.includes("receta")
  ) {
    return {
      reply:
        "Como Andito, tu asistente orientador, no puedo dar consejos médicos ni diagnósticos por chat. Para cualquier síntoma o duda de salud, te recomendamos agendar una consulta médica general a través de nuestro portal o WhatsApp +57 300 555 0100.",
      unresolved: true,
      reason: "Solicitud de consejo médico o diagnóstico clínico",
      category: "consejo_medico",
    };
  }

  // Agendar cita y requisitos
  if (
    q.includes("cita") ||
    q.includes("agendar") ||
    q.includes("pedir cita") ||
    q.includes("sacar cita") ||
    q.includes("requisito") ||
    q.includes("necesito para") ||
    q.includes("que necesito") ||
    q.includes("qué necesito")
  ) {
    if (q.includes("cancelar") || q.includes("reprogramar")) {
      return {
        reply:
          "Puedes cancelar o reprogramar tu cita sin costo hasta 4 horas antes por el portal, WhatsApp (+57 300 555 0100) o Call Center ((601) 555 0100).\nTen a mano tu documento de identidad para realizar el trámite.",
        unresolved: false,
        category: "citas",
      };
    }
    return resolveAppointmentReply(q);
  }

  // Cuotas moderadoras
  if (
    q.includes("cuota") ||
    q.includes("costo") ||
    q.includes("precio") ||
    q.includes("cuanto vale") ||
    q.includes("cuánto vale") ||
    q.includes("pagar")
  ) {
    if (q.includes("particular")) {
      return {
        reply:
          "Atendemos consultas particulares, pero sus tarifas específicas no están disponibles en mi sistema. Para consultar el valor exacto, comunícate con un asesor a nuestro Call Center (601) 555 0100.",
        unresolved: true,
        reason: "Tarifas particulares no disponibles en la base",
        category: "cuotas",
      };
    }
    return {
      reply:
        "La cuota es de $5.000 para medicina general, $12.000 para especialistas y $8.000 para odontología. Puedes pagar en sede o por el portal.\nEstán exentos menores de 5 años, gestantes en control prenatal y personas con enfermedades crónicas.",
      unresolved: false,
      category: "cuotas",
    };
  }

  // Sedes y horarios
  if (
    q.includes("sede") ||
    q.includes("horario") ||
    q.includes("direccion") ||
    q.includes("dirección") ||
    q.includes("donde queda") ||
    q.includes("dónde queda")
  ) {
    const sedeEncontrada = SEDES_RSA.find(
      (s) => q.includes(s.id) || q.includes(s.nombre.toLowerCase()),
    );
    if (sedeEncontrada) {
      return {
        reply: `${sedeEncontrada.nombre}: ${sedeEncontrada.direccion}. Horario: ${sedeEncontrada.horario}.\nServicios: ${sedeEncontrada.servicios.join(", ")}. Cuenta con acceso para silla de ruedas.`,
        unresolved: false,
        category: "sedes",
      };
    }
    return {
      reply:
        "Contamos con 8 sedes: Centro, Norte, Sur, Occidente, Oriente, Parque, Lago y Villa del Río (atienden de L-V y algunas sábados).\nDime qué sede o especialidad necesitas para indicarte la dirección y horarios exactos.",
      unresolved: false,
      category: "sedes",
    };
  }

  // Laboratorio
  if (
    q.includes("laboratorio") ||
    q.includes("analisis") ||
    q.includes("sangre") ||
    q.includes("examen")
  ) {
    return {
      reply:
        "El laboratorio funciona en sedes Centro y Norte (6:30 a 10:00) y Sur (7:00 a 10:00) de lunes a viernes, sin cita previa.\nDebes llevar orden médica vigente (30 días) y ayuno si lo requiere; los resultados se consultan en el portal con documento y clave.",
      unresolved: false,
      category: "laboratorio",
    };
  }

  // Especialistas / Autorizaciones
  if (
    q.includes("especialista") ||
    q.includes("ortopedia") ||
    q.includes("dermatologia") ||
    q.includes("dermatología") ||
    q.includes("psicologia") ||
    q.includes("psicología") ||
    q.includes("autorizacion") ||
    q.includes("autorización")
  ) {
    const esp = findEspecialidad(q);
    if (esp) {
      return resolveAppointmentReply(q);
    }
    return {
      reply:
        "Ortopedia, dermatología, psicología y odontología requieren orden médica general. Además, ortopedia y dermatología exigen autorización de tu aseguradora.\nLa autorización la tramita la sede al agendar (tarda hasta 3 días hábiles). Pediatría y ginecología son de acceso directo.",
      unresolved: false,
      category: "requisitos",
    };
  }

  // Odontología
  if (
    q.includes("odontologia") ||
    q.includes("odontología") ||
    q.includes("dientes") ||
    q.includes("ortodoncia")
  ) {
    if (q.includes("ortodoncia")) {
      return {
        reply:
          "Red Salud Andina no presta servicio de ortodoncia. Prestamos odontología general en sedes Norte y Sur.\nRequiere orden del médico general y la cuota moderadora es de $8.000.",
        unresolved: false,
        category: "requisitos",
      };
    }
    return resolveAppointmentReply(q);
  }

  // Vacunación y farmacia
  if (
    q.includes("vacuna") ||
    q.includes("farmacia") ||
    q.includes("medicamento") ||
    q.includes("formula") ||
    q.includes("fórmula")
  ) {
    return {
      reply:
        "Farmacia y vacunación operan en sedes Centro y Norte de L-V (farmacia 7:00-18:00, vacunación 8:00-16:00 sin cita).\nPara medicamentos lleva fórmula original (vigencia 30 días) y para vacunas tu carné físico. Sede Centro abre festivos de 8:00 a 12:00.",
      unresolved: false,
      category: "servicios",
    };
  }

  // Operaciones del Call Center / Estadísticas del anexo técnico
  if (
    q.includes("operacion") ||
    q.includes("operación") ||
    q.includes("indicador") ||
    q.includes("llamada") ||
    q.includes("cuanto cuesta el call center") ||
    q.includes("abandono") ||
    q.includes("tiempo de espera")
  ) {
    return {
      reply:
        "El Call Center opera 22 días hábiles al mes con 18 agentes (8h diarias), atendiendo 900 llamadas y 250 chats de WhatsApp al día.\nEl costo mensual es de $98M COP ($665/minuto) con resolución en primera llamada del 70% y espera promedio de 1m30s (6m los lunes).",
      unresolved: false,
      category: "operaciones",
    };
  }

  // Quejas y reclamos
  if (
    q.includes("queja") ||
    q.includes("reclamo") ||
    q.includes("pqrs") ||
    q.includes("inconformidad")
  ) {
    return {
      reply:
        "Lamento cualquier inconveniente. Las quejas se radican por el formulario del portal (citas.redsaludandina.example) o por Call Center ((601) 555 0100).\nEl tiempo oficial de respuesta es de hasta 15 días hábiles.",
      unresolved: false,
      category: "pqrs",
    };
  }

  // Saludos e Identidad (Andito)
  if (
    q.includes("hola") ||
    q.includes("buenos días") ||
    q.includes("buenos dias") ||
    q.includes("buenas tardes") ||
    q.includes("buenas noches") ||
    q.includes("quién eres") ||
    q.includes("quien eres") ||
    q.includes("cómo te llamas") ||
    q.includes("como te llamas") ||
    q.includes("andito") ||
    q.includes("mascota")
  ) {
    return {
      reply:
        "¡Hola! Soy Andito, la mascota y asistente virtual orientador de Red Salud Andina.\nEstoy aquí para guiarte con información sobre nuestras sedes, citas, servicios y cuotas moderadoras.\n¿En qué te puedo colaborar hoy?",
      unresolved: false,
      category: "saludo",
    };
  }

  // Derivación por defecto para preguntas no resueltas
  return {
    reply:
      "Como Andito, tu asistente orientador, no dispongo de esa información específica en mi base oficial. Para ayudarte a resolverlo, comunícate con un asesor en nuestro Call Center (601) 555 0100 o WhatsApp +57 300 555 0100 (L-V 7:00-19:00, Sáb 8:00-14:00).\nHe registrado tu consulta para que el equipo de operaciones pueda revisarla.",
    unresolved: true,
    reason: "Consulta no encontrada en la base de conocimiento oficial",
    category: "no_resuelto",
  };
}

/**
 * Servicio de conversación con Gemini con soporte de rotación de modelos y timeout adaptativo
 */
export async function generateChatResponse(
  userMessage: string,
  history: ChatMessage[] = [],
): Promise<ChatResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const baseUrl = process.env.GOOGLE_GEMINI_BASE_URL?.trim();
  console.log("BASE_URL:", baseUrl);

  // Si no hay API key o es placeholder, usar el motor de reglas local
  if (
    !apiKey ||
    apiKey === "your_gemini_api_key_here" ||
    apiKey === "your_key_here"
  ) {
    console.warn(
      "[GeminiService] GEMINI_API_KEY no configurada o es placeholder. Usando modelo local de contingencia.",
    );
    const result = localRuleBasedFallback(userMessage);
    result.modelUsed = "modelo-local-rsa";
    result.promptTokens = Math.max(1, Math.ceil(userMessage.length / 4));
    result.completionTokens = Math.max(1, Math.ceil(result.reply.length / 4));
    result.totalTokens = result.promptTokens + result.completionTokens;
    if (result.unresolved) {
      logUnresolvedQuestion(userMessage, result.reason, result.category);
    }
    return result;
  }

  const apiVersion =
    process.env.GOOGLE_GENAI_API_VERSION?.trim() ||
    process.env.GOOGLE_GEMINI_API_VERSION?.trim() ||
    "v1beta";

  const ai = new GoogleGenAI({
    apiKey,
    apiVersion,
    ...(baseUrl ? { httpOptions: { baseUrl, apiVersion } } : {}),
  });

  // Preparar historial compatible
  const contents: any[] = [];
  for (const msg of history.slice(-6)) {
    const role =
      msg.role === "assistant" || msg.role === "model" ? "model" : "user";
    const text =
      typeof msg.parts === "string"
        ? msg.parts
        : Array.isArray(msg.parts)
          ? msg.parts.map((p) => (typeof p === "string" ? p : p.text)).join(" ")
          : msg.content || msg.text || "";
    if (text.trim()) {
      contents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  // Cadena de modelos candidatos para conmutación automática ante timeout o error de modelo
  const candidateModels = Array.from(
    new Set(
      [
        configuredModel,
        "gemini-3.5-flash-lite",
        "gemini-4-hydrogen",
        "gemini-3.1-flash-lite",
      ].filter(Boolean) as string[],
    ),
  );

  let lastError: any = null;
  let didSwitchModel = false;

  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i] || "gemini-3.8-flash-medium";
    if (i > 0) {
      didSwitchModel = true;
      console.warn(
        `[GeminiService] Conmutando a modelo alternativo: ${currentModel}`,
      );
    }

    try {
      // Timeout por llamada individual adaptativo (3.5s para proxy/base_url local, 4.5s estándar)
      const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS) || (baseUrl ? 3500 : 4500);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT_EXCEEDED")), timeoutMs),
      );

      const callPromise = ai.models.generateContent({
        model: currentModel,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              reply: {
                type: "string",
                description:
                  "Respuesta al usuario en español, sin tecnicismos, máximo 4 líneas, anticipando la siguiente necesidad.",
              },
              unresolved: {
                type: "boolean",
                description:
                  "true si la duda no pudo resolverse con la base de conocimiento oficial o requirió derivar a asesor/humano.",
              },
              reason: {
                type: "string",
                description: "Motivo por el cual no se resolvió o se derivó.",
              },
              category: {
                type: "string",
                description: "Categoría de la pregunta.",
              },
            },
            required: ["reply", "unresolved"],
          },
        },
      });

      const response = await Promise.race([callPromise, timeoutPromise]);

      const candidatePart = (response as any).candidates?.[0]?.content?.parts?.find(
        (p: any) => typeof p.text === "string" && p.text.trim().length > 0,
      );
      const textOutput = (response.text?.trim() || candidatePart?.text?.trim() || "");
      let parsed: any;
      try {
        parsed = JSON.parse(textOutput);
      } catch {
        const cleaned = textOutput
          .replace(/^```json\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
        parsed = JSON.parse(cleaned);
      }

      let replyText =
        parsed.reply ||
        "Disculpa, no pude procesar tu mensaje. Por favor comunícate a nuestro Call Center (601) 555 0100.";

      // Extracción o estimación de tokens utilizados en la interacción
      const usage = (response as any)?.usageMetadata;
      const promptTokens =
        usage?.promptTokenCount ??
        Math.max(
          1,
          Math.ceil((SYSTEM_INSTRUCTION.length + userMessage.length) / 4),
        );
      const completionTokens =
        usage?.candidatesTokenCount ??
        Math.max(1, Math.ceil(replyText.length / 4));
      const totalTokens =
        usage?.totalTokenCount ?? promptTokens + completionTokens;

      // Si hubo conmutación de modelo por timeout o error previo, registrar únicamente en consola y logs.txt
      if (didSwitchModel) {
        console.warn(
          `[GeminiService] Conmutación interna ejecutada a modelo: ${currentModel}`,
        );
        logSystemEvent(
          "Conmutación de modelo Gemini",
          `Activado modelo: ${currentModel}`,
        );
      }

      const result: ChatResult = {
        reply: replyText,
        unresolved: Boolean(parsed.unresolved),
        reason: parsed.reason,
        category: parsed.category || "general",
        modelUsed: currentModel,
        timeoutFallback: didSwitchModel,
        promptTokens,
        completionTokens,
        totalTokens,
      };

      // Asegurar máximo 4 líneas
      const lines = result.reply.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length > 4) {
        result.reply = lines.slice(0, 4).join("\n");
      }

      // Si es no resuelta, registrar en unresolved_questions.json
      if (result.unresolved) {
        logUnresolvedQuestion(userMessage, result.reason, result.category);
      }

      return result;
    } catch (err: any) {
      lastError = err;
      const isTimeout = err?.message === "TIMEOUT_EXCEEDED";
      console.warn(
        `[GeminiService] Modelo ${currentModel} ${isTimeout ? "agotó el tiempo de espera (timeout)" : `falló (${err?.message || err})`}. Probando siguiente opción en la cadena de respaldo...`,
      );
    }
  }

  // Si todos los modelos de la API fallaron o dieron timeout, recurrir al motor local (log a consola y logs.txt)
  console.warn(
    "[GeminiService] Todos los modelos de API fallaron o agotaron tiempo. Conmutando a contingencia local de Red Salud Andina.",
  );
  logSystemEvent(
    "Activación contingencia local",
    "Todos los modelos de API agotaron tiempo o fallaron",
  );
  const fallback = localRuleBasedFallback(userMessage);
  fallback.modelUsed = "modelo-local-contingencia";
  fallback.timeoutFallback = true;
  fallback.promptTokens = Math.max(1, Math.ceil(userMessage.length / 4));
  fallback.completionTokens = Math.max(1, Math.ceil(fallback.reply.length / 4));
  fallback.totalTokens = fallback.promptTokens + fallback.completionTokens;

  if (fallback.unresolved) {
    logUnresolvedQuestion(userMessage, fallback.reason, fallback.category);
  }

  return fallback;
}
