import { IconoFiltro } from "./Iconos.jsx";

// "" = sin filtro. Los valores "con" y "sin" son los que entiende el backend.
const OPCIONES = [
  { valor: "", texto: "Todos los productos" },
  { valor: "con", texto: "Productos con stock" },
  { valor: "sin", texto: "Productos sin stock" },
];

/**
 * Lista desplegable con aspecto de botón para filtrar por stock.
 * Es un <select> nativo: funciona con teclado, en celular y con lectores de pantalla.
 * Cuando hay un filtro activo, se resalta en azul.
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
