import { useState } from "react";

const NUEVA = "__nueva__"; // valor especial de la opción "+ Nueva categoría…"

/**
 * Campo de categoría: una lista con las categorías ya registradas y la opción Si no hay categorías muestra directamente la caja de texto.
 */
export default function SelectorCategoria({ categorias, valor, error, onCambiar }) {
  const hayLista = categorias.length > 0;
  const [escribiendo, setEscribiendo] = useState(
    () => !hayLista || (valor !== "" && !categorias.includes(valor))
  );

  function elegir(evento) {
    if (evento.target.value === NUEVA) {
      setEscribiendo(true);
      onCambiar("");
    } else {
      onCambiar(evento.target.value);
    }
  }

  function volverALista() {
    setEscribiendo(false);
    onCambiar("");
  }

  const idMensaje = "categoria-mensaje";
  const propiedadesComunes = {
    id: "categoria",
    name: "categoria",
    "aria-invalid": Boolean(error),
    "aria-describedby": idMensaje,
  };

  return (
    <div className="campo">
      <label htmlFor="categoria">Categoría</label>

      {escribiendo ? (
        <input
          {...propiedadesComunes}
          type="text"
          value={valor}
          onChange={(evento) => onCambiar(evento.target.value)}
          maxLength={50}
          placeholder="Ej.: Accesorios"
          autoFocus={hayLista}
        />
      ) : (
        <select {...propiedadesComunes} value={valor} onChange={elegir}>
          <option value="">Selecciona una categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
          <option value={NUEVA}>+ Nueva categoría…</option>
        </select>
      )}

      {error ? (
        <p id={idMensaje} className="campo__error">
          {error}
        </p>
      ) : (
        <p id={idMensaje} className="campo__ayuda">
          {escribiendo
            ? "Escribe el nombre de la nueva categoría."
            : "Elige una de las categorías registradas o crea una nueva."}
        </p>
      )}

      {escribiendo && hayLista && (
        <button type="button" className="boton-enlace" onClick={volverALista}>
          ← Elegir de la lista
        </button>
      )}
    </div>
  );
}
