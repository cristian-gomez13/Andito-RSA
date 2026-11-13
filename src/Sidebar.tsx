import React, { useState, useEffect } from "react";
import { LocationClockIcon, HumanSupportIcon } from "./icons";
import anditoAvatarImg from "./assets/Andito-avatar.png";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  recentQueries?: string[];
  onSelectQuery?: (query: string) => void;
  onNewChat?: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  recentQueries = [],
  onSelectQuery,
  onNewChat
}: SidebarProps) {
  const [unresolvedCount, setUnresolvedCount] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Consultar estadísticas de preguntas no resueltas cuando el panel se abre
  useEffect(() => {
    if (isOpen) {
      fetch("/api/unresolved")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.count !== undefined) {
            setUnresolvedCount(data.count);
          }
        })
        .catch(() => {
          // Fallback silencioso en caso de error de red
        });
    }
  }, [isOpen]);

  const handleExport = async (format: "csv" | "json" = "csv") => {
    setIsExporting(true);
    setExportMessage("Generando archivo...");

    try {
      const res = await fetch(`/api/unresolved/export?format=${format}`);
      if (!res.ok) {
        throw new Error("No fue posible generar el archivo de exportación.");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `preguntas_no_resueltas_rsa.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setExportMessage("Descarga completada");
      setTimeout(() => setExportMessage(null), 3000);
    } catch (err: any) {
      setExportMessage("Error al exportar");
      setTimeout(() => setExportMessage(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadLogs = async () => {
    setIsExporting(true);
    setExportMessage("Descargando logs...");
    try {
      const res = await fetch("/logs.txt");
      if (!res.ok) throw new Error("No se pudo descargar logs.txt");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "logs.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setExportMessage("logs.txt descargado");
      setTimeout(() => setExportMessage(null), 3000);
    } catch {
      setExportMessage("Error al descargar logs");
      setTimeout(() => setExportMessage(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadLogsMensajesCSV = async () => {
    setIsExporting(true);
    setExportMessage("Descargando registro de mensajes...");
    try {
      const res = await fetch("/logs-mensajes.csv");
      if (!res.ok) throw new Error("No se pudo descargar logs-mensajes.csv");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "logs-mensajes.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setExportMessage("logs-mensajes.csv descargado");
      setTimeout(() => setExportMessage(null), 3000);
    } catch {
      setExportMessage("Error al descargar mensajes CSV");
      setTimeout(() => setExportMessage(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadMetricsCSV = async () => {
    setIsExporting(true);
    setExportMessage("Descargando métricas de pruebas...");
    try {
      const res = await fetch("/api/metrics/export?type=live");
      if (!res.ok) throw new Error("No se pudo descargar");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "rsa_live_testing_results.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setExportMessage("Métricas CSV descargadas");
      setTimeout(() => setExportMessage(null), 3000);
    } catch {
      setExportMessage("Error al descargar CSV");
      setTimeout(() => setExportMessage(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-crust/50 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      />

      {/* Drawer Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[375px] max-w-[85vw] flex-col justify-between rounded-[0px_45px_45px_0px] bg-mantle py-4 px-[19px] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Panel de opciones y consultas recientes"
      >
        {/* Header: Title + Collapse Button */}
        <div>
          <div className="flex w-full items-center justify-between py-4 px-2">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-visible">
                <img
                  src={anditoAvatarImg}
                  alt="Andito"
                  className="h-9 w-9 max-w-none object-contain select-none -translate-y-0.5"
                />
              </div>
              <p className="font-['Sorts_Mill_Goudy'] text-[24px] font-normal italic text-text select-none">
                Red Salud Andina
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel lateral"
              className="flex h-10 w-10 items-center justify-center rounded-[19.28px] text-overlay1 transition-colors hover:bg-surface0 hover:text-text cursor-pointer focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="m14 9-3 3 3 3" />
              </svg>
            </button>
          </div>

          {/* Nueva Consulta Button */}
          {onNewChat && (
            <div className="px-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 rounded-2xl border border-surface1 bg-surface0 px-4 py-2.5 text-sm font-medium text-text transition hover:border-teal hover:bg-surface1/60 focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none cursor-pointer"
              >
                <svg
                  className="h-4 w-4 text-teal"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Nueva consulta</span>
              </button>
            </div>
          )}
        </div>

        {/* Content / Middle Section: Recent Consultations */}
        <div className="flex-1 w-full overflow-y-auto py-4 px-2 scrollbar-thin">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between pb-2">
                <span className="font-['Inter'] text-xs font-semibold uppercase tracking-wider text-subtext1">
                  Consultas recientes
                </span>
                {recentQueries.length > 0 && (
                  <span className="rounded-full bg-surface0 px-2 py-0.5 text-[11px] font-medium text-subtext0">
                    {recentQueries.length}
                  </span>
                )}
              </div>

              {recentQueries.length === 0 ? (
                <div className="rounded-2xl border border-surface1/70 bg-surface0/40 p-4 text-center">
                  <p className="text-xs text-subtext1 leading-relaxed">
                    Aún no hay consultas en esta sesión. Tus preguntas frecuentes sobre sedes, citas y cuotas se guardarán aquí.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5" role="list">
                  {recentQueries.map((query, index) => (
                    <li key={`${query}-${index}`}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectQuery?.(query);
                          onClose();
                        }}
                        className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-text transition-colors hover:bg-surface0 focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none cursor-pointer"
                      >
                        <svg
                          className="h-4 w-4 shrink-0 text-overlay1 group-hover:text-teal transition-colors"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="truncate group-hover:text-teal transition-colors">
                          {query}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Canales Oficiales Information Box */}
            <div className="rounded-2xl border border-surface1/70 bg-surface0/30 p-3.5 text-xs text-subtext0">
              <span className="font-semibold text-text block mb-1.5">
                Canales de Atención Oficial
              </span>
              <ul className="space-y-1.5 text-[11px]">
                <li className="flex items-center gap-2">
                  <HumanSupportIcon className="h-3.5 w-3.5 text-teal shrink-0" />
                  <span>Call Center: (601) 555 0100</span>
                </li>
                <li className="flex items-center gap-2">
                  <LocationClockIcon className="h-3.5 w-3.5 text-teal shrink-0" />
                  <span>WhatsApp: +57 300 555 0100</span>
                </li>
                <li className="text-overlay1 pt-1 border-t border-surface1/40">
                  Urgencias vitales: Línea 123
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer: Line Divisor + Export Button with Status */}
        <div className="flex w-full flex-col gap-3 items-start pb-2 px-2">
          <div className="h-[1px] w-full bg-surface1" />

          {/* Unresolved Questions Status Badge */}
          {unresolvedCount !== null && (
            <div className="flex items-center justify-between w-full px-1 text-xs text-subtext1">
              <span>Preguntas no resueltas:</span>
              <span className="font-medium text-peach">
                {unresolvedCount} registradas
              </span>
            </div>
          )}

          {/* Export & Logs Buttons */}
          <div className="flex w-full flex-col gap-1.5">
            <button
              type="button"
              onClick={() => handleExport("csv")}
              disabled={isExporting}
              aria-label="Exportar preguntas no resueltas a CSV"
              className="flex w-full items-center justify-between py-[9px] px-4 rounded-xl text-text transition-colors hover:bg-surface0 disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none"
            >
              <div className="flex items-center gap-3">
                <p className="font-['Inter'] text-[16px] font-normal leading-none">
                  Exportar Reporte
                </p>
                <svg
                  className="h-4 w-4 text-overlay1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 15V3" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M20 21H4" />
                </svg>
              </div>

              <span className="rounded-md bg-surface1/60 px-2 py-0.5 text-[11px] font-medium text-subtext0">
                CSV
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadLogs}
              disabled={isExporting}
              aria-label="Descargar archivo de registro logs.txt"
              className="flex w-full items-center justify-between py-[9px] px-4 rounded-xl text-text transition-colors hover:bg-surface0 disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none"
            >
              <div className="flex items-center gap-3">
                <p className="font-['Inter'] text-[16px] font-normal leading-none">
                  Descargar Registro
                </p>
                <svg
                  className="h-4 w-4 text-teal"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>

              <span className="rounded-md bg-teal/15 text-teal px-2 py-0.5 text-[11px] font-medium">
                logs.txt
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadLogsMensajesCSV}
              disabled={isExporting}
              aria-label="Descargar registro de mensajes y tokens en formato CSV"
              className="flex w-full items-center justify-between py-[9px] px-4 rounded-xl text-text transition-colors hover:bg-surface0 disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:outline-none"
            >
              <div className="flex items-center gap-3">
                <p className="font-['Inter'] text-[16px] font-normal leading-none">
                  Registro de Mensajes
                </p>
                <svg
                  className="h-4 w-4 text-sapphire"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <line x1="9" y1="10" x2="15" y2="10" />
                </svg>
              </div>

              <span className="rounded-md bg-sapphire/15 text-sapphire px-2 py-0.5 text-[11px] font-medium font-mono">
                logs-mensajes.csv
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMetricsCSV}
              disabled={isExporting}
              aria-label="Descargar métricas de testing en CSV para gráficos"
              className="flex w-full items-center justify-between py-[9px] px-4 rounded-xl text-text transition-colors hover:bg-surface0 disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-peach focus-visible:outline-none"
            >
              <div className="flex items-center gap-3">
                <p className="font-['Inter'] text-[16px] font-normal leading-none">
                  Métricas de Pruebas
                </p>
                <svg
                  className="h-4 w-4 text-peach"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>

              <span className="rounded-md bg-peach/15 text-peach px-2 py-0.5 text-[11px] font-medium">
                test.csv
              </span>
            </button>

            {exportMessage && (
              <p className="px-4 text-[11px] text-teal animate-fade-in">
                {exportMessage}
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
