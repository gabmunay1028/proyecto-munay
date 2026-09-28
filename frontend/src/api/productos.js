/**
 * Todas las llamadas al backend en un solo lugar.
 *
 * Si el backend responde con error, se lanza un ErrorApi con:
 *   - message: el texto en español que envía el backend en "detail"
 *   - errores: los mensajes por campo ({ precio: "El precio debe ser mayor que 0." })
 *   - estado:  el código HTTP (404, 409, 422, 503...)
 */
import { URL_API } from "../config.js";

export class ErrorApi extends Error {
  constructor(mensaje, errores = {}, estado = 0) {
    super(mensaje);
    this.errores = errores;
    this.estado = estado;
  }
}

async function pedir(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      headers: { "Content-Type": "application/json" },
      ...opciones,
    });
  } catch {
    // fetch solo falla así cuando no hay conexión con el servidor
    throw new ErrorApi(
      "No se pudo conectar con el servidor. Verifica que el backend esté encendido."
    );
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new ErrorApi(
      datos?.detail ?? `Ocurrió un error inesperado (código ${respuesta.status}).`,
      datos?.errores ?? {},
      respuesta.status
    );
  }
  return datos;
}

export function listarProductos(buscar = "") {
  const texto = buscar.trim();
  const consulta = texto ? `?buscar=${encodeURIComponent(texto)}` : "";
  return pedir(`/productos${consulta}`);
}

export function obtenerProducto(id) {
  return pedir(`/productos/${id}`);
}

export function crearProducto(producto) {
  return pedir("/productos", { method: "POST", body: JSON.stringify(producto) });
}

export function actualizarProducto(id, producto) {
  return pedir(`/productos/${id}`, { method: "PUT", body: JSON.stringify(producto) });
}

export function eliminarProducto(id) {
  return pedir(`/productos/${id}`, { method: "DELETE" });
}

export function listarCategorias() {
  return pedir("/categorias");
}
