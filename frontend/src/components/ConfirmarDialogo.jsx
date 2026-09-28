import { useEffect, useRef } from "react";
import { IconoPapelera } from "./Iconos.jsx";

/**
 * Ventana de confirmación 
 */
export default function ConfirmarDialogo({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  onConfirmar,
  onCancelar,
}) {
  const dialogo = useRef(null);

  
  useEffect(() => {
    const elemento = dialogo.current;
    if (abierto && !elemento.open) elemento.showModal();
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  
  function clicEnFondo(evento) {
    if (evento.target === dialogo.current) onCancelar();
  }

  return (
    <dialog
      ref={dialogo}
      className="dialogo"
      aria-labelledby="dialogo-titulo"
      aria-describedby="dialogo-mensaje"
      onClose={onCancelar} 
      onClick={clicEnFondo}
    >
      <div className="dialogo__contenido">
        <div className="dialogo__icono">
          <IconoPapelera tamano={22} />
        </div>
        <h2 id="dialogo-titulo" className="dialogo__titulo">
          {titulo}
        </h2>
        <p id="dialogo-mensaje" className="dialogo__mensaje">
          {mensaje}
        </p>
        <div className="dialogo__acciones">
          <button type="button" className="boton boton--secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="button" className="boton boton--peligro-solido" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
