import { IconoOrden } from "./Iconos.jsx";


const OPCIONES = [
  { valor: "nombre", texto: "Nombre (A–Z)" },
  { valor: "precio_asc", texto: "Precio: menor a mayor" },
  { valor: "precio_desc", texto: "Precio: mayor a menor" },
];

// Lista desplegable para ordenar los productos. Usa el mismo estilo que el filtro de stock
 
export default function OrdenProductos({ valor, onCambiar }) {
  return (
    <div className="filtro">
      <label htmlFor="orden-productos" className="visualmente-oculto">
        Ordenar productos
      </label>
      <IconoOrden />
      <select
        id="orden-productos"
        className={`filtro__select${valor !== "nombre" ? " filtro__select--activo" : ""}`}
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
