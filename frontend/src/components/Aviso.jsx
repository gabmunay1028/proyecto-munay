import { useEffect } from "react";

/**
 * Mensaje para el usuario: "exito" (verde) o "error" (rojo).
 */
export default function Aviso({ tipo, texto, onCerrar }) {
  useEffect(() => {
    if (tipo !== "exito") return;
    const temporizador = setTimeout(onCerrar, 5000);
    return () => clearTimeout(temporizador);
  }, [tipo, texto, onCerrar]);

  return (
    <div className={`aviso aviso--${tipo}`} role={tipo === "error" ? "alert" : "status"}>
      <span>{texto}</span>
      <button type="button" className="aviso__cerrar" onClick={onCerrar} aria-label="Cerrar mensaje">
        ×
      </button>
    </div>
  );
}
