import React from "react";
import type { IconProps } from "./types";

/**
 * UserAvatarIcon - Avatar accesible y equilibrado para el usuario en el chat.
 */
export const UserAvatarIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
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
      aria-label="Usuario"
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.3" />
      <circle cx="12" cy="8.2" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6.2 18.2C7.3 15.6 9.4 14.2 12 14.2C14.6 14.2 16.7 15.6 17.8 18.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};
