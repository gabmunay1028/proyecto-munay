import { IconoFiltro } from "./Iconos.jsx";

const OPCIONES = [
  { valor: "", texto: "Todos los productos" },
  { valor: "con", texto: "Productos con stock" },
  { valor: "sin", texto: "Productos sin stock" },
];

/**
 * Lista desplegable con aspecto de botón para filtrar por stock.
 */
export default function FiltroStock({ valor, onCambiar }) {
  return (
    <div className="filtro">
      <label htmlFor="filtro-stock" className="visualmente-oculto">
        Filtrar por stock
      </label>
      <IconoFiltro />
      <select
        id="filtro-stock"
        className={`filtro__select${valor ? " filtro__select--activo" : ""}`}
        value={valor}
        onChange={(evento) => onCambiar(evento.target.value)}
      >
        {OPCIONES.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
    </div>
  );
}
