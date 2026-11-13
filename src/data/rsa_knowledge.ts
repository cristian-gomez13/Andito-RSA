export interface SedeInfo {
  id: string;
  nombre: string;
  direccion: string;
  horario: string;
  servicios: string[];
  parqueadero: boolean | "con costo" | "sin información";
  accesibilidad: string;
  observaciones?: string;
}

export interface CanalAtencion {
  canal: string;
  contacto: string;
  horario: string;
  detalle: string;
}

export interface CuotaModeradora {
  categoria: string;
  valor: number;
  formato: string;
  detalle: string;
}

export const ASEGURADORAS_CONVENIO = [
  "AutorizaPlus",
  "Previsalud",
  "MediPlan"
];

export const SEDES_RSA: SedeInfo[] = [
  {
    id: "centro",
    nombre: "Sede Centro",
    direccion: "Calle 10 # 5-20",
    horario: "Lunes a viernes 6:30 a 19:00, sábados 7:00 a 13:00. Festivos 8:00 a 12:00 (solo farmacia y vacunación). Domingos cerrado.",
    servicios: [
      "Medicina general",
      "Pediatría",
      "Ginecología",
      "Ortopedia",
      "Dermatología",
      "Laboratorio clínico",
      "Farmacia",
      "Vacunación"
    ],
    parqueadero: "con costo",
    accesibilidad: "Acceso para silla de ruedas",
    observaciones: "Única sede abierta festivos de 8:00 a 12:00 exclusivamente para farmacia y vacunación."
  },
  {
    id: "norte",
    nombre: "Sede Norte",
    direccion: "Carrera 15 # 120-45",
    horario: "Lunes a viernes 6:30 a 19:00, sábados 7:00 a 13:00. Domingos y festivos cerrado.",
    servicios: [
      "Medicina general",
      "Pediatría",
      "Ginecología",
      "Odontología",
      "Laboratorio clínico",
      "Farmacia",
      "Vacunación"
    ],
    parqueadero: "con costo",
    accesibilidad: "Acceso para silla de ruedas"
  },
  {
    id: "sur",
    nombre: "Sede Sur",
    direccion: "Avenida Sur # 40-10",
    horario: "Lunes a viernes 7:00 a 18:00. Sábados, domingos y festivos cerrado.",
    servicios: [
      "Medicina general",
      "Pediatría",
      "Odontología",
      "Laboratorio clínico"
    ],
    parqueadero: "sin información",
    accesibilidad: "Acceso para silla de ruedas"
  },
  {
    id: "occidente",
    nombre: "Sede Occidente",
    direccion: "Calle 80 # 70-15",
    horario: "Lunes a viernes 7:00 a 18:00. Sábados, domingos y festivos cerrado.",
    servicios: [
      "Medicina general",
      "Ginecología",
      "Dermatología"
    ],
    parqueadero: "sin información",
    accesibilidad: "Acceso para silla de ruedas"
  },
  {
    id: "oriente",
    nombre: "Sede Oriente",
    direccion: "Carrera 7 # 60-30",
    horario: "Lunes a viernes 7:00 a 17:00. Sábados, domingos y festivos cerrado.",
    servicios: [
      "Medicina general",
      "Pediatría"
    ],
    parqueadero: "sin información",
    accesibilidad: "Acceso para silla de ruedas"
  },
  {
    id: "parque",
    nombre: "Sede Parque",
    direccion: "Carrera 20 # 85-12",
    horario: "Lunes a viernes 7:00 a 18:00. Sábados, domingos y festivos cerrado.",
    servicios: [
      "Medicina general",
      "Ortopedia",
      "Dermatología",
      "Psicología"
    ],
    parqueadero: "sin información",
    accesibilidad: "Acceso para silla de ruedas"
  },
  {
    id: "lago",
    nombre: "Sede Lago",
    direccion: "Calle 100 # 15-80",
    horario: "Lunes a viernes 7:00 a 17:00. Sábados, domingos y festivos cerrado.",
    servicios: [
      "Medicina general",
      "Psicología"
    ],
    parqueadero: "sin información",
    accesibilidad: "Acceso para silla de ruedas"
  },
  {
    id: "villa_del_rio",
    nombre: "Sede Villa del Río (ciudad vecina)",
    direccion: "Calle 5 # 3-40",
    horario: "Lunes a viernes 8:00 a 16:00. Sábados, domingos y festivos cerrado.",
    servicios: [
      "Medicina general",
      "Pediatría"
    ],
    parqueadero: "sin información",
    accesibilidad: "Consultorios en el primer piso (acceso silla de ruedas)",
    observaciones: "No cuenta con laboratorio clínico."
  }
];

