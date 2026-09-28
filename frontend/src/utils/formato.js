// Formatos para mostrar datos al usuario

export const formatoSoles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

const formatoFecha = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * Fecha del backend ("2026-09-28T12:40:01.123456") como "28 sept 2026, 12:40".
 */
export function formatearFecha(texto) {
  if (!texto) return null;
  // Se quedan solo los milisegundos: algunos navegadores no leen 6 decimales
  return formatoFecha.format(new Date(texto.slice(0, 23)));
}
