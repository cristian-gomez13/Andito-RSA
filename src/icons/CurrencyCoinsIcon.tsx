import React from "react";
import type { IconProps } from "./types";

/**
 * CurrencyCoinsIcon - Píldora de sugerencia para Cuotas moderadoras / Tarifas / Copagos.
 * Monedas apiladas en perspectiva con símbolo monetario limpio.
 */
export const CurrencyCoinsIcon: React.FC<IconProps> = ({
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
      aria-label="Cuotas Moderadoras y Tarifas"
      {...props}
    >
      {/* Moneda superior */}
      <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.8" />
      
      {/* Nivel medio de la pila */}
      <path
        d="M4 6V11C4 12.6569 7.58172 14 12 14C16.4183 14 20 12.6569 20 11V6"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      
      {/* Nivel base de la pila */}
      <path
        d="M4 11V16C4 17.6569 7.58172 19 12 19C16.4183 19 20 17.6569 20 16V11"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      {/* Símbolo de moneda / signo sutil en la cara superior */}
      <path
        d="M12 4.6V7.4M10.8 5.3C11 5 11.5 4.8 12 4.8C12.8 4.8 13.2 5.1 13.2 5.6C13.2 6.2 12.5 6.4 12 6.5C11.3 6.6 10.8 6.9 10.8 7.5C10.8 8 11.4 8.3 12 8.3C12.7 8.3 13.1 8 13.3 7.7"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
};