export const CUOTAS_MODERADORAS: CuotaModeradora[] = [
  {
    categoria: "Medicina general",
    valor: 5000,
    formato: "$5.000",
    detalle: "Aplica por consulta médica general presencial o teleconsulta."
  },
  {
    categoria: "Especialistas (ortopedia, dermatología, psicología, pediatría, ginecología)",
    valor: 12000,
    formato: "$12.000",
    detalle: "Solo consulta. Exámenes y procedimientos tienen un valor aparte no disponible en esta base."
  },
  {
    categoria: "Odontología",
    valor: 8000,
    formato: "$8.000",
    detalle: "Aplica para consulta odontológica en sedes Norte y Sur."
  }
];

export const EXCEPCIONES_CUOTA = [
  "Menores de 5 años",
  "Mujeres gestantes en control prenatal",
  "Personas inscritas en programas de enfermedades crónicas"
];

export const CANALES_DERIVACION: CanalAtencion[] = [
  {
    canal: "Call Center",
    contacto: "(601) 555 0100",
    horario: "Lunes a viernes de 7:00 a 19:00 y sábados de 8:00 a 14:00",
    detalle: "Para agendar, cancelar/reprogramar citas, quejas o atención con asesor."
  },
  {
    canal: "WhatsApp Asesor",
    contacto: "+57 300 555 0100",
    horario: "Lunes a viernes de 7:00 a 19:00 y sábados de 8:00 a 14:00",
    detalle: "Para agendamiento asistido, consultas y soporte con un asesor humano."
  },
  {
    canal: "Portal Web",
    contacto: "citas.redsaludandina.example",
    horario: "Disponible 24/7 (cuenta de usuario)",
    detalle: "Para agendar si tiene cuenta, consultar resultados de laboratorio, pagar cuota moderadora o radicar solicitudes fuera de horario (respuesta al siguiente día hábil)."
  },
  {
    canal: "Línea de Urgencias y Emergencias",
    contacto: "Línea 123",
    horario: "24/7",
    detalle: "Red Salud Andina NO atiende urgencias. Ante cualquier emergencia médica, llamar de inmediato al 123 o acudir a la sala de urgencias más cercana."
  }
];

