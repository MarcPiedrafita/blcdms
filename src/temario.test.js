import { describe, it, expect } from "vitest";
import { TEMARIO, TODAS, POR_ID, UNIDADES_FASE, unidades } from "./temario.js";
import { apunte, progreso, tieneAlgo, APUNTE_VACIO, ESTADOS_ESTUDIO } from "./lib.js";

describe("el índice", () => {
  it("trae las 19 fases, de la 0 a la 18", () => {
    expect(TEMARIO).toHaveLength(19);
    expect(TEMARIO.map((f) => f.n)).toEqual(Array.from({ length: 19 }, (_, i) => String(i)));
  });

  it("toda fase tiene título y apartados", () => {
    for (const f of TEMARIO) {
      expect(f.titulo).toBeTruthy();
      expect(f.apartados.length).toBeGreaterThan(0);
    }
  });

  /* Si dos unidades comparten id, las notas de una salen en la otra. */
  it("ningún id se repite", () => {
    expect(new Set(TODAS.map((u) => u.id)).size).toBe(TODAS.length);
  });

  it("el índice plano cubre todas las unidades", () => {
    expect(Object.keys(POR_ID)).toHaveLength(TODAS.length);
    for (const u of TODAS) {
      expect(POR_ID[u.id].unidad.titulo).toBe(u.titulo);
    }
  });

  /* Los ids salen del rótulo y no de la posición: reordenar no debe
     reasignarlos. */
  it("el id de un punto lleva su apartado y su rótulo, no su posición", () => {
    expect(POR_ID["0.1/prioridades"]).toBeTruthy();
    expect(POR_ID["1.2/puentes-termicos"]).toBeTruthy();
    expect(POR_ID["1.2/puentes-termicos"].apartado.n).toBe("1.2");
  });

  it("un apartado sin puntos es él mismo la unidad", () => {
    const f5 = TEMARIO.find((f) => f.n === "5");
    const demoliciones = f5.apartados.find((a) => a.n === "5.1");
    expect(demoliciones.puntos).toEqual([]);
    expect(unidades(demoliciones)).toEqual([{ id: "5.1", titulo: "Demoliciones" }]);
  });

  it("un apartado con puntos no cuenta como unidad, cuentan sus puntos", () => {
    const f0 = TEMARIO.find((f) => f.n === "0");
    const objetivos = f0.apartados.find((a) => a.n === "0.1");
    expect(unidades(objetivos)).toHaveLength(4);
    expect(POR_ID["0.1"]).toBeUndefined();
  });

  it("las unidades por fase suman el total", () => {
    const suma = TEMARIO.reduce((s, f) => s + UNIDADES_FASE[f.id].length, 0);
    expect(suma).toBe(TODAS.length);
  });

  /* Títulos repetidos entre fases —«Piedra» está en la 1.3 y en la 3.1— son
     legítimos, pero tienen que caer en ids distintos. */
  it("un rótulo repetido en otro apartado no colisiona", () => {
    expect(POR_ID["1.3/piedra"]).toBeTruthy();
    expect(POR_ID["3.1/piedra"]).toBeTruthy();
    expect(POR_ID["1.3/piedra"].fase.n).toBe("1");
    expect(POR_ID["3.1/piedra"].fase.n).toBe("3");
  });
});

describe("apuntes de estudio", () => {
  const con = (estudio) => ({ estudio });

  it("una unidad sin tocar devuelve el apunte vacío", () => {
    expect(apunte(con({}), "5.1")).toEqual(APUNTE_VACIO);
    expect(apunte({}, "5.1").estado).toBe("pendiente");
  });

  it("un apunte a medias se completa con lo que falte", () => {
    const a = apunte(con({ "5.1": { notas: "ojo con el amianto" } }), "5.1");
    expect(a.notas).toBe("ojo con el amianto");
    expect(a.estado).toBe("pendiente");
    expect(a.enlaces).toEqual([]);
  });

  it("está vacío hasta que le metes algo", () => {
    expect(tieneAlgo(APUNTE_VACIO)).toBe(false);
    expect(tieneAlgo({ ...APUNTE_VACIO, estado: "estudiando" })).toBe(true);
    expect(tieneAlgo({ ...APUNTE_VACIO, notas: "x" })).toBe(true);
    expect(tieneAlgo({ ...APUNTE_VACIO, enlaces: [{ id: "a" }] })).toBe(true);
    expect(tieneAlgo({ ...APUNTE_VACIO, dudas: "?" })).toBe(true);
  });

  it("los espacios en blanco no cuentan como apunte", () => {
    expect(tieneAlgo({ ...APUNTE_VACIO, notas: "   \n " })).toBe(false);
  });

  it("los tres estados son los que usa la interfaz", () => {
    expect(ESTADOS_ESTUDIO.map(([k]) => k)).toEqual(["pendiente", "estudiando", "sabido"]);
  });
});

describe("progreso", () => {
  const d = {
    estudio: {
      "5.1": { estado: "sabido" },
      "5.2": { estado: "sabido" },
      "5.3": { estado: "estudiando" },
      "5.4": { estado: "pendiente", notas: "pendiente de mirar" },
    },
  };
  const ids = ["5.1", "5.2", "5.3", "5.4", "5.5"];

  it("cuenta lo sabido, lo que está en marcha y lo que tiene apuntes", () => {
    const p = progreso(d, ids);
    expect(p.total).toBe(5);
    expect(p.sabido).toBe(2);
    expect(p.estudiando).toBe(1);
    expect(p.conNotas).toBe(1);
  });

  /* «Estudiando» es intención, no conocimiento: contarlo inflaría el avance. */
  it("el porcentaje solo cuenta lo sabido", () => {
    expect(progreso(d, ids).pct).toBe(40);
  });

  it("sin unidades no divide entre cero", () => {
    expect(progreso(d, []).pct).toBe(0);
  });

  it("el temario entero empieza a cero", () => {
    const p = progreso({ estudio: {} }, TODAS.map((u) => u.id));
    expect(p.total).toBe(TODAS.length);
    expect(p.pct).toBe(0);
  });
});
