import React from "react";
import type { IconProps } from "./types";

/**
 * CalendarIcon - Píldora de sugerencia para Citas Médicas / Agendamiento / Disponibilidad.
 */
export const CalendarIcon: React.FC<IconProps> = ({
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
      aria-label="Citas y Calendario"
      {...props}
    >
      <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 2V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 2V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* Puntos destacados de fecha */}
      <circle cx="8" cy="13" r="1.1" fill="currentColor" />
      <circle cx="12" cy="13" r="1.1" fill="currentColor" />
      <circle cx="16" cy="13" r="1.1" fill="currentColor" />
      <circle cx="8" cy="17" r="1.1" fill="currentColor" />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </svg>
  );
};
