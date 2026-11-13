import { useState, useEffect, useRef } from "react";
import "./index.css";
import { MainUi } from "./MainUi";
import { Sidebar } from "./Sidebar";
import type { ChatMessageItem } from "./types/chat";

const RECENT_QUERIES_KEY = "rsa_recent_topics";

interface ClientSpecialtyConfig {
  id: string;
  name: string;
  keywords: string[];
  validSedes: string[];
  sedesNames: string;
  order: boolean;
  auth: boolean;
  copay: string;
}

const CLIENT_SPECIALTIES: ClientSpecialtyConfig[] = [
  {
    id: "ortopedia",
    name: "ortopedia",
    keywords: ["ortopedia", "ortopédica", "ortopedica", "ortopedista"],
    validSedes: ["centro", "parque"],
    sedesNames: "sedes Centro y Parque",
    order: true,
    auth: true,
    copay: "$12.000 COP",
  },
  {
    id: "dermatologia",
    name: "dermatología",
    keywords: ["dermatologia", "dermatología", "piel", "dermatologo", "dermatólogo"],
    validSedes: ["centro", "occidente", "parque"],
    sedesNames: "sedes Centro, Occidente y Parque",
    order: true,
    auth: true,
    copay: "$12.000 COP",
  },
  {
    id: "psicologia",
    name: "psicología",
    keywords: ["psicologia", "psicología", "salud mental", "psicologo", "psicólogo"],
    validSedes: ["parque", "lago"],
    sedesNames: "sedes Parque y Lago",
    order: true,
    auth: false,
    copay: "$12.000 COP",
  },
  {
    id: "odontologia",
    name: "odontología",
    keywords: ["odontologia", "odontología", "dientes", "dental", "odontologo", "odontólogo"],
    validSedes: ["norte", "sur"],
    sedesNames: "sedes Norte y Sur",
    order: true,
    auth: false,
    copay: "$8.000 COP",
  },
  {
    id: "pediatria",
    name: "pediatría",
    keywords: ["pediatria", "pediatría", "niño", "niña", "niños", "pediatra"],
    validSedes: ["centro", "norte", "sur", "oriente", "villa_del_rio"],
    sedesNames: "sedes Centro, Norte, Sur, Oriente y Villa del Río",
    order: false,
    auth: false,
    copay: "$12.000 COP",
  },
  {
    id: "ginecologia",
    name: "ginecología",
    keywords: ["ginecologia", "ginecología", "ginecologo", "ginecólogo"],
    validSedes: ["centro", "norte", "occidente"],
    sedesNames: "sedes Centro, Norte y Occidente",
    order: false,
    auth: false,
    copay: "$12.000 COP",
  },
  {
    id: "medicina_general",
    name: "medicina general",
    keywords: ["medicina general", "medico general", "médico general"],
    validSedes: ["centro", "norte", "sur", "occidente", "oriente", "parque", "lago", "villa_del_rio"],
    sedesNames: "las 8 sedes",
    order: false,
    auth: false,
    copay: "$5.000 COP",
  },
];

const CLIENT_SEDES = [
  { id: "parque", name: "Sede Parque", kw: "parque" },
  { id: "centro", name: "Sede Centro", kw: "centro" },
  { id: "norte", name: "Sede Norte", kw: "norte" },
  { id: "sur", name: "Sede Sur", kw: "sur" },
  { id: "occidente", name: "Sede Occidente", kw: "occidente" },
  { id: "oriente", name: "Sede Oriente", kw: "oriente" },
  { id: "lago", name: "Sede Lago", kw: "lago" },
  { id: "villa_del_rio", name: "Sede Villa del Río", kw: "villa del" },
];

/**
 * Motor de contingencia de cliente en caso de desconexión del servidor o fallo de red.
 */
