interface ButtonProps {
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  isListening?: boolean;
}

export function VoiceButton({ onClick, disabled = false, isListening = false }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? "Detener dictado por voz" : "Dictar consulta por voz"}
      aria-pressed={isListening}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)] transition ${
        isListening
          ? "bg-red text-crust scale-105 ring-2 ring-red/40"
          : "bg-flamingo text-crust hover:opacity-90 active:scale-95"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M17 5v14M7 5v14M2 9v6M22 9v6" />
      </svg>
    </button>
  );
}

export function SendButton({ onClick, type = "submit", disabled = false }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label="Enviar consulta"
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-flamingo shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)] transition ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 active:scale-95 cursor-pointer"
      }`}
    >
      <svg
        className="h-5 w-5 text-crust"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
