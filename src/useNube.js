/* ---------- la sincronización, cosida a React ----------
 *
 *  Local primero: escribir sigue siendo instantáneo y contra el móvil, así que
 *  la app funciona igual sin cobertura. Subir es un efecto secundario que
 *  ocurre cuando se puede, y si no se puede, espera.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { hayNube, sesionActual, alCambiarSesion, bajar, subir } from "./nube.js";
import { leerSync, escribirSync, decidir, hayPendientes, cuadrado, tocado, SYNC_VACIO } from "./sync.js";

/* Se espera un poco antes de subir para no mandar una petición por tecla
   mientras escribes el nombre de un elemento. */
const ESPERA = 2000;

export function useNube(datos, adoptar) {
  const [sesion, setSesion] = useState(null);
  const [sync, setSync] = useState(() => (hayNube() ? leerSync() : SYNC_VACIO));
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState(null);
  const [conflicto, setConflicto] = useState(null);
  const [enLinea, setEnLinea] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  const datosRef = useRef(datos);
  const sesionRef = useRef(sesion);
  const ocupado = useRef(false);
  const reloj = useRef(null);

  datosRef.current = datos;
  sesionRef.current = sesion;

  const anotar = useCallback((s) => {
    setSync(s);
    escribirSync(s);
  }, []);

  const sincronizar = useCallback(async () => {
    if (!hayNube() || !sesionRef.current || ocupado.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    ocupado.current = true;
    setTrabajando(true);
    setError(null);
    try {
      const remoto = await bajar();
      const s = leerSync();
      const qué = decidir({ ...s, remoto: remoto?.marca ?? null });

      if (qué === "subir") {
        anotar(cuadrado(await subir(datosRef.current)));
      } else if (qué === "bajar") {
        adoptar(remoto.datos);
        anotar(cuadrado(remoto.marca));
      } else if (qué === "conflicto") {
        // Aquí no se decide por nadie: lo resuelve quien está delante.
        setConflicto(remoto);
      }
    } catch (e) {
      setError(e?.message || "No he podido sincronizar");
    } finally {
      ocupado.current = false;
      setTrabajando(false);
    }
  }, [adoptar, anotar]);

  /** Lo llama cada escritura local. Marca que hay algo que subir y lo agenda. */
  const marcarCambio = useCallback(() => {
    if (!hayNube()) return;
    anotar(tocado(new Date().toISOString())(leerSync()));
    clearTimeout(reloj.current);
    reloj.current = setTimeout(sincronizar, ESPERA);
  }, [anotar, sincronizar]);

  const resolver = useCallback(
    async (cual) => {
      if (!conflicto) return;
      setTrabajando(true);
      setError(null);
      try {
        if (cual === "aqui") {
          anotar(cuadrado(await subir(datosRef.current)));
        } else {
          adoptar(conflicto.datos);
          anotar(cuadrado(conflicto.marca));
        }
        setConflicto(null);
      } catch (e) {
        setError(e?.message || "No he podido resolverlo");
      } finally {
        setTrabajando(false);
      }
    },
    [conflicto, adoptar, anotar]
  );

  /* sesión */
  useEffect(() => {
    if (!hayNube()) return;
    let vivo = true;
    sesionActual().then((s) => vivo && setSesion(s));
    const cortar = alCambiarSesion((s) => vivo && setSesion(s));
    return () => {
      vivo = false;
      cortar();
    };
  }, []);

  /* al entrar, al recuperar conexión y al volver a la app */
  useEffect(() => {
    if (!hayNube() || !sesion) return;
    sincronizar();

    const arriba = () => {
      setEnLinea(true);
      sincronizar();
    };
    const abajo = () => setEnLinea(false);
    const volver = () => document.visibilityState === "visible" && sincronizar();

    window.addEventListener("online", arriba);
    window.addEventListener("offline", abajo);
    document.addEventListener("visibilitychange", volver);
    return () => {
      window.removeEventListener("online", arriba);
      window.removeEventListener("offline", abajo);
      document.removeEventListener("visibilitychange", volver);
    };
  }, [sesion, sincronizar]);

  useEffect(() => () => clearTimeout(reloj.current), []);

  const estado = !hayNube()
    ? "apagado"
    : !sesion
    ? "fuera"
    : conflicto
    ? "conflicto"
    : trabajando
    ? "trabajando"
    : error
    ? "error"
    : !enLinea
    ? "sinConexion"
    : hayPendientes(sync)
    ? "pendiente"
    : "ok";

  return {
    estado,
    error,
    conflicto,
    sesion,
    sync,
    marcarCambio,
    sincronizar,
    resolver,
    setSesion,
  };
}