export const REGLAS_CITAS_Y_SERVICIOS = {
  agendamiento: {
    canales: "WhatsApp (+57 300 555 0100), Portal web (citas.redsaludandina.example si tiene cuenta), Call Center ((601) 555 0100) o presencial en sede.",
    rolAgente: "El agente solo orienta, informa y deriva; NO puede agendar, consultar ni modificar citas en el sistema.",
    queLlevar: "Documento de identidad original, carné de la aseguradora y orden médica vigente (si va a ortopedia, dermatología, psicología u odontología). Llegar 15 minutos antes.",
    anticipacionMedicinaGeneral: "Hasta con 15 días de anticipación. No requiere orden médica.",
    eleccionMedico: "Se puede solicitar un profesional al agendar según disponibilidad; el agente no conoce las agendas médicas."
  },
  requisitosPorEspecialidad: {
    medicinaGeneral: "Sin orden médica. Acceso directo.",
    pediatria: "Acceso directo (no requiere orden médica previa).",
    ginecologia: "Acceso directo (no requiere orden médica previa).",
    ortopedia: "Requiere orden del médico general Y autorización previa de la aseguradora.",
    dermatologia: "Requiere orden del médico general Y autorización previa de la aseguradora.",
    psicologia: "Requiere orden del médico general (no requiere autorización adicional).",
    odontologia: "Requiere orden del médico general (solo disponible en sedes Norte y Sur). No se presta ortodoncia."
  },
  autorizaciones: {
    tramite: "La solicita la sede al agendar por cualquier canal (portal, WhatsApp, call center o en sede).",
    tiempoRespuesta: "Tarda hasta 3 días hábiles. Se notifica al paciente por WhatsApp o correo electrónico.",
    requisitoIndispensable: "Sin autorización aprobada NO se atiende la cita."
  },
  politicasAsistencia: {
    cancelarOReprogramar: "Hasta 4 horas antes de la cita, sin costo, por WhatsApp, portal o call center.",
    inasistencia: "Si falta a 2 citas en 90 días sin avisar, se suspende el agendamiento por portal durante 30 días (podrá hacerlo por call center).",
    llegadaTarde: "Tolerancia máxima de 10 minutos. Luego de ese tiempo la cita puede reasignarse y debe reprogramarse.",
    acompanantes: "Menores de 18 años deben acudir con adulto responsable. Mayores de 70 años o personas con discapacidad pueden asistir con acompañante."
  },
  laboratorioClinico: {
    sedesYHorarios: "Centro y Norte (6:30 a 10:00), Sur (7:00 a 10:00), de lunes a viernes.",
    condiciones: "Sin cita previa. Requiere orden médica vigente (30 días de vigencia) y ayuno si la orden lo especifica.",
    entregaResultados: "Hematología en 24 a 48 horas; otros exámenes hasta en 5 días hábiles. Se consultan en el portal con documento y clave. NO se entregan por chat ni teléfono. Si no tiene clave, reclamar presencial en sede con documento.",
    villaDelRio: "La sede Villa del Río NO cuenta con laboratorio."
  },
  farmacia: {
    sedesYHorarios: "Centro y Norte, lunes a viernes de 7:00 a 18:00.",
    festivos: "Sede Centro abre festivos de 8:00 a 12:00 exclusivamente para farmacia y vacunación.",
    vigenciaFormula: "La fórmula médica tiene vigencia de 30 días. Medicamentos de control requieren la fórmula original física."
  },
  vacunacion: {
    sedesYHorarios: "Centro y Norte, lunes a viernes de 8:00 a 16:00, sin cita previa.",
    festivos: "Sede Centro abre festivos de 8:00 a 12:00.",
    requisito: "Llevar carné de vacunación físico. Esquemas infantil y adultos."
  },
  teleconsulta: {
    servicios: "Medicina general y psicología, de lunes a sábado de 7:00 a 19:00, con cita previa.",
    acceso: "El enlace de acceso se envía por WhatsApp antes de la cita.",
    restricciones: "No aplica para urgencias ni valoraciones físicas."
  },
  historiaClinica: {
    solicitud: "Presencial en sede por el titular con documento, o por tercero con autorización escrita y copia de documento del titular.",
    tiempoEntrega: "Hasta 5 días hábiles.",
    costo: "La primera copia no tiene costo."
  },
  certificadosEIncapacidades: {
    regla: "Los emite el médico tratante durante la consulta presencial o teleconsulta. NO se emiten por chat, teléfono ni correo."
  },
  pqrsQuejasReclamos: {
    canal: "Formulario en portal web (citas.redsaludandina.example) o por call center ((601) 555 0100).",
    tiempoRespuesta: "Hasta 15 días hábiles."
  },
  particulares: {
    atencion: "Se atienden consultas particulares. Los valores exactos no se encuentran en esta base de conocimiento."
  },
  urgenciasYConsejoMedico: {
    urgencias: "Red Salud Andina NO tiene servicio de urgencias. Ante una urgencia o emergencia, llamar al 123 o dirigirse al hospital o centro de urgencias más cercano.",
    consejoMedico: "NO se brinda consejo médico, prescripciones ni diagnósticos por chat. Siempre se debe consultar a un profesional de la salud."
  }
};

/**
 * Información literal extraída de pasted-text.txt / anexo técnico operativo.
 */
