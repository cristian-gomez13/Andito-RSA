import React from "react";
import type { IconProps } from "./types";

/**
 * RsaBotIcon - Emblema de Red Salud Andina.
 * Cruz médica estilizada combinada con cordillera andina y pulso vital.
 */
export const RsaBotIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-label="Asistente Red Salud Andina"
      {...props}
    >
      <defs>
        <linearGradient id="rsa-teal-blue" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#179299" />
          <stop offset="50%" stopColor="#209fb5" />
          <stop offset="100%" stopColor="#1e66f5" />
        </linearGradient>
        <linearGradient id="rsa-cross-glow" x1="16" y1="12" x2="32" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#eff1f5" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Escudo / Fondo exterior redondeado */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="12"
        fill="url(#rsa-teal-blue)"
      />

      {/* Trazo sutil de cordillera / cumbres andinas de fondo */}
      <path
        d="M6 34L16 23L23 30L34 18L42 27V36C42 39.3137 39.3137 42 36 42H12C8.68629 42 6 39.3137 6 36V34Z"
        fill="#ffffff"
        fillOpacity="0.12"
      />

      {/* Cruz médica estilizada con bordes suaves */}
      <path
        d="M21 11C21 9.89543 21.8954 9 23 9H25C26.1046 9 27 9.89543 27 11V19H35C36.1046 19 37 19.8954 37 21V23C37 24.1046 36.1046 25 35 25H27V33C27 34.1046 26.1046 35 25 35H23C21.8954 35 21 34.1046 21 33V25H13C11.8954 25 11 24.1046 11 23V21C11 19.8954 11.8954 19 13 19H21V11Z"
        fill="url(#rsa-cross-glow)"
      />

      {/* Pulso de salud andino en el centro de la cruz */}
      <path
        d="M17 22H21L23 17L25 27L27 22H31"
        stroke="#179299"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Chispa / Asistente inteligente indicador en la esquina superior */}
      <circle cx="36" cy="12" r="2.5" fill="#40a02b" />
      <circle cx="36" cy="12" r="1.5" fill="#ffffff" />
    </svg>
  );
};
