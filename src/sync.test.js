import { describe, it, expect, beforeEach } from "vitest";
import { decidir, hayPendientes, cuadrado, tocado, leerSync, escribirSync, SYNC_VACIO, CLAVE_SYNC } from "./sync.js";

const T1 = "2026-08-01T10:00:00.000Z";
const T2 = "2026-08-02T10:00:00.000Z";
const T3 = "2026-08-03T10:00:00.000Z";

describe("decidir qué hacer al sincronizar", () => {
  it("no hace nada si nunca ha pasado nada", () => {
    expect(decidir({ actualizado: null, sincronizado: null, remoto: null })).toBe("nada");
  });

  it("sube si el servidor está vacío y aquí hay datos", () => {
    expect(decidir({ actualizado: T1, sincronizado: null, remoto: null })).toBe("subir");
  });

  it("no hace nada si están cuadrados", () => {
    expect(decidir({ actualizado: T1, sincronizado: T1, remoto: T1 })).toBe("nada");
  });

  it("sube si solo ha cambiado esto", () => {
    expect(decidir({ actualizado: T2, sincronizado: T1, remoto: T1 })).toBe("subir");
  });

  it("baja si solo ha cambiado el servidor", () => {
    expect(decidir({ actualizado: T1, sincronizado: T1, remoto: T2 })).toBe("bajar");
  });

  /* El caso que se lleva datos por delante: editaste en el móvil sin cobertura
     mientras el ordenador subía lo suyo. Aquí no se decide por nadie. */
  it("da conflicto si han cambiado los dos lados", () => {
    expect(decidir({ actualizado: T2, sincronizado: T1, remoto: T3 })).toBe("conflicto");
  });

  it("baja en un aparato nuevo, sin nada local", () => {
    expect(decidir({ actualizado: null, sincronizado: null, remoto: T1 })).toBe("bajar");
  });

  /* Una marca remota más antigua que la nuestra sigue siendo un cambio: si no
     coincide con la que cuadramos, alguien la tocó. */
  it("un servidor que retrocede también cuenta como cambio", () => {
    expect(decidir({ actualizado: T2, sincronizado: T2, remoto: T1 })).toBe("bajar");
  });

  it("si el servidor se queda vacío, se vuelve a subir lo de aquí", () => {
    expect(decidir({ actualizado: T2, sincronizado: T2, remoto: null })).toBe("subir");
  });
});

describe("pendientes", () => {
  it("no hay nada pendiente recién cuadrado", () => {
    expect(hayPendientes(cuadrado(T1))).toBe(false);
  });

  it("un cambio local deja algo pendiente", () => {
    expect(hayPendientes(tocado(T2)(cuadrado(T1)))).toBe(true);
  });

  it("sin datos y sin sincronizar no hay nada pendiente", () => {
    expect(hayPendientes(SYNC_VACIO)).toBe(false);
  });

  it("tocar no pierde la marca del servidor", () => {
    expect(tocado(T2)(cuadrado(T1)).sincronizado).toBe(T1);
  });
});

describe("guardar el estado de sincronización", () => {
  let almacen;

  beforeEach(() => {
    const m = new Map();
    almacen = {
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => m.set(k, String(v)),
    };
  });

  it("vuelve vacío si no hay nada guardado", () => {
    expect(leerSync(almacen)).toEqual(SYNC_VACIO);
  });

  it("guarda y recupera", () => {
    escribirSync(cuadrado(T1), almacen);
    expect(leerSync(almacen)).toEqual({ actualizado: T1, sincronizado: T1 });
  });

  it("un json corrupto no rompe la app", () => {
    almacen.setItem(CLAVE_SYNC, "{roto");
    expect(leerSync(almacen)).toEqual(SYNC_VACIO);
  });

  it("un estado a medias se completa con nulos", () => {
    almacen.setItem(CLAVE_SYNC, JSON.stringify({ actualizado: T1 }));
    expect(leerSync(almacen)).toEqual({ actualizado: T1, sincronizado: null });
  });

  it("sin almacén no revienta", () => {
    expect(leerSync(undefined)).toEqual(SYNC_VACIO);
    expect(escribirSync(cuadrado(T1), undefined)).toBe(true);
  });
});
