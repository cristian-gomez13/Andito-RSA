import React from "react";
import type { IconProps } from "./types";

/**
 * LocationClockIcon - Píldora de sugerencia para Sedes y Horarios de atención.
 * Fusión de chincheta de ubicación geográfica + manecillas de reloj.
 */
export const LocationClockIcon: React.FC<IconProps> = ({
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
      aria-label="Sedes y Horarios"
      {...props}
    >
      {/* Marcador de mapa */}
      <path
        d="M12 21.2C12 21.2 19 14.8 19 9.5C19 5.634 15.866 2.5 12 2.5C8.134 2.5 5 5.634 5 9.5C5 14.8 12 21.2 12 21.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Reloj interior */}
      <circle cx="12" cy="9.5" r="4.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7.5V9.5L13.8 10.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