export const PASTED_TEXT_LITERAL = `
### 2. Current Call Center Operations (El call center hoy)
The data represents a typical month of 22 business days. The call center has 18 agents, each working 8 hours daily, handling both telephone calls and WhatsApp chats (there is currently no automated channel for questions).

Operational Indicators:
- Calls answered per business day: 900
- WhatsApp chats with an agent per business day: 250 (average 7 minutes each)
- Average call duration: 5.5 minutes
- Monthly call center cost: $98 million COP (covers calls and WhatsApp)
- Average agent cost per minute: $665 COP (calls and WhatsApp)
- Calls answered in < 30 seconds: 62% (target: 80%)
- Average queue waiting time: 1 min 30 s
- Average queue waiting time (Mondays 7:00–10:00): 6 min
- Abandoned calls before being answered: 18% of 1,100 daily incoming calls (~200); 31% on Mondays 7:00–10:00
- First-call resolution rate: 70%
- Repeat callers for the same issue within 7 days: 19% (already included in the 900 calls)
- Patient satisfaction (scale 1 to 5): 3.6
- Annual agent turnover: 28%

### 3. Call Reasons & Volume Breakdown
- Branch hours and locations: 14% of calls, 126 calls/day, 2.5 min avg duration, 95% 1st call resolution
- Scheduling an appointment: 28% of calls, 252 calls/day, 7.5 min avg duration, 78% 1st call resolution
- Cancelling or rescheduling: 12% of calls, 108 calls/day, 4.0 min avg duration, 85% 1st call resolution
- Requirements (what to bring, orders, authorizations): 13% of calls, 117 calls/day, 4.5 min avg duration, 60% 1st call resolution
- Copays and fees: 6% of calls, 54 calls/day, 3.5 min avg duration, 70% 1st call resolution
- Laboratory results: 8% of calls, 72 calls/day, 5.0 min avg duration, 55% 1st call resolution
- Medical records and certificates: 4% of calls, 36 calls/day, 5.0 min avg duration, 60% 1st call resolution
- Authorization status: 7% of calls, 63 calls/day, 8.0 min avg duration, 40% 1st call resolution
- Complaints and claims: 5% of calls, 45 calls/day, 9.0 min avg duration, 35% 1st call resolution
- Other: 3% of calls, 27 calls/day, 6.0 min avg duration, 50% 1st call resolution

Patient Survey Findings:
From a telephone survey of 400 patients who called last month:
- 34% stated they would use a chat for informational queries if it resolved their issue just as well.
- 41% prefer speaking with a human.
- 25% do not know.
Margin of error is ~5 percentage points; it only surveyed existing callers. There is no data on portal usage, reasons for preferring calls, or WhatsApp conversation topics.

### 4. Formal Complaints (310 per month across call center and portal)
- Long line wait times: 32% (Root cause: Peak volume Mondays 7:00–10:00 and after holidays; informational calls occupy agents who could be processing requests)
- Inconsistent information: 21% (Root cause: Lack of a single source of truth; agents answer requirements, schedules, and costs from memory)
- Missed appointment due to missing order/authorization: 17% (Root cause: Patients did not know it was required or that it takes up to 3 business days)
- Unexpected charges: 11% (Root cause: Patients were unaware of moderate fees or their amounts)
- Missing or unlocatable lab results: 9% (Root cause: Patients do not know where or when results are published and call to ask)
- Agent demeanor/treatment: 6% (Root cause: Fatigue during peak hours, repetitive calls, and high turnover creating inexperienced staff)
- Other: 4% (Individual cases)

### 5. Human Escalation & Referral Channels
- Call center: (601) 555 0100 — Monday to Friday 7:00–19:00, Saturday 8:00–14:00.
- WhatsApp with an agent: +57 300 555 0100 — Same hours as call center.
- Outside operating hours: Contact form on the portal (citas.redsaludandina.example), answered the next business day.
- Unanswered questions: Operations reviews unanswered queries every Monday to update the knowledge base.

### 6. Branch Directory (Sedes)
All branches are closed on Sundays and holidays unless specifically noted (Centro).
1. Centro: Calle 10 # 5-20 | Mon–Fri 6:30–19:00, Sat 7:00–13:00 | General medicine, pediatrics, gynecology, orthopedics, dermatology, laboratory, pharmacy, vaccination
2. Norte: Carrera 15 # 120-45 | Mon–Fri 6:30–19:00, Sat 7:00–13:00 | General medicine, pediatrics, gynecology, dentistry, laboratory, pharmacy, vaccination
3. Sur: Avenida Sur # 40-10 | Mon–Fri 7:00–18:00 | General medicine, pediatrics, dentistry, laboratory
4. Occidente: Calle 80 # 70-15 | Mon–Fri 7:00–18:00 | General medicine, gynecology, dermatology
5. Oriente: Carrera 7 # 60-30 | Mon–Fri 7:00–17:00 | General medicine, pediatrics
6. Parque: Carrera 20 # 85-12 | Mon–Fri 7:00–18:00 | General medicine, orthopedics, dermatology, psychology
7. Lago: Calle 100 # 15-80 | Mon–Fri 7:00–17:00 | General medicine, psychology
8. Villa del Río (neighboring city): Calle 5 # 3-40 | Mon–Fri 8:00–16:00 | General medicine, pediatrics (no laboratory)

### 7. Knowledge Base for Answering Patient Queries
1. Appointment booking: Booked via WhatsApp with an agent, online portal, call center, or on-site at a branch. Patients with an existing account can book on the portal. The automated agent does not schedule appointments.
2. What to bring: Official ID document, insurance card/carné, and the medical order if attending orthopedics, dermatology, psychology, or dentistry. Arrive 15 minutes early.
3. General medicine: Does not require an order. Can be booked up to 15 days in advance.
4. Specialists:
  - Orthopedics, dermatology, psychology, and dentistry require an order from a general physician.
  - Orthopedics and dermatology additionally require insurance authorization.
  - Pediatrics and gynecology allow direct access without an order.
5. Insurance authorization: Requested by the clinic at the time of booking (via portal, WhatsApp, call center, or in person). Takes up to 3 business days; notification is sent via WhatsApp or email. Patients cannot be seen without authorization.
6. Moderate fees / Copays (Cuotas moderadoras):
  - General medicine: $5,000 COP.
  - Specialists (orthopedics, dermatology, psychology, pediatrics, gynecology): $12,000 COP (consultation only; exams and procedures have separate costs not listed).
  - Dentistry: $8,000 COP.
  - Exemptions: Children under 5, pregnant women in prenatal care, and patients enrolled in chronic disease management programs do not pay.
  - Payable at the branch or via the online portal.
7. Private/Out-of-pocket patients (Particulares): Private consultations are offered; pricing is not available in this knowledge base.
8. Cancellations / Rescheduling: Must be requested at least 4 hours prior to the appointment at no cost (via WhatsApp, portal, or call center).
9. No-shows (Inasistencia): Missing 2 appointments within 90 days without notice blocks portal booking for 30 days (appointments can still be booked via call center).
10. Late arrivals: 10 minutes of tolerance. After 10 minutes, the appointment may be reassigned and must be rescheduled.
11. Minors and companions: Minors under 18 must be accompanied by a responsible adult. Adults over 70 and persons with disabilities may be accompanied by one person.
12. Clinical laboratory:
  - Centro and Norte: Mon–Fri 6:30–10:00.
  - Sur: Mon–Fri 7:00–10:00.
  - Walk-in (no appointment needed; fasting if indicated by order). Medical order valid for 30 days.
13. Lab results:
  - Hematology results take 24 to 48 hours.
  - Other tests take up to 5 business days.
  - Accessed online via portal using document ID and password. Never delivered via chat or phone. Without a password, results must be picked up in person with ID.
14. Prescriptions and medications: Pharmacies located in Centro and Norte, Mon–Fri 7:00–18:00. Prescriptions valid for 30 days; controlled medications require original physical prescription.
15. Vaccination: Childhood and adult schedules available at Centro and Norte, walk-in, Mon–Fri 8:00–16:00. Must bring vaccination card.
16. Teleconsultation: General medicine and psychology, Mon–Sat 7:00–19:00, prior booking required. Meeting link sent via WhatsApp. Not for emergencies or physical evaluations.
17. Dentistry: Available only at Norte and Sur, requires general physician order and booking. Orthodontics is not provided.
18. Medical records (Historia clínica): Requested on-site by the patient with ID, or by an authorized person with written authorization and ID copy. Delivered within 5 business days; the first copy is free.
19. Certificates and disability leaves (Incapacidades): Issued directly by the treating physician during the consultation; never issued via chat or email.
20. Sundays and holidays: All branches closed, except Centro, which opens on holidays from 8:00 to 12:00 exclusively for pharmacy and vaccination.
21. Parking and accessibility: Centro and Norte have paid parking. All branches have wheelchair access; Villa del Río has all offices on the first floor.
22. Choosing a doctor: Can be requested upon booking subject to availability; the agent does not have access to physician schedules.
23. Complaints and claims: Submitted via the portal web form or the call center; response time is up to 15 business days.
24. Emergencies (Urgencias): Red Salud Andina does not offer emergency care. In case of emergency, call 123 or go to the nearest emergency room.
25. Medical advice: Never given via chat. For any health concerns, the patient must consult a healthcare professional.
`.trim();

