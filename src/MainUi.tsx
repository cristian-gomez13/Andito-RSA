import React from "react";
import { ChatBox } from "./ChatBox";
import { ChatMessages } from "./ChatMessages";
import { SuggestionPills } from "./SuggestionPills";
import anditoHeroImg from "./assets/Andito.png";
import anditoAvatarImg from "./assets/Andito-avatar.png";
import type { ChatMessageItem } from "./types/chat";

interface MainUiProps {
  onOpenSidebar?: () => void;
  onSubmit: (query: string) => void;
  messages: ChatMessageItem[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onNewChat?: () => void;
}

export function MainUi({
  onOpenSidebar,
  onSubmit,
  messages,
  isLoading,
  error,
  onRetry,
  onNewChat
}: MainUiProps) {
  const hasMessages = messages.length > 0;

  // Saludo contextual según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Buenos días, ¿listo para consultar?";
    if (hour >= 12 && hour < 19) return "Buenas tardes, ¿listo para consultar?";
    return "Buenas noches, ¿listo para consultar?";
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-base text-text selection:bg-surface1">
      {/* 
        Top Bar Header: ALWAYS on top of the viewport (fixed top-0 inset-x-0 z-40), NO border/line divisor, frosted blur behind it.
      */}
      <header
        className="fixed top-0 inset-x-0 z-40 flex h-16 w-full items-center justify-between px-4 backdrop-blur-xl sm:px-10 transition-colors"
        style={{
          backgroundColor: "color-mix(in srgb, var(--base) 25%, transparent)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)"
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Abrir panel lateral"
            className="flex items-center justify-center rounded-[45px] p-2 text-overlay1 transition hover:bg-surface0 hover:text-text cursor-pointer focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>

          {/* Header branding visible ALWAYS with Andito official avatar */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center overflow-visible">
              <img
                src={anditoAvatarImg}
                alt="Andito, asistente oficial"
                className="h-10 w-10 sm:h-11 sm:w-11 max-w-none object-contain select-none -translate-y-0.5 filter drop-shadow-xs"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-['Sorts_Mill_Goudy'] text-lg font-normal italic text-text sm:text-xl leading-none">
                  Red Salud Andina
                </span>
                <span className="rounded-full bg-teal/15 text-teal px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                  Andito
                </span>
              </div>
              <span className="font-['Inter'] text-[10px] text-subtext1 font-medium tracking-wide">
                Orientación Oficial al Usuario
              </span>
            </div>
          </div>
        </div>

        {/* Action button in header */}
        <div className="flex items-center gap-2">
          {hasMessages && onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="flex items-center gap-1.5 rounded-full border border-surface1 bg-surface0 px-3.5 py-1.5 text-xs font-medium text-text transition hover:border-teal hover:bg-surface1/60 focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none cursor-pointer"
            >
              <svg
                className="h-3.5 w-3.5 text-teal"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="hidden sm:inline">Nueva consulta</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area: Chat in a dedicated card panel (cleared from fixed header by pt-20) */}
      <div className="flex flex-1 w-full flex-col items-center px-3 sm:px-6 pb-6 pt-20">
        <section
          className="relative flex w-full max-w-[880px] flex-1 flex-col rounded-3xl sm:rounded-[32px] border border-surface1/80 bg-mantle/75 backdrop-blur-sm shadow-xl shadow-surface0/30 overflow-hidden my-2 sm:my-3 transition-all min-h-[520px]"
          aria-label="Panel de conversación con Red Salud Andina"
        >
          {/* Panel Top Status Bar */}
          <div className="flex items-center justify-between border-b border-surface1/40 bg-surface0/30 px-5 py-2.5 text-xs text-subtext1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-visible">
                <img
                  src={anditoAvatarImg}
                  alt="Andito"
                  className="h-7 w-7 max-w-none object-contain select-none -translate-y-0.5"
                />
              </div>
              <span className="font-medium text-text">Andito • Asistente Virtual RSA</span>
              <span className="hidden sm:inline text-overlay1">•</span>
              <span className="hidden sm:inline text-subtext0">
                Información de sedes, citas, horarios y cuotas
              </span>
            </div>
            <div className="text-[11px] text-overlay1">
              {hasMessages ? `${messages.length} mensajes` : "En espera"}
            </div>
          </div>

          {!hasMessages ? (
            /* Panel content: Welcoming Hero State with Andito Mascot */
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8 sm:py-12 text-center animate-fade-in">
              <div className="flex flex-col items-center gap-3.5 max-w-[620px]">
                {/* Mascota Andito en bienvenida */}
                <div className="relative flex flex-col items-center">
                  <img
                    src={anditoHeroImg}
                    alt="Andito, tierno asistente y orientador oficial de Red Salud Andina"
                    className="h-28 sm:h-36 md:h-40 w-auto object-contain select-none filter drop-shadow-md transition-transform duration-300 hover:scale-105"
                    loading="eager"
                  />
                  <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-2.5 py-0.5 text-[11px] font-medium text-teal">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                    ¡Hola! Soy Andito, tu orientador de salud
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <h1 className="font-['Sorts_Mill_Goudy'] text-[32px] sm:text-[40px] font-normal text-text leading-tight">
                    {getGreeting()}
                  </h1>
                  <p className="font-['Inter'] text-sm sm:text-base text-text max-w-[500px] leading-relaxed">
                    Consulta sedes, horarios, cuotas moderadoras y requisitos de citas de Red Salud Andina de forma inmediata.
                  </p>
                </div>
              </div>

              {/* Chat Input */}
              <div className="w-full flex justify-center px-2">
                <ChatBox onSubmit={onSubmit} isLoading={isLoading} />
              </div>

              {/* Suggestions */}
              <div className="w-full flex flex-col items-center gap-3 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-overlay1">
                  Preguntas frecuentes
                </span>
                <SuggestionPills onSelect={onSubmit} />
              </div>
            </div>
          ) : (
            /* Panel content: Active Conversation State */
            <div className="flex flex-1 flex-col justify-between overflow-hidden h-[calc(100vh-9.5rem)]">
              {/* Scrollable messages area inside the panel */}
              <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 scrollbar-thin">
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  error={error}
                  onRetry={onRetry}
                />
              </div>

              {/* Docked input container inside the panel bottom */}
              <div className="border-t border-surface1/40 bg-surface0/40 p-3 sm:p-4 backdrop-blur-xs">
                <div className="flex flex-col gap-2 max-w-[768px] mx-auto">
                  <SuggestionPills onSelect={onSubmit} compact />

                  <ChatBox
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                    placeholder="Escribe tu consulta adicional sobre sedes, citas o cuotas..."
                  />

                  <p className="text-center font-['Inter'] text-[11px] text-overlay1">
                    El asistente orienta e informa. No sustituye criterio médico ni atiende urgencias vitales (Línea 123).
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default MainUi;
