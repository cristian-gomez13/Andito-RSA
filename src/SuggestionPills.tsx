import React from "react";
import {
  LocationClockIcon,
  RequirementsDocIcon,
  CurrencyCoinsIcon,
  CalendarIcon
} from "./icons";

export interface SuggestionPillItem {
  id: string;
  label: string;
  query: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SUGGESTIONS: SuggestionPillItem[] = [
  {
    id: "sedes-horarios",
    label: "Sedes y horarios",
    query: "¿Cuáles son las sedes de atención y sus horarios?",
    description: "8 sedes disponibles con atención continua",
    icon: LocationClockIcon
  },
  {
    id: "requisitos-citas",
    label: "Requisitos para citas",
    query: "¿Cuáles son los requisitos y documentos necesarios para solicitar una cita?",
    description: "Órdenes médicas, autorizaciones y vigencias",
    icon: RequirementsDocIcon
  },
  {
    id: "cuotas-moderadoras",
    label: "Cuotas moderadoras",
    query: "¿Cuáles son los valores de las cuotas moderadoras para medicina general, especialistas y odontología?",
    description: "Tarifas de $5.000, $12.000, $8.000 y exenciones",
    icon: CurrencyCoinsIcon
  },
  {
    id: "laboratorio-resultados",
    label: "Laboratorio y resultados",
    query: "¿Dónde puedo consultar los resultados de laboratorio y cuáles son los horarios de toma de muestras?",
    description: "Sedes con laboratorio y consulta web",
    icon: CalendarIcon
  }
];

interface SuggestionPillsProps {
  onSelect: (query: string) => void;
  compact?: boolean;
}

export function SuggestionPills({ onSelect, compact = false }: SuggestionPillsProps) {
  if (compact) {
    return (
      <div
        className="flex w-full items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-none"
        role="region"
        aria-label="Sugerencias rápidas de consulta"
      >
        {SUGGESTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.query)}
              className="flex shrink-0 items-center gap-2 rounded-full border border-surface1 bg-surface0 px-3.5 py-1.5 text-xs font-medium text-text transition hover:border-teal hover:bg-surface1/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal active:scale-98"
            >
              <Icon className="h-3.5 w-3.5 text-teal" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="grid w-full max-w-[768px] grid-cols-1 gap-3 sm:grid-cols-2"
      role="region"
      aria-label="Preguntas frecuentes de orientación"
    >
      {SUGGESTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.query)}
            className="group flex items-start gap-3.5 rounded-2xl border border-surface1 bg-surface0/70 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-teal/60 hover:bg-surface0 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal active:translate-y-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mantle text-teal transition-colors group-hover:bg-teal group-hover:text-crust">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-['Inter'] text-sm font-semibold text-text group-hover:text-teal transition-colors">
                {item.label}
              </span>
              <span className="font-['Inter'] text-xs text-subtext1 line-clamp-1">
                {item.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
