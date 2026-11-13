import React, { useEffect, useRef, useState } from "react";
import type { ChatMessageItem } from "./types/chat";
import { UserAvatarIcon, HumanSupportIcon } from "./icons";
import anditoAvatarImg from "./assets/Andito-avatar.png";
import anditoAvatarThinkingImg from "./assets/Andito-avatar-thinking.png";

interface ChatMessagesProps {
  messages: ChatMessageItem[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function ChatMessages({
  messages,
  isLoading,
  error,
  onRetry
}: ChatMessagesProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Temporizador visible mientras el agente redacta la respuesta
  useEffect(() => {
    let timer: any = null;
    if (isLoading) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error, elapsedSeconds]);

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div
      className="flex w-full max-w-[840px] flex-1 flex-col gap-6 px-4 py-6 md:px-6"
      role="log"
      aria-live="polite"
      aria-label="Historial de mensajes de la consulta"
    >
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            className={`flex w-full items-start gap-3 transition-opacity duration-300 ${
              isUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center ${
                isUser
                  ? "rounded-full bg-surface1 text-text shadow-xs overflow-hidden"
                  : "overflow-visible"
              }`}
              aria-hidden="true"
            >
              {isUser ? (
                <UserAvatarIcon className="h-5 w-5 text-subtext0" />
              ) : (
                <img
                  src={anditoAvatarImg}
                  alt="Andito"
                  className="h-10 w-10 max-w-none object-contain select-none -translate-y-0.5 filter drop-shadow-xs"
                />
              )}
            </div>

            {/* Bubble Container */}
            <div
              className={`flex max-w-[85%] sm:max-w-[78%] flex-col gap-1.5 ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              {/* Header Label */}
              <div className="flex items-center gap-2 px-1 text-xs text-subtext1">
                <span className="font-medium text-text">
                  {isUser ? "Tú" : "Andito"}
                </span>
                {!isUser && (
                  <span className="rounded-md bg-teal/10 px-1.5 py-0.5 text-[10px] font-semibold text-teal">
                    Asistente Oficial
                  </span>
                )}
                <time className="text-[11px] text-overlay0">
                  {formatTime(message.timestamp)}
                </time>
              </div>

              {/* Message Content */}
              <div
                className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-xs transition-colors ${
                  isUser
                    ? "rounded-tr-xs bg-surface1 text-text"
                    : "rounded-tl-xs border border-surface1 bg-surface0/90 text-text"
                }`}
              >
                <div className="whitespace-pre-wrap font-['Inter']">
                  {message.content}
                </div>

                {/* Unresolved / Referral Box */}
                {!isUser && message.unresolved && (
                  <div className="mt-3.5 flex flex-col gap-2 rounded-xl border border-peach/30 bg-mantle/70 p-3 text-xs text-text">
                    <div className="flex items-center gap-1.5 font-semibold text-peach">
                      <HumanSupportIcon className="h-4 w-4" />
                      <span>Atención personalizada y asesor humano</span>
                    </div>
                    <p className="text-subtext0">
                      Para este trámite o confirmación específica, nuestros asesores están disponibles en:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href="tel:6015550100"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-surface2 bg-surface0 px-3 py-1.5 font-medium text-text transition hover:border-teal hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                      >
                        <span>Call Center: (601) 555 0100</span>
                      </a>
                      <a
                        href="https://wa.me/573005550100"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-surface2 bg-surface0 px-3 py-1.5 font-medium text-text transition hover:border-teal hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                      >
                        <span>WhatsApp: +57 300 555 0100</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing Indicator with Visible Timer and Retry Option */}
      {isLoading && (
        <div className="flex w-full items-start gap-3 transition-opacity duration-300">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-visible select-none" aria-hidden="true">
            <img
              src={anditoAvatarThinkingImg}
              alt="Andito pensando"
              className="h-10 w-10 max-w-none object-contain -translate-y-0.5 filter drop-shadow-xs"
            />
          </div>

          <div className="flex flex-col gap-2 items-start max-w-[85%]">
            {/* Header info with live timer badge */}
            <div className="flex items-center flex-wrap gap-2 px-1 text-xs text-subtext1">
              <span className="font-medium text-text">Andito</span>
              <span className="text-[11px] text-teal animate-pulse">redactando respuesta</span>

              {/* Temporizador visible */}
              <div
                className="inline-flex items-center gap-1 rounded-full border border-surface1 bg-surface0 px-2 py-0.5 text-[11px] font-mono font-medium text-text"
                aria-label={`Tiempo transcurrido: ${elapsedSeconds} segundos`}
              >
                <svg
                  className="h-3 w-3 text-teal"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{elapsedSeconds}s</span>
              </div>
            </div>

            {/* Bubble & Retry action row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Bouncing dots bubble */}
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-surface1 bg-surface0/90 px-4 py-3 shadow-xs">
                <span
                  className="h-2 w-2 rounded-full bg-teal animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-teal animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-teal animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
                <span className="sr-only">
                  El asistente está redactando una respuesta. Tiempo: {elapsedSeconds} segundos.
                </span>
              </div>

              {/* Botón de reintento visible durante la respuesta */}
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition cursor-pointer active:scale-95 ${
                    elapsedSeconds >= 4
                      ? "border-peach/60 bg-peach/15 text-peach hover:bg-peach/25 shadow-xs"
                      : "border-surface1 bg-surface0 text-subtext0 hover:bg-surface1 hover:text-text"
                  }`}
                  aria-label="Reintentar consulta si la respuesta demora demasiado"
                >
                  <svg
                    className={`h-3.5 w-3.5 ${elapsedSeconds >= 4 ? "animate-spin text-peach" : "text-overlay1"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 21h5v-5" />
                  </svg>
                  <span>Reintentar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-red/30 bg-red/10 p-4 text-sm text-red"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg border border-red/40 bg-surface0 px-3 py-1 font-medium text-text transition hover:bg-surface1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red cursor-pointer"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      <div ref={scrollEndRef} aria-hidden="true" />
    </div>
  );
}
