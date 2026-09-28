/**
 * Íconos dibujados con SVG (sin librerías). Toman el color del texto que los rodea.
 * aria-hidden: son decorativos; el texto del botón ya dice qué hace.
 */
const propiedades = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function IconoVolver() {
  return (
    <svg {...propiedades}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export function IconoFiltro() {
  return (
    <svg {...propiedades}>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  );
}

export function IconoPapelera({ tamano = 18 }) {
  return (
    <svg {...propiedades} width={tamano} height={tamano}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
