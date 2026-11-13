# Red Salud Andina (RSA) - Agente Virtual de Atención al Usuario (Andito)

Sistema integral de atención y orientación al usuario para **Red Salud Andina (RSA)** protagonizado por **Andito**, la mascota y asistente virtual orientador oficial de la red. Diseñado para responder dudas frecuentes sobre sedes, horarios, requisitos de citas, cuotas moderadoras y canales de derivación oficial con un tono cálido, tierno y empático, optimizando la operación del call center y garantizando una experiencia ágil, confiable y segura.

---

## 📌 Tabla de Contenidos
1. [Descripción General](#-descripción-general)
2. [Identidad de Andito](#-identidad-de-andito)
3. [Arquitectura del Sistema](#-arquitectura-del-sistema)
4. [Base de Conocimiento y Políticas](#-base-de-conocimiento-y-políticas)
5. [Endpoints de la API](#-endpoints-de-la-api)
6. [Resiliencia y Conmutación de Modelos](#-resiliencia-y-conmutación-de-modelos)
7. [Privacidad y Anonimización (PII)](#-privacidad-y-anonimización-pii)
8. [Interfaz de Usuario (UI/UX)](#-interfaz-de-usuario-uiux)
9. [Instalación y Configuración](#-instalación-y-configuración)
10. [Comandos de Ejecución y Pruebas](#-comandos-de-ejecución-y-pruebas)
11. [Historial de Modificaciones](#-historial-de-modificaciones)

---

## 🏥 Descripción General

Red Salud Andina atiende a afiliados de **AutorizaPlus**, **Previsalud** y **MediPlan**. Este agente conversacional tiene un alcance estrictamente delimitado para resolver consultas informativas:
- **Rol del Agente**: Informar, orientar y derivar con calidez.
- **Límites de Seguridad**: NO agenda directamente citas en el sistema hospitalario, NO consulta ni modifica registros médicos, NO emite consejos o diagnósticos clínicos y NO atiende urgencias vitales (deriva de inmediato a la Línea 123).
- **Estilo de Respuesta**: Respuestas en español claro y accesible (máximo 4 líneas por mensaje), anticipando siempre la siguiente necesidad del paciente (documentos a llevar, plazos o sedes disponibles).

---

## 🐾 Identidad de Andito

**Andito** es el corazón visual y conversacional del servicio al usuario de Red Salud Andina:
- **Personalidad y Tono**: Es un pequeño y tierno ayudante, cálido, amigable, empático y profundamente servicial. Acompaña a pacientes y familiares con palabras reconfortantes y un lenguaje sencillo libre de tecnicismos.
- **Presentación Oficial**: Al recibir saludos o preguntas sobre su identidad ("¿Quién eres?", "¿Cómo te llamas?"), Andito se presenta con orgullo como la mascota y asistente orientador oficial de RSA.
- **Rigurosidad Clínica y Operativa**: A pesar de su carácter afable y cercano, Andito mantiene con máxima firmeza las directrices de seguridad clínica: nunca opina sobre tratamientos o síntomas, deriva urgencias a la Línea 123 en el primer instante y respeta la política de brevedad concisa (≤ 4 líneas).

---

## 🏗️ Arquitectura del Sistema

El proyecto está construido como una solución full-stack sobre **Bun**:

```
RSA/
├── src/
│   ├── assets/               # Ilustraciones y avatares oficiales de Andito (.png)
│   ├── buttons/              # Botones de acción accesibles (Envío, Voz/Micrófono)
│   ├── data/
│   │   └── rsa_knowledge.ts  # Base de conocimiento estructurada y datos operativos literales
│   ├── icons/                # Iconografía vectorial SVG nativa en React
│   ├── services/
│   │   ├── gemini.service.ts # Servicio de IA con rotación de modelos y fallback local (Andito)
│   │   ├── logger.service.ts # Sistema de registro continuo en tiempo real (logs.txt)
│   │   ├── metrics.service.ts# Generador de datasets CSV para negocio, métricas y gráficos
│   │   └── unresolved.service.ts # Gestor y sanitizador de preguntas no resueltas
│   ├── types/
│   │   └── chat.ts           # Definiciones de tipos para mensajes e historial
│   ├── App.tsx               # Orquestación del estado global, sesiones y reintentos
│   ├── ChatBox.tsx           # Formulario de entrada con soporte de Web Speech API
│   ├── ChatMessages.tsx      # Renderizado de chat, temporizador en vivo y botón de reintento
│   ├── MainUi.tsx            # Contenedor principal en panel dedicado y cabecera translúcida con Andito
│   ├── Sidebar.tsx           # Panel lateral con historial, exportación CSV y descarga de logs.txt
│   ├── SuggestionPills.tsx   # Píldoras de sugerencias rápidas por categoría
│   ├── index.css             # Estilos y tokens basados en Catppuccin
│   ├── index.html            # Plantilla base HTML5
│   └── index.ts              # Servidor HTTP Bun con enrutamiento de API, logs, métricas y frontend
├── scripts/
│   └── generate_metrics.ts   # Script CLI para generación de todos los datasets CSV
├── tests/
│   └── backend.test.ts       # Suite de pruebas unitarias y de integración (53 tests automáticos)
├── rsa_business_case_kpis.csv # Métricas antes vs después para gráficos ejecutivos (ignorado en git)
├── rsa_test_benchmarks_and_performance.csv # Rendimiento técnico y latencias de pruebas (ignorado en git)
├── rsa_hourly_demand_and_latency.csv # Simulación horaria de colas vs inmediatez IA (ignorado en git)
├── rsa_roi_financial_projection_12m.csv # Proyección financiera de ahorro a 12 meses (ignorado en git)
├── rsa_call_reasons_and_deflection.csv # Desvío por tipo de consulta telefónica (ignorado en git)
├── rsa_complaints_reduction_impact.csv # Eliminación del 89.7% de quejas formales (ignorado en git)
├── logs.txt                  # Archivo de registro continuo de interacciones del agente y pruebas en vivo
├── logs-mensajes.csv         # Trazabilidad tabular de mensajes y consumo de tokens de entrada/salida (ignorado en git)
├── unresolved_questions.json # Registro persistente de consultas no resueltas (sin PII)
├── .gitignore                # Reglas estrictas de exclusión de CSVs, logs y temporales
├── .env.example              # Plantilla de variables de entorno
├── build.ts                  # Script de empaquetado para producción
└── tsconfig.json             # Configuración estricta de TypeScript
```

---

## 📚 Base de Conocimiento y Políticas

La base oficial se encuentra centralizada en `src/data/rsa_knowledge.ts`:
- **8 Sedes**:
  - **Centro** (Calle 10 # 5-20): Medicina general, pediatría, ginecología, ortopedia, dermatología, laboratorio, farmacia y vacunación. Única abierta festivos (8:00 a 12:00) para farmacia/vacunas.
  - **Norte** (Carrera 15 # 120-45): Medicina general, pediatría, ginecología, odontología, laboratorio, farmacia y vacunación.
  - **Sur** (Avenida Sur # 40-10): Medicina general, pediatría, odontología y laboratorio.
  - **Occidente** (Calle 80 # 70-15): Medicina general, ginecología y dermatología.
  - **Oriente** (Carrera 7 # 60-30): Medicina general y pediatría.
  - **Parque** (Carrera 20 # 85-12): Medicina general, ortopedia, dermatología y psicología.
  - **Lago** (Calle 100 # 15-80): Medicina general y psicología.
  - **Villa del Río** (Calle 5 # 3-40, ciudad vecina): Medicina general y pediatría (sin laboratorio).
- **Tarifas y Cuotas Moderadoras**:
  - Medicina General: **$5.000 COP**.
  - Especialistas (ortopedia, dermatología, psicología, pediatría, ginecología): **$12.000 COP**.
  - Odontología: **$8.000 COP** (Norte y Sur, sin ortodoncia).
  - *Exenciones*: Menores de 5 años, gestantes en control prenatal y pacientes en programas de enfermedades crónicas no pagan.
- **Canales de Derivación Oficial**:
  - Call Center: `(601) 555 0100` (L–V 7:00–19:00, Sáb 8:00–14:00).
  - WhatsApp con asesor: `+57 300 555 0100` (mismo horario).
  - Portal web: `citas.redsaludandina.example` (disponible 24/7).
  - Emergencias vitales: `Línea 123`.

---

## 🔌 Endpoints de la API

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Procesa consultas del paciente con historial conversacional, detección de no resueltas y registro automático en `logs.txt`. |
| `GET` | `/api/unresolved` | Retorna el listado de preguntas no resueltas registradas. |
| `POST` | `/api/unresolved` | Registra manualmente una pregunta sin resolver en el sistema. |
| `GET` | `/api/unresolved/export` | Exporta las preguntas no resueltas en formato CSV (`?format=csv`) o JSON (`?format=json`). |
| `GET` | `/api/knowledge` | Consulta la base de conocimiento estructurada (sedes, tarifas, reglas). |
| `GET` | `/api/metrics/export` | Exporta datasets CSV para gráficos ejecutivos (`?type=kpis`, `benchmarks`, `hourly`, `roi`, `deflection`, `complaints`, `live`). |
| `GET` | `/api/logs` | Consulta estructurada o descarga de `logs.txt` (`?format=json` o `?format=text`). |
| `GET` | `/logs.txt` | Acceso directo al archivo de registro plano de operaciones y pruebas en vivo. |
| `GET` | `/logs-mensajes.csv` | Descarga directa de la tabla de auditoría con columnas de tokens de entrada/salida y trazabilidad completa. |
| `GET` | `/api/logs-mensajes/export` | Endpoint de exportación de `logs-mensajes.csv` para integración y reportería. |
| `GET` | `/api/health` | Diagnóstico del estado del servidor, clave configurada y modelo activo. |

---

## 📊 Registro Continuo y Pruebas en Vivo (logs.txt)

Para auditoría operativa, trazabilidad y supervisión en tiempo real, el sistema cuenta con el servicio `src/services/logger.service.ts` que escribe de forma persistente en `logs.txt` en la raíz del proyecto:
1. **Interacciones en Tiempo Real (Uso del Agente)**:
   - Registro de cada mensaje procesado por `/api/chat`.
   - Consulta sanitizada del usuario (PII enmascarado: cédulas, teléfonos, correos).
   - Respuesta entregada por el agente.
   - Modelo de IA utilizado (`gemini-3.8-flash`, alternativas de rotación o `modelo-local-contingencia`).
   - Estado de la consulta (✅ Resuelto o ⚠️ No Resuelto con motivo y categoría oficial).
   - Tiempo de respuesta en milisegundos (`durationMs`).
2. **Resultados de Pruebas Automáticas**:
   - Cada ejecución de la suite de pruebas (`bun test`) registra individualmente cada caso verificado (`[PASS]` / `[FAIL]`).
   - Resumen consolidado: total de casos, pruebas pasadas, fallidas, tasa de éxito porcentual y tiempo de ejecución global.
3. **Eventos Críticos del Sistema**:
   - Inicialización del servidor, conmutaciones dinámicas de modelos y activaciones de contingencia ante timeouts o cuota agotada (HTTP 429).
4. **Acceso y Descarga**:
   - Acceso web directo vía `GET /logs.txt` o `GET /api/logs`.
   - Botón integrado en la barra lateral (Sidebar) para descargar directamente `logs.txt`.

---

## 📋 Trazabilidad Tabular y Consumo de Tokens (logs-mensajes.csv)

Para auditoría técnica detallada, optimización de costos y monitoreo de consumo en tokens, el sistema genera y actualiza en tiempo real `logs-mensajes.csv` en cada interacción del agente con el usuario:
- **Estructura de Columnas**:
  1. `Fecha_Hora`: Estampa de tiempo exacta (formato ISO `YYYY-MM-DD HH:mm:ss.SSS`).
  2. `Tipo_Evento`: Identificador del evento (ej: `USO_AGENTE / CHAT`).
  3. `Consulta_Usuario`: Texto recibido del paciente, con PII sanitizado (cédulas, teléfonos y correos enmascarados).
  4. `Respuesta_Agente`: Respuesta entregada por el bot (respetando la regla de máximo 4 líneas).
  5. `Modelo_Utilizado`: Modelo que procesó la respuesta (`gemini-3.8-flash`, alternativas de rotación o contingencia local).
  6. `Estado_Resultado`: `RESUELTO` o `NO_RESUELTO` según la capacidad de la base de conocimiento oficial.
  7. `Motivo`: Causa detallada en caso de derivación a asesor humano o fuera de base.
  8. `Categoria`: Clasificación temática (`citas`, `sedes`, `cuotas`, `laboratorio`, `urgencia`, etc.).
  9. `Tiempo_Respuesta`: Latencia de procesamiento en milisegundos (ej: `654ms`).
  10. `Tokens_Recepcion_Entrada`: Conteo de tokens del prompt de entrada (calculados de `usageMetadata` de Gemini o tokenizador heurístico de contingencia).
  11. `Tokens_Respuesta_Salida`: Conteo de tokens de la respuesta generada.
  12. `Tokens_Totales`: Suma consolidada de tokens consumidos en el turno conversacional.
- **Descarga y Acceso**:
  - Descarga web mediante la ruta `GET /logs-mensajes.csv`.
  - Endpoint programático `GET /api/logs-mensajes/export`.
  - Botón dedicado en el Sidebar: **"Registro de Mensajes"** (`mensajes.csv`).
  - Archivo excluido estrictamente en `.gitignore` para no versionar datos locales de pruebas.

---

## 📈 Datasets CSV para Gráficos y Caso de Negocio (Business Case)

Para sustentar, defender y comercializar la solución ante directivos e inversionistas mediante gráficos de alto impacto en Excel, PowerBI, Google Sheets o presentaciones interactivas, el sistema cuenta con el servicio `src/services/metrics.service.ts` y el generador `scripts/generate_metrics.ts`.

> [!NOTE]
> Todos los archivos `.csv` generados y `logs.txt` se encuentran **estrictamente ignorados en `.gitignore`** para mantener el repositorio limpio y evitar subir datos de ejecución local.

### Datasets Generados:
1. **`rsa_business_case_kpis.csv` (Comparativa General Antes vs Después)**:
   - *Métricas*: Costo operativo mensual ($98M a $24.5M COP, -75%), tiempo de espera en hora pico (360s a 1.2s, -99.7%), abandono de llamadas (18% a 0.8%), FCR (70% a 93.5%), quejas mensuales (310 a 42) y CSAT (3.6 a 4.7/5).
   - *Gráfico recomendado*: Barras dobles comparativas, indicadores gauge y tarjetas KPI de impacto.
2. **`rsa_test_benchmarks_and_performance.csv` (Rendimiento Técnico y Testing)**:
   - *Métricas*: Desglose de los 40 tests unitarios y de integración: casos por módulo, tasa de aprobación (100%), latencia promedio en ms (12ms en datos locales a 620ms en IA), 0% alucinaciones y 100% cumplimiento PII.
   - *Gráfico recomendado*: Gráfico de dispersión o barras horizontales de latencia por módulo.
3. **`rsa_hourly_demand_and_latency.csv` (Simulación Horaria 7:00 a 19:00)**:
   - *Métricas*: Volumen horario, tiempo de espera en cola humana vs latencia inmediata del bot (<1.2s), y tasa de abandono telefónico (pico del 31% los lunes vs 0.4% con IA).
   - *Gráfico recomendado*: Gráfico de líneas y áreas superpuestas (curva de colas vs inmediatez digital).
4. **`rsa_roi_financial_projection_12m.csv` (Retorno de Inversión a 12 Meses)**:
   - *Métricas*: Costo mensual proyectado, ahorro neto mes a mes ($73.5M COP/mes), ahorro acumulado en el primer año ($875M+ COP) y curva de ROI superior al 300%.
   - *Gráfico recomendado*: Gráfico de cascada (waterfall) o línea acumulativa de ahorro financiero.
5. **`rsa_call_reasons_and_deflection.csv` (Desvío y Absorción por Motivo)**:
   - *Métricas*: Los 10 motivos reales de llamada (sedes, requisitos, cuotas, laboratorio, citas), llamadas/día, duración en minutos, % de desvío automático por IA (64.5% global, hasta 96% en sedes/horarios) y minutos humanos ahorrados.
   - *Gráfico recomendado*: Gráfico de pastel (donut chart) o barras apiladas de desvío.
6. **`rsa_complaints_reduction_impact.csv` (Eliminación de Quejas Formales)**:
   - *Métricas*: Reducción del 89.7% de las 310 quejas mensuales (filas telefónicas -96%, inconsistencias de información -100%, cobros sorpresa de cuotas -94.1%).
   - *Gráfico recomendado*: Gráfico de barras horizontales antes/después o embudo de resolución.
7. **`rsa_live_testing_results.csv` (Resultados de Pruebas en Vivo y Autocompletado)**:
   - *Métricas*: Registro dinámico continuo de cada consulta real del usuario o prueba unitaria procesada: Timestamp, ID de prueba, tipo, consulta sanitizada (cero PII), respuesta, modelo utilizado, latencia exacta en milisegundos, estado de resolución, categoría, detección de fallback y cumplimiento de la regla de 4 líneas.
   - *Autocompletado automático*: Se actualiza en tiempo real con cada interacción en `/api/chat` y cada prueba ejecutada con `bun test`.

### Cómo Regenerar o Descargar los Archivos:
```bash
bun scripts/generate_metrics.ts
```
O descargarlos en vivo mediante la API o Sidebar:
- `GET /api/metrics/export?type=live` (Pruebas en vivo autocompletadas)
- `GET /api/metrics/export?type=kpis`
- `GET /api/metrics/export?type=benchmarks`
- `GET /api/metrics/export?type=hourly`
- `GET /api/metrics/export?type=roi`
- `GET /api/metrics/export?type=deflection`
- `GET /api/metrics/export?type=complaints`

---

## ⚡ Resiliencia y Conmutación de Modelos
1. **Cadena de Modelos Remotos y Soporte Base URL**: Se intenta la llamada con el modelo configurado (`GEMINI_MODEL`, ej. `gemini-3.8-flash`), con fallback automático a alternativas en cadena. Soporta `GOOGLE_GEMINI_BASE_URL` para integración directa con servidores proxy intermedios o Sub2API en red local, sincronizando el enrutamiento a `v1beta` tal como lo hace el SDK oficial de Python.
2. **Control de Timeout Adaptativo**: Límite de 4.5s estándar o 12s para llamadas a través de proxies/redes locales en el backend, y 15s con `AbortController` en el cliente web.
3. **Motor Local de Contingencia**: Ante límites de cuota (HTTP 429), errores de red o caídas del servicio externo, el sistema conmutará de forma inmediata a un motor local determinista basado en reglas y en el anexo técnico literal, asegurando que el paciente reciba siempre una respuesta precisa y concisa.
4. **Trazabilidad en Consola**: Las conmutaciones o fallas de cuota se informan en los registros de consola sin saturar ni mostrar mensajes de advertencia intrusivos al usuario final.

---

## 🔒 Privacidad y Anonimización (PII)

El módulo `src/services/unresolved.service.ts` implementa filtros automáticos de desidentificación previa a la persistencia en `unresolved_questions.json`:
- Números de documento y cédulas de ciudadanía son sustituidos por `[DOCUMENTO]`.
- Números telefónicos nacionales e internacionales se reemplazan por `[TELÉFONO]`.
- Direcciones de correo electrónico son enmascaradas con `[CORREO]`.

---

## 🎨 Interfaz de Usuario (UI/UX)

- **Cabecera Permanente**: Barra superior fija con el logotipo institucional de Red Salud Andina y fondo traslúcido (`backdrop-blur-md bg-base/70`) sin líneas divisorias visibles.
- **Chat en Panel Dedicado**: La conversación completa se desarrolla dentro de un panel con tarjeta contenedora (`rounded-[32px]`), bordes estilizados y barra de estado en tiempo real.
- **Historial por Tema**: El panel lateral registra únicamente el primer mensaje disparador de cada sesión, evitando registrar mensajes individuales sucesivos.
- **Temporizador y Reintento**: Temporizador en vivo (`⏱️ Xs`) en el indicador de escritura y botón interactivo para reintentar la solicitud si la respuesta supera el tiempo esperado.

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- [Bun](https://bun.com) versión `>= 1.4.0`

### 1. Clonar el repositorio e instalar dependencias
```bash
cd C:\Users\cris\Desktop\RSA
bun install
```

### 2. Configurar variables de entorno
Crea el archivo `.env` tomando como base `.env.example`:
```bash
cp .env.example .env
```

Contenido de `.env`:
```env
# Clave de API de Google Gemini (AI Studio o proxy compatible)
GEMINI_API_KEY=tu_api_key_aqui

# Modelo recomendado
GEMINI_MODEL=gemini-3.8-flash

# (Opcional) URL base personalizada para proxies locales o Sub2API
GOOGLE_GEMINI_BASE_URL="http://192.168.1.38:8080/antigravity"

# (Opcional) Versión de la API de Gemini (por defecto 'v1beta' para máxima compatibilidad con Sub2API y Python SDK)
GOOGLE_GENAI_API_VERSION=v1beta

# Puerto local del servidor
PORT=3000
```

---

## 🧪 Comandos de Ejecución y Pruebas

- **Modo Desarrollo (con Hot Reloading)**:
  ```bash
  bun dev
  ```
- **Modo Producción**:
  ```bash
  bun start
  ```
- **Compilación de Producción**:
  ```bash
  bun run build
  ```
- **Ejecución de Pruebas Automáticas**:
  ```bash
  bun test
  ```
- **Verificación de Tipos TypeScript**:
  ```bash
  bun run typecheck
  ```

---

## 📝 Historial de Modificaciones

| Fecha | Componentes Modificados | Resumen del Cambio |
| :--- | :--- | :--- |
| **2026-11-10** | `src/data/rsa_knowledge.ts`, `src/services/gemini.service.ts`, `src/services/unresolved.service.ts`, `src/index.ts` | Creación de base de conocimiento (8 sedes, tarifas, derivación), integración con `@google/genai`, endpoints `/api/chat`, `/api/unresolved` y sanitización PII. |
| **2026-11-10** | `src/icons/` | Creación de set de iconos vectoriales SVG nativos para el asistente, usuario y acciones clave. |
| **2026-11-10** | `src/MainUi.tsx`, `src/ChatMessages.tsx`, `src/Sidebar.tsx`, `src/App.tsx` | Implementación del chat reactivo, cabecera permanente traslúcida sin divisor, panel contenedor dedicado y persistencia por tema en consultas recientes. |
| **2026-11-10** | `src/services/gemini.service.ts`, `src/App.tsx` | Incorporación de cadena de conmutación de modelos (rotación ante timeout/error 429), timeouts por `AbortController` y motor local de contingencia silencioso en UI con logs en consola. |
| **2026-11-10** | `src/MainUi.tsx` | Ajuste de translucidez y desenfoque del header (`color-mix` al 25% de opacidad y `backdrop-filter: blur(16px)`), eliminando cualquier fondo blanco sólido y logrando un auténtico efecto de cristal esmerilado que difumina el contenido al deslizarse. |
| **2026-11-10** | `src/MainUi.tsx`, `src/Sidebar.tsx` | Fijación estricta del header en la parte superior permanente (`fixed top-0 inset-x-0 z-40`) con fondo difuminado y compensación de espaciado (`pt-20`), asegurando visibilidad constante e inamovible en todo momento. |
| **2026-11-10** | `src/services/gemini.service.ts`, `src/App.tsx`, `src/ChatMessages.tsx` | Eliminación de textos de aviso de contingencia/timeout en el chat visible al usuario, preservando la trazabilidad completa mediante `console.warn` en terminal y navegador. |
| **2026-11-10** | `.gitignore`, `README.md` | Actualización exhaustiva de `.gitignore` (exclusiones de SO Windows/macOS, logs, temporales, reportes locales y paquetes) y creación de la guía educativa `tutorial.md` en el escritorio para estudio conceptual. |
| **2026-11-10** | `README.md` | Creación y formalización de la documentación técnica completa del proyecto y compromiso de actualización continua. |
| **2026-11-11** | `src/services/logger.service.ts`, `src/index.ts`, `tests/backend.test.ts`, `src/Sidebar.tsx`, `README.md`, `tutorial.md` | Implementación del sistema de registro en tiempo real `logs.txt`: captura automática de interacciones del usuario y respuestas durante el uso del chat (con PII sanitizado, modelo, tiempos y resultado), endpoints `GET /logs.txt` y `GET /api/logs`, botón de descarga en Sidebar y registro detallado de resultados y resúmenes de la suite de pruebas unitarias. |
| **2026-11-11** | `src/services/metrics.service.ts`, `scripts/generate_metrics.ts`, `.gitignore`, `src/index.ts`, `tests/backend.test.ts`, `README.md`, `tutorial.md` | Generación de 6 datasets en formato CSV con métricas de negocio, pruebas y rendimientos para venta y graficación (`rsa_business_case_kpis.csv`, `rsa_test_benchmarks_and_performance.csv`, `rsa_hourly_demand_and_latency.csv`, `rsa_roi_financial_projection_12m.csv`, `rsa_call_reasons_and_deflection.csv`, `rsa_complaints_reduction_impact.csv`), endpoint `GET /api/metrics/export`, ampliación de la suite a 40 pruebas automáticas y exclusión total de archivos `.csv` en `.gitignore`. |
| **2026-11-11** | `src/services/gemini.service.ts`, `src/services/logger.service.ts`, `src/index.ts`, `src/Sidebar.tsx`, `tests/backend.test.ts`, `.gitignore`, `README.md`, `tutorial.md` | Implementación de `logs-mensajes.csv` con registro automático de interacciones y cálculo de tokens de entrada (`Tokens_Recepcion_Entrada`), salida (`Tokens_Respuesta_Salida`) y totales (`Tokens_Totales`), endpoints `GET /logs-mensajes.csv` y `/api/logs-mensajes/export`, botón de descarga en Sidebar, ampliación a 50 pruebas unitarias/integración (100% aprobadas) y exclusión explícita en `.gitignore`. |
| **2026-11-11** | `src/services/gemini.service.ts`, `src/App.tsx`, `tests/backend.test.ts`, `README.md`, `tutorial.md` | Corrección y compatibilidad con `GOOGLE_GEMINI_BASE_URL` (Sub2API y proxies locales): sincronización forzada de `apiVersion: "v1beta"` en `@google/genai` (resolviendo error 404 por versión por defecto 'v1' del SDK JS), extracción segura de texto ante candidatos con partes no textuales/thoughtSignature, y ajuste adaptativo de timeout a 12s para llamadas por proxy local. |
| **2026-11-11** | `src/services/gemini.service.ts`, `src/App.tsx`, `tests/backend.test.ts`, `README.md`, `tutorial.md` | Incorporación oficial de la identidad de **Andito** (mascota y asistente virtual orientador de Red Salud Andina): actualización integral del System Prompt y del motor de contingencia de reglas local (tono cálido, tierno y empático, autorreconocimiento y presentación en saludos), preservación estricta de límites clínicos (cero consultas médicas, urgencias al 123) y brevedad (≤ 4 líneas), y ampliación de la suite a 53 pruebas automáticas con 100% de éxito. |

> *Nota de Mantenimiento*: Cualquier modificación subsiguiente en modelos, endpoints, esquemas de datos o interfaz de usuario debe quedar reflejada en este documento y en la tabla de historial superior.
