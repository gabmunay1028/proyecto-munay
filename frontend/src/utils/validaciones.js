/**
 * Validaciones del formulario, con las mismas reglas que el backend.
 *
 * Sirven para avisar al usuario ANTES de enviar. El backend vuelve a validar
 * siempre, porque es la regla real (alguien podría llamar a la API sin este formulario).
 */
const TEXTOS = {
  codigo: { etiqueta: "El código", genero: "o", maximo: 20 },
  nombre: { etiqueta: "El nombre", genero: "o", maximo: 100 },
  categoria: { etiqueta: "La categoría", genero: "a", maximo: 50 },
};

const PRECIO_MAXIMO = 99_999_999.99; // NUMERIC(10,2) en PostgreSQL
const CANTIDAD_MAXIMA = 2_147_483_647; // INTEGER en PostgreSQL

export function validarProducto(producto) {
  const errores = {};

  for (const [campo, { etiqueta, genero, maximo }] of Object.entries(TEXTOS)) {
    const valor = producto[campo].trim();
    if (!valor) {
      errores[campo] = `${etiqueta} es obligatori${genero}.`;
    } else if (valor.length > maximo) {
      errores[campo] = `${etiqueta} no puede tener más de ${maximo} caracteres.`;
    }
  }

  const precio = String(producto.precio).trim();
  const numeroPrecio = Number(precio);
  if (precio === "") {
    errores.precio = "El precio es obligatorio.";
  } else if (Number.isNaN(numeroPrecio)) {
    errores.precio = "El precio debe ser un número.";
  } else if (numeroPrecio <= 0) {
    errores.precio = "El precio debe ser mayor que 0.";
  } else if (!/^\d+(\.\d{1,2})?$/.test(precio)) {
    errores.precio = "El precio puede tener como máximo 2 decimales.";
  } else if (numeroPrecio > PRECIO_MAXIMO) {
    errores.precio = "El precio es demasiado grande.";
  }

  const cantidad = String(producto.cantidad).trim();
  if (cantidad === "") {
    errores.cantidad = "La cantidad es obligatoria.";
  } else if (!/^-?\d+$/.test(cantidad)) {
    errores.cantidad = "La cantidad debe ser un número entero (sin decimales).";
  } else if (Number(cantidad) < 0) {
    errores.cantidad = "La cantidad debe ser mayor o igual a 0.";
  } else if (Number(cantidad) > CANTIDAD_MAXIMA) {
    errores.cantidad = `La cantidad debe ser menor o igual a ${CANTIDAD_MAXIMA}.`;
  }

  return errores;
}