function getClientContingencyReply(query: string): { reply: string; unresolved: boolean } {
  const q = query.toLowerCase().trim();

  if (q.includes("urgencia") || q.includes("emergencia")) {
    return {
      reply: "Red Salud Andina no atiende urgencias. Ante cualquier emergencia médica, llama de inmediato a la línea 123 o acude a la sala de urgencias más cercana.",
      unresolved: true
    };
  }
  if (q.includes("sede") || q.includes("horario") || q.includes("donde queda")) {
    return {
      reply: "Contamos con 8 sedes: Centro (Cll 10 # 5-20), Norte (Cra 15 # 120-45), Sur, Occidente, Oriente, Parque, Lago y Villa del Río.\nHorarios habituales: lunes a viernes y sábados mediodía. Call Center: (601) 555 0100.",
      unresolved: false
    };
  }
  if (q.includes("cuota") || q.includes("costo") || q.includes("precio") || q.includes("pagar")) {
    return {
      reply: "Cuotas moderadoras: $5.000 medicina general, $12.000 especialistas y $8.000 odontología.\nExentos: menores de 5 años, mujeres gestantes en control prenatal y pacientes con patologías crónicas.",
      unresolved: false
    };
  }
  if (
    q.includes("requisito") ||
    q.includes("cita") ||
    q.includes("agendar") ||
    q.includes("pedir cita") ||
    q.includes("ortopedia") ||
    q.includes("dermatologia") ||
    q.includes("dermatología") ||
    q.includes("psicologia") ||
    q.includes("psicología") ||
    q.includes("odontologia") ||
    q.includes("odontología")
  ) {
    const esp = CLIENT_SPECIALTIES.find((s) => s.keywords.some((k) => q.includes(k)));
    const sede = CLIENT_SEDES.find((s) => q.includes(s.kw));

    if (esp && sede) {
      if (esp.validSedes.includes(sede.id)) {
        const req = esp.auth
          ? `Ten en cuenta que para ${esp.name} requieres orden del médico general y autorización previa de tu aseguradora (tarda hasta 3 días hábiles).`
          : esp.order
            ? `Ten en cuenta que para ${esp.name} requieres orden del médico general (no requiere autorización adicional).`
            : `Ten en cuenta que ${esp.name} es de acceso directo sin orden médica previa.`;
        return {
          reply: `Puedes agendarla por nuestro portal web (citas.redsaludandina.example), WhatsApp (+57 300 555 0100) o Call Center ((601) 555 0100).\n${req}\nLa cuota moderadora es de ${esp.copay} y debes presentarte con tu documento 15 minutos antes.`,
          unresolved: false,
        };
      } else {
        return {
          reply: `En ${sede.name} no disponemos de ${esp.name}; este servicio se presta en ${esp.sedesNames}.\nPuedes agendarla por portal web, WhatsApp (+57 300 555 0100) o Call Center ((601) 555 0100).\nLa cuota moderadora es de ${esp.copay} y debes presentarte con tu documento 15 minutos antes.`,
          unresolved: false,
        };
      }
    }

    if (esp) {
      const req = esp.auth
        ? `Para ${esp.name} requieres orden del médico general y autorización previa de tu aseguradora (tarda hasta 3 días hábiles).`
        : esp.order
          ? `Para ${esp.name} requieres orden del médico general.`
          : `${esp.name.charAt(0).toUpperCase() + esp.name.slice(1)} es de acceso directo sin orden previa.`;
      return {
        reply: `Puedes agendar tu cita de ${esp.name} por portal web (citas.redsaludandina.example), WhatsApp (+57 300 555 0100) o Call Center ((601) 555 0100).\nDisponible en ${esp.sedesNames}. ${req}\nLa cuota moderadora es de ${esp.copay} y debes presentarte con tu documento 15 minutos antes.`,
        unresolved: false,
      };
    }

    return {
      reply: "Medicina general, pediatría y ginecología no requieren orden previa. Ortopedia, dermatología, psicología y odontología requieren orden médica general.\nPuedes agendar por WhatsApp (+57 300 555 0100) o portal citas.redsaludandina.example.",
      unresolved: false
    };
  }
  if (q.includes("laboratorio") || q.includes("resultado")) {
    return {
      reply: "Laboratorio clínico en sedes Centro y Norte (6:30 a 10:00) y Sur (7:00 a 10:00), lunes a viernes sin cita previa.\nResultados disponibles en el portal web oficial con tu documento y clave personal.",
      unresolved: false
    };
  }
  if (q.includes("queja") || q.includes("reclamo") || q.includes("indicador")) {
    return {
      reply: "El Call Center opera con 18 agentes atendiendo ~900 llamadas y 250 chats diarios. Quejas se radican por portal o al (601) 555 0100.\nRespuestas a quejas en un plazo de hasta 15 días hábiles.",
      unresolved: false
    };
  }
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
    q.includes("andito")
  ) {
    return {
      reply: "¡Hola! Soy Andito, la mascota y asistente virtual orientador de Red Salud Andina.\nEstoy aquí para guiarte con información sobre nuestras sedes, citas, servicios y cuotas moderadoras.\n¿En qué te puedo colaborar hoy?",
      unresolved: false
    };
  }
  return {
    reply: "Como Andito, tu asistente orientador, no dispongo de esa información específica en mi base oficial. Para ayudarte a resolverlo, comunícate con un asesor en nuestro Call Center (601) 555 0100 o WhatsApp +57 300 555 0100 (L-V 7:00-19:00, Sáb 8:00-14:00).",
    unresolved: true
  };
}

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const activeControllerRef = useRef<AbortController | null>(null);

  // Cargar temas/primeros mensajes de sesiones previas
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_QUERIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentQueries(parsed);
        }
      }
    } catch {
      // Ignorar errores de acceso
    }
  }, []);

  // Guardar únicamente el primer mensaje / tema de cada consulta/conversación
  const addRecentTopic = (firstMessage: string) => {
    setRecentQueries((prev) => {
      const topic =
        firstMessage.length > 50
          ? `${firstMessage.substring(0, 48).trim()}...`
          : firstMessage;

      const filtered = prev.filter(
        (t) => t.toLowerCase() !== topic.toLowerCase()
      );
      const updated = [topic, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(updated));
      } catch {
        // Fallback silencioso
      }
      return updated;
    });
  };

  const handleSendMessage = async (query: string, isRetry = false) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (isLoading && !isRetry) return;

    // Si ya existía una petición activa (por ejemplo, reintento durante carga lenta), abortarla
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    setError(null);
    setLastQuery(trimmed);

    // Guardar únicamente el 1er mensaje o tema de la conversación
    if (messages.length === 0 && !isRetry) {
      addRecentTopic(trimmed);
    }

    // Si no es reintento, agregar nuevo mensaje de usuario
    if (!isRetry) {
      const userMessage: ChatMessageItem = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    setIsLoading(true);

    // Preparar historial
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content
    }));

    // Timeout de 15 segundos con AbortController para prevenir cuelgues de red en el cliente
    const controller = new AbortController();
    activeControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || `Error del servidor (${res.status})`);
      }

      const botMessage: ChatMessageItem = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: "assistant",
        content: data.reply || "Disculpa, no fue posible procesar la respuesta.",
        timestamp: data.timestamp || new Date().toISOString(),
        unresolved: Boolean(data.unresolved),
        reason: data.reason,
        category: data.category
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      clearTimeout(timeoutId);

      // Si fue abortado por un nuevo reintento manual inmediato, no registrar error
      if (err?.name === "AbortError" && activeControllerRef.current !== controller) {
        return;
      }

      console.warn("Conmutando a contingencia cliente:", err?.name, err?.message);

      const isTimeout = err?.name === "AbortError";
      const contingency = getClientContingencyReply(trimmed);

      const notice = isTimeout
        ? "[Aviso: Tiempo de espera agotado con el servidor. Conmutando a modelo local de contingencia de Red Salud Andina]"
        : "[Aviso: Servidor temporalmente no accesible (Failed to fetch). Conmutando a modelo local de contingencia de Red Salud Andina]";
      console.warn(notice);

      const fallbackBotMessage: ChatMessageItem = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: "assistant",
        content: contingency.reply,
        timestamp: new Date().toISOString(),
        unresolved: contingency.unresolved,
        category: "contingencia"
      };

      setMessages((prev) => [...prev, fallbackBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSendMessage(lastQuery, true);
    }
  };

  const handleNewChat = () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    setMessages([]);
    setError(null);
    setLastQuery(null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-base text-text">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        recentQueries={recentQueries}
        onSelectQuery={(q) => handleSendMessage(q)}
        onNewChat={handleNewChat}
      />

      <MainUi
        onOpenSidebar={() => setSidebarOpen(true)}
        onSubmit={(q) => handleSendMessage(q)}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        onNewChat={handleNewChat}
      />
    </div>
  );
}

export default App;
