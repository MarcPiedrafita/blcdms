/* ---------- sincronización: la parte que se puede probar ----------
 *
 *  Aquí no hay red. Solo el estado de la sincronización y la decisión de qué
 *  hacer con él, que es donde se pierden datos si te equivocas.
 *
 *  Se guarda aparte de los datos, en su propia clave, por dos razones: el
 *  `.json` que exportas sigue siendo solo tus datos, y `lib.js` no se entera
 *  de que existe una nube.
 */

export const CLAVE_SYNC = "la-obra-sync-v1";

export const SYNC_VACIO = {
  /** Cuándo cambiaste algo en este aparato por última vez. */
  actualizado: null,
  /** La marca que tenía el servidor la última vez que cuadramos con él. */
  sincronizado: null,
};

export function leerSync(almacen = globalThis.localStorage) {
  try {
    const raw = almacen?.getItem(CLAVE_SYNC);
    if (!raw) return SYNC_VACIO;
    const s = JSON.parse(raw);
    return {
      actualizado: s?.actualizado ?? null,
      sincronizado: s?.sincronizado ?? null,
    };
  } catch (e) {
    return SYNC_VACIO;
  }
}

export function escribirSync(s, almacen = globalThis.localStorage) {
  try {
    almacen?.setItem(CLAVE_SYNC, JSON.stringify(s));
    return true;
  } catch (e) {
    return false;
  }
}

/** Hay cambios hechos aquí que el servidor todavía no tiene. */
export const hayPendientes = (s) => s.actualizado != null && s.actualizado !== s.sincronizado;

/**
 * Qué hacer cuando se puede hablar con el servidor.
 *
 *   subir      lo de aquí es lo nuevo
 *   bajar      lo del servidor es lo nuevo
 *   conflicto  las dos partes cambiaron desde la última vez que cuadraron
 *   nada       ya están iguales
 *
 * `remoto` es la marca de tiempo que tiene el servidor ahora, o null si allí
 * todavía no hay nada.
 */
export function decidir({ actualizado, sincronizado, remoto }) {
  const aquí = actualizado != null && actualizado !== sincronizado;

  // El servidor está vacío: si tenemos algo, va para allá.
  if (remoto == null) return actualizado != null ? "subir" : "nada";

  const fuera = remoto !== sincronizado;

  if (aquí && fuera) return "conflicto";
  if (aquí) return "subir";
  if (fuera) return "bajar";
  return "nada";
}

/** Tras subir o bajar con éxito, las dos partes quedan en la misma marca. */
export const cuadrado = (marca) => ({ actualizado: marca, sincronizado: marca });

/** Un cambio hecho aquí, todavía sin subir. */
export const tocado = (cuando) => (s) => ({ ...s, actualizado: cuando });
