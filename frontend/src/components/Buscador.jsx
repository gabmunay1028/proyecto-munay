/** Caja de búsqueda por nombre o código. */
export default function Buscador({ valor, onCambiar }) {
  return (
    <div className="buscador">
      <label htmlFor="buscar" className="visualmente-oculto">
        Buscar producto por nombre o código
      </label>
      <input
        id="buscar"
        type="search"
        placeholder="Buscar por nombre o código…"
        value={valor}
        onChange={(evento) => onCambiar(evento.target.value)}
        maxLength={100}
        autoComplete="off"
      />
      {valor && (
        <button type="button" className="boton boton--secundario" onClick={() => onCambiar("")}>
          Limpiar
        </button>
      )}
    </div>
  );
}