/**
 * Retorna la base de conocimiento formateada para el contexto del System Prompt de Gemini.
 */
export function getKnowledgeBasePrompt(): string {
  return `
BASE DE CONOCIMIENTO OFICIAL - RED SALUD ANDINA (RSA)

1. INFORMACIÓN INSTITUCIONAL:
- Red de salud que atiende pacientes de: AutorizaPlus, Previsalud y MediPlan (mismas condiciones para las 3 aseguradoras).
- Rol del agente: Solo informa, orienta y deriva. NO agenda directamente, NO consulta agendas ni citas, NO modifica citas, NO accede a historias clínicas ni resultados de pacientes.
- Urgencias: Red Salud Andina NO atiende urgencias. Ante emergencias médicas, indicar llamar al 123 o acudir al centro de urgencias más cercano.
- Consejo médico: PROHIBIDO dar diagnósticos, tratamientos o consejo médico por chat. Derivar a consulta profesional.
- Datos personales: NUNCA pedir ni almacenar cédulas, nombres reales o teléfonos de los pacientes en el chat.

2. LAS 8 SEDES Y HORARIOS (Todas cierran domingos y festivos, salvo festivos en Sede Centro):
- Centro (Calle 10 # 5-20): L-V 6:30-19:00, Sáb 7:00-13:00. Servicios: Medicina general, pediatría, ginecología, ortopedia, dermatología, laboratorio, farmacia, vacunación. Parqueadero con costo. Festivos: abre 8:00-12:00 ÚNICAMENTE para farmacia y vacunación.
- Norte (Carrera 15 # 120-45): L-V 6:30-19:00, Sáb 7:00-13:00. Servicios: Medicina general, pediatría, ginecología, odontología, laboratorio, farmacia, vacunación. Parqueadero con costo.
- Sur (Avenida Sur # 40-10): L-V 7:00-18:00. Servicios: Medicina general, pediatría, odontología, laboratorio.
- Occidente (Calle 80 # 70-15): L-V 7:00-18:00. Servicios: Medicina general, ginecología, dermatología.
- Oriente (Carrera 7 # 60-30): L-V 7:00-17:00. Servicios: Medicina general, pediatría.
- Parque (Carrera 20 # 85-12): L-V 7:00-18:00. Servicios: Medicina general, ortopedia, dermatología, psicología.
- Lago (Calle 100 # 15-80): L-V 7:00-17:00. Servicios: Medicina general, psicología.
- Villa del Río (Calle 5 # 3-40, ciudad vecina): L-V 8:00-16:00. Servicios: Medicina general, pediatría. Consultorios en primer piso. NO tiene laboratorio.
- Todas las sedes tienen rampa o acceso para silla de ruedas.

3. AGENDAMIENTO, REQUISITOS Y CITAS:
- Canales para agendar: Portal web (citas.redsaludandina.example si tiene cuenta), WhatsApp con asesor (+57 300 555 0100), Call Center ((601) 555 0100) o presencial en sede.
- Qué llevar a la cita: Documento de identidad original, carné de la aseguradora y orden médica si aplica (ortopedia, dermatología, psicología, odontología). Llegar 15 minutos antes.
- Medicina general: Acceso directo sin orden previa. Se agenda con hasta 15 días de anticipación.
- Especialidades con acceso directo (sin orden médica): Pediatría y ginecología.
- Especialidades que requieren orden de médico general: Ortopedia, dermatología, psicología y odontología.
- Especialidades que requieren además autorización de la aseguradora: Ortopedia y dermatología.
- Trámite de autorización: La solicita la sede al agendar y tarda hasta 3 días hábiles. Se notifica por WhatsApp o correo. Sin autorización no se atiende la cita.
- Odontología: Solo en sedes Norte y Sur con cita y orden de medicina general. NO se presta ortodoncia.
- Teleconsulta: Medicina general y psicología, L-S 7:00 a 19:00 con cita previa. Enlace llega por WhatsApp. No para urgencias ni chequeos físicos.
- Cancelar o reprogramar: Sin costo hasta 4 horas antes por WhatsApp, portal o call center.
- Inasistencia: Faltar a 2 citas en 90 días sin avisar bloquea el agendamiento web por 30 días (solo podrá por call center).
- Tolerancia llegada: 10 minutos de espera; luego la cita se reasigna y debe reprogramarse.
- Acompañantes: Menores de 18 con adulto responsable. Mayores de 70 o con discapacidad con acompañante.

4. CUOTAS MODERADORAS Y EXENCIONES:
- Medicina general: $5.000 por consulta.
- Especialistas (ortopedia, dermatología, psicología, pediatría, ginecología): $12.000 (solo consulta; exámenes/procedimientos tienen costo aparte no especificado en esta base).
- Odontología: $8.000.
- Exentos de pago: Menores de 5 años, mujeres gestantes en control prenatal y pacientes en programas de enfermedades crónicas.
- Formas de pago: En sede física o a través del portal web.
- Particulares: Se atienden consultas particulares; el valor exacto no figura en esta base.

5. OTROS SERVICIOS:
- Laboratorio clínico: Centro y Norte (6:30-10:00), Sur (7:00-10:00) L-V, sin cita previa, con orden médica vigente (30 días) y ayuno si se requiere. Resultados: Hematología en 24-48 horas; otros exámenes hasta 5 días hábiles en portal con clave. No por chat/teléfono. Sin clave, presencial con documento.
- Farmacia: Centro y Norte, L-V 7:00-18:00 (Centro abre festivos 8:00-12:00). Fórmula válida por 30 días; medicamentos de control exigen fórmula original física.
- Vacunación: Centro y Norte, L-V 8:00-16:00 (Centro abre festivos 8:00-12:00). Llevar carné de vacunación.
- Historia clínica: Presencial en sede con documento (o autorización escrita + copia de documento del titular). Entrega en 5 días hábiles. Primera copia gratuita.
- Certificados e incapacidades: Emitidos exclusivamente por el médico tratante en la consulta. No se emiten por chat ni correo.
- Quejas y reclamos: Por formulario en el portal web o call center. Respuesta hasta en 15 días hábiles.

6. DERIVACIÓN Y CANALES OFICIALES:
- Call Center: (601) 555 0100 (Lunes a viernes 7:00 a 19:00, sábados 8:00 a 14:00).
- WhatsApp Asesor: +57 300 555 0100 (Lunes a viernes 7:00 a 19:00, sábados 8:00 a 14:00).
- Fuera de horario: Formulario en portal web (citas.redsaludandina.example), respuesta al día hábil siguiente.
- Si no sabes la respuesta o está fuera de esta base de conocimiento: Infórmalo con amabilidad y deriva al Call Center ((601) 555 0100) o WhatsApp (+57 300 555 0100).

7. INFORMACIÓN OPERATIVA LITERAL:
${PASTED_TEXT_LITERAL}
`.trim();
}
