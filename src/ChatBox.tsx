import React, { useState, useEffect, useRef } from "react";
import { SendButton, VoiceButton } from "./buttons/ActionButtons";

interface ChatBoxProps {
  onSubmit?: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatBox({
  onSubmit,
  isLoading = false,
  placeholder = "Escribe tu consulta sobre sedes, citas o requisitos..."
}: ChatBoxProps) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-CO";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      // Not supported feedback without disruptive modal
      setValue("¿Cuáles son los horarios de atención y sedes?");
      inputRef.current?.focus();
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit?.(value.trim());
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full max-w-[768px] min-h-[52px] items-center justify-between gap-4 rounded-[45px] border border-overlay2 bg-surface0 py-[6px] pl-5 pr-2 transition focus-within:ring-2 focus-within:ring-overlay1/50 ${
        isLoading ? "opacity-80" : ""
      }`}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        disabled={isLoading}
        onChange={(e) => setValue(e.target.value)}
        placeholder={isListening ? "Escuchando consulta..." : placeholder}
        aria-label="Escribe tu consulta para Red Salud Andina"
        className="w-full bg-transparent font-['Inter'] text-[16px] font-normal text-text placeholder-subtext1 outline-none disabled:cursor-not-allowed"
      />

      {value.trim().length > 0 ? (
        <SendButton type="submit" disabled={isLoading} />
      ) : (
        <VoiceButton
          onClick={handleVoiceToggle}
          disabled={isLoading}
          isListening={isListening}
        />
      )}
    </form>
  );
}

export default ChatBox;
