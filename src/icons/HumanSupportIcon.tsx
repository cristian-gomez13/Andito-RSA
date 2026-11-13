import React from "react";
import type { IconProps } from "./types";

/**
 * HumanSupportIcon - Píldora de sugerencia para Derivación / Atención humana / Asesor / Call Center.
 * Agente con auricular de soporte e indicador de atención personalizada.
 */
export const HumanSupportIcon: React.FC<IconProps> = ({
  className = "w-5 h-5",
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-label="Derivación y Atención Humana"
      {...props}
    >
      {/* Cabeza */}
      <circle cx="12" cy="11" r="4" stroke="currentColor" strokeWidth="1.8" />
      
      {/* Auricular con diadema */}
      <path
        d="M6.5 11C6.5 7.96243 8.96243 5.5 12 5.5C15.0376 5.5 17.5 7.96243 17.5 11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Almohadilla izquierda */}
      <rect x="5.5" y="9.5" width="2" height="3.5" rx="1" fill="currentColor" />
      {/* Almohadilla derecha */}
      <rect x="16.5" y="9.5" width="2" height="3.5" rx="1" fill="currentColor" />
      {/* Brazo del micrófono */}
      <path
        d="M17.5 12.5V13.8C17.5 15.2 16.2 16.5 14.8 16.5H13.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Hombros / Torso */}
      <path
        d="M5 20.5C5 18 8 16.5 12 16.5C16 16.5 19 18 19 20.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};
