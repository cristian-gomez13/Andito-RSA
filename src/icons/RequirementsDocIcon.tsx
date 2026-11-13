import React from "react";
import type { IconProps } from "./types";

/**
 * RequirementsDocIcon - Píldora de sugerencia para Requisitos / Órdenes médicas / Autorizaciones.
 * Hoja documental con checkmark médico y doble línea de texto legal/clínico.
 */
export const RequirementsDocIcon: React.FC<IconProps> = ({
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
      aria-label="Requisitos y Documentación"
      {...props}
    >
      {/* Contorno del documento con solapa superior */}
      <path
        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Checkmark de verificación / requisito cumplido */}
      <path
        d="M8.5 13L10.5 15L15.5 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Líneas de documento */}
      <path d="M8 18H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
};
