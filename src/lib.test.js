import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  VACIO,
  leer,
  escribir,
  KEY,
  eur,
  eur2,
  num,
  totalLinea,
  totalElemento,
  costeMaquina,
  totales,
  objetivo,
  ahorrado,
  ritmoMensual,
  plazo,
  prevision,
} from "./lib.js";

/* Intl mete espacios finos y duros antes del €. Comparar carácter a carácter
   ataría los tests a la versión de ICU, así que se normalizan. */
const limpio = (s) => s.replace(/\s/g, " ");

const datos = (parcial = {}) => ({
  ...VACIO,
  ...parcial,
  dinero: { ...VACIO.dinero, ...(parcial.dinero || {}) },
});

const elemento = (fase, lineas) => ({ id: "e", categoriaId: "c", fase, estado: "idea", lineas });

describe("formato de dinero", () => {
  it("agrupa los millares también en cuatro cifras", () => {
    // El caso que fallaba: es-ES no agrupa 5800 por su cuenta.
    expect(limpio(eur(5800))).toBe("5.800 €");
    expect(limpio(eur(58000))).toBe("58.000 €");
    expect(limpio(eur2(5800))).toBe("5.800,00 €");
  });

  it("redondea a euros enteros y a dos decimales según el caso", () => {
    expect(limpio(eur(1234.56))).toBe("1.235 €");
    expect(limpio(eur2(1234.567))).toBe("1.234,57 €");
  });

  it("trata lo que no es número como cero", () => {
    for (const v of [null, undefined, "", "hola", NaN]) {
      expect(limpio(eur(v))).toBe("0 €");
    }
  });
});

describe("num", () => {
  it("deja pasar null para los campos vacíos", () => {
    expect(num("")).toBe(null);
    expect(num(null)).toBe(null);
    expect(num(undefined)).toBe(null);
  });

  it("convierte a número lo que sí lo es", () => {
    expect(num("12")).toBe(12);
    expect(num("3.5")).toBe(3.5);
    expect(num(0)).toBe(0);
  });
});

describe("totales de una línea y de un elemento", () => {
  it("multiplica cantidad por precio", () => {
    expect(totalLinea({ cantidad: 3.4, precio: 180 })).toBeCloseTo(612);
  });

  it("cuenta como cero lo que está a medio rellenar", () => {
    expect(totalLinea({ cantidad: 5, precio: null })).toBe(0);
    expect(totalLinea({ cantidad: null, precio: 20 })).toBe(0);
    expect(totalLinea({})).toBe(0);
  });

  it("suma las líneas del elemento", () => {
    expect(
      totalElemento({
        lineas: [
          { cantidad: 3.4, precio: 180 },
          { cantidad: 1, precio: 220 },
        ],
      })
    ).toBeCloseTo(832);
  });

  it("un elemento sin líneas vale cero", () => {
    expect(totalElemento({})).toBe(0);
    expect(totalElemento({ lineas: [] })).toBe(0);
  });
});

describe("alquilar o comprar", () => {
  const maquina = (p) => ({ dias: null, precioDia: null, precioCompra: null, decision: "auto", ...p });

  it("elige lo más barato cuando hay los dos precios", () => {
    const c = costeMaquina(maquina({ dias: 3, precioDia: 35, precioCompra: 320 }));
    expect(c.alquiler).toBe(105);
    expect(c.compra).toBe(320);
    expect(c.elegido).toBe("alquilar");
    expect(c.coste).toBe(105);
  });

  it("se pasa a comprar cuando el alquiler se dispara", () => {
    const c = costeMaquina(maquina({ dias: 12, precioDia: 22, precioCompra: 240 }));
    expect(c.alquiler).toBe(264);
    expect(c.elegido).toBe("comprar");
    expect(c.coste).toBe(240);
  });

  it("en un empate se queda con alquilar", () => {
    const c = costeMaquina(maquina({ dias: 10, precioDia: 20, precioCompra: 200 }));
    expect(c.elegido).toBe("alquilar");
  });

  it("usa el único precio que haya", () => {
    expect(costeMaquina(maquina({ precioCompra: 300 })).elegido).toBe("comprar");
    expect(costeMaquina(maquina({ dias: 2, precioDia: 40 })).elegido).toBe("alquilar");
  });

  it("sin precios no elige nada y no suma", () => {
    const c = costeMaquina(maquina({}));
    expect(c.elegido).toBe(null);
    expect(c.coste).toBe(0);
  });

  it("respeta la decisión forzada aunque salga más cara", () => {
    const c = costeMaquina(maquina({ dias: 20, precioDia: 15, precioCompra: 700, decision: "alquilar" }));
    expect(c.coste).toBe(300);
    expect(c.elegido).toBe("alquilar");
  });

  it("forzar comprar sin precio de compra no inventa un coste", () => {
    const c = costeMaquina(maquina({ dias: 2, precioDia: 30, decision: "comprar" }));
    expect(c.coste).toBe(0);
  });
});

describe("totales por fase", () => {
  const d = datos({
    elementos: [
      elemento("imprescindible", [{ cantidad: 2, precio: 100 }]),
      elemento("imprescindible", [{ cantidad: 1, precio: 50 }]),
      elemento("extra", [{ cantidad: 1, precio: 300 }]),
    ],
    maquinas: [
      { dias: 3, precioDia: 10, precioCompra: 500, fase: "imprescindible", decision: "auto" },
      { dias: 1, precioDia: 80, precioCompra: 40, fase: "extra", decision: "auto" },
    ],
  });

  it("separa obra y maquinaria, y cada una por fase", () => {
    const t = totales(d);
    expect(t.obra).toEqual({ imprescindible: 250, extra: 300 });
    expect(t.maquinaria).toEqual({ imprescindible: 30, extra: 40 });
  });

  it("los totales globales cruzan obra y maquinaria", () => {
    const t = totales(d);
    expect(t.imprescindible).toBe(280);
    expect(t.extra).toBe(340);
    expect(t.total).toBe(620);
  });

  it("sin nada, todo a cero", () => {
    expect(totales(datos()).total).toBe(0);
  });
});

describe("objetivo de ahorro", () => {
  const base = {
    dinero: { precioCasa: 58000, impuestosPct: 10, colchonPct: 15 },
    elementos: [
      elemento("imprescindible", [{ cantidad: 1, precio: 4000 }]),
      elemento("extra", [{ cantidad: 1, precio: 9000 }]),
    ],
  };

  it("suma casa, impuestos, imprescindibles y colchón", () => {
    const o = objetivo(datos(base));
    expect(o.casa).toBe(58000);
    expect(o.impuestos).toBe(5800);
    expect(o.obra).toBe(4000);
    expect(o.antesDelColchon).toBe(67800);
    expect(o.colchon).toBe(10170);
    expect(o.calculado).toBe(77970);
    expect(o.valor).toBe(77970);
    expect(o.esManual).toBe(false);
  });

  it("los extras no entran en el objetivo", () => {
    const sinExtra = datos({ ...base, elementos: [base.elementos[0]] });
    expect(objetivo(datos(base)).calculado).toBe(objetivo(sinExtra).calculado);
  });

  it("el colchón se calcula sobre la casa, los impuestos y la obra", () => {
    const o = objetivo(datos(base));
    expect(o.colchon).toBe((o.casa + o.impuestos + o.obra) * 0.15);
  });

  /* El colchón salía 0 € mientras no hubiera obra metida, que es justo
     cuando más margen hace falta. */
  it("hay colchón aunque el presupuesto de obra esté vacío", () => {
    const o = objetivo(datos({ ...base, elementos: [] }));
    expect(o.obra).toBe(0);
    expect(o.colchon).toBe(9570); // 15% de 58.000 + 5.800
    expect(o.calculado).toBe(73370);
  });

  it("el objetivo a mano manda, pero se sigue viendo el calculado", () => {
    const o = objetivo(datos({ ...base, dinero: { ...base.dinero, objetivoManual: 80000 } }));
    expect(o.valor).toBe(80000);
    expect(o.calculado).toBe(77970);
    expect(o.esManual).toBe(true);
  });

  it("un cero a mano es un objetivo válido, no un campo vacío", () => {
    const o = objetivo(datos({ ...base, dinero: { ...base.dinero, objetivoManual: 0 } }));
    expect(o.valor).toBe(0);
    expect(o.esManual).toBe(true);
  });
});

describe("ahorrado", () => {
  it("suma la base y todas las aportaciones", () => {
    const d = datos({
      dinero: {
        base: 12000,
        aportaciones: [
          { importe: 900 },
          { importe: 1100 },
          { importe: 700 },
        ],
      },
    });
    expect(ahorrado(d)).toBe(14700);
  });

  it("sin nada registrado devuelve cero", () => {
    expect(ahorrado(datos())).toBe(0);
  });
});

describe("ritmo mensual", () => {
  it("sin aportaciones no hay ritmo que calcular", () => {
    expect(ritmoMensual(datos())).toBe(null);
  });

  it("reparte lo aportado entre los meses transcurridos", () => {
    const haceSeisMeses = new Date(Date.now() - 6 * 30.4 * 86400000).toISOString().slice(0, 10);
    const d = datos({ dinero: { aportaciones: [{ fecha: haceSeisMeses, importe: 6000 }] } });
    expect(ritmoMensual(d)).toBeGreaterThan(900);
    expect(ritmoMensual(d)).toBeLessThan(1100);
  });

  it("todo en el mismo mes no infla el ritmo por encima de la suma", () => {
    const d = datos({
      dinero: { aportaciones: [{ fecha: new Date().toISOString().slice(0, 10), importe: 500 }] },
    });
    expect(ritmoMensual(d)).toBe(500);
  });
});

describe("plazo en cristiano", () => {
  const desde = new Date("2026-08-04T00:00:00Z");

  it("pasa los meses sueltos tal cual, con singular", () => {
    expect(plazo(1, desde).texto).toBe("1 mes");
    expect(plazo(5, desde).texto).toBe("5 meses");
  });

  it("parte en años y meses a partir del año", () => {
    expect(plazo(12, desde).texto).toBe("1 año");
    expect(plazo(13, desde).texto).toBe("1 año y 1 mes");
    expect(plazo(49, desde).texto).toBe("4 años y 1 mes");
    expect(plazo(24, desde).texto).toBe("2 años");
  });

  it("redondea hacia arriba los meses partidos", () => {
    expect(plazo(2.1, desde).texto).toBe("3 meses");
    expect(plazo(0.4, desde).meses).toBe(1);
  });

  it("da la fecha aproximada de llegada", () => {
    const p = plazo(49, desde);
    expect(p.fecha.getFullYear()).toBe(2030);
    expect(p.fecha.getMonth()).toBe(8); // septiembre
  });

  it("un día 31 no se desborda al mes siguiente", () => {
    const p = plazo(1, new Date("2026-01-31T00:00:00Z"));
    expect(p.fecha.getMonth()).toBe(1); // febrero, no marzo
  });

  it("no hay plazo si ya no falta nada", () => {
    expect(plazo(0)).toBe(null);
    expect(plazo(-3)).toBe(null);
    expect(plazo(null)).toBe(null);
    expect(plazo(Infinity)).toBe(null);
  });
});

describe("previsión", () => {
  it("no predice nada si no hay ritmo", () => {
    const d = datos({ dinero: { precioCasa: 50000 } });
    expect(prevision(d)).toBe(null);
  });

  it("no predice nada si ya se ha llegado al objetivo", () => {
    const d = datos({
      dinero: { base: 100000, precioCasa: 10000, aportaciones: [{ fecha: "2026-01-01", importe: 100 }] },
    });
    expect(prevision(d)).toBe(null);
  });

  it("devuelve el plazo, el ritmo y lo que falta", () => {
    const haceUnAno = new Date(Date.now() - 12 * 30.4 * 86400000).toISOString().slice(0, 10);
    // Sin impuestos ni colchón: aquí se mide la previsión, no el objetivo.
    const d = datos({
      dinero: {
        precioCasa: 20000,
        impuestosPct: 0,
        colchonPct: 0,
        aportaciones: [{ fecha: haceUnAno, importe: 12000 }],
      },
    });
    const p = prevision(d);
    expect(p.falta).toBe(8000);
    // Los meses se estiman a 30,4 días, así que el ritmo ronda los 1.000.
    expect(p.ritmo).toBeGreaterThan(950);
    expect(p.ritmo).toBeLessThan(1050);
    expect(p.texto).toBeTruthy();
  });
});

describe("almacenamiento", () => {
  let almacen;

  beforeEach(() => {
    almacen = new Map();
    globalThis.localStorage = {
      getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
      setItem: (k, v) => almacen.set(k, v),
      removeItem: (k) => almacen.delete(k),
    };
  });

  afterEach(() => {
    delete globalThis.localStorage;
  });

  it("sin nada guardado devuelve el estado vacío", () => {
    expect(leer()).toEqual(VACIO);
  });

  it("guarda y recupera igual", () => {
    const d = datos({ categorias: [{ id: "c", nombre: "Cocina" }] });
    expect(escribir(d)).toBe(true);
    expect(leer().categorias).toEqual([{ id: "c", nombre: "Cocina" }]);
  });

  it("completa lo que falte en una copia antigua sin romperse", () => {
    almacen.set(KEY, JSON.stringify({ categorias: [{ id: "c" }] }));
    const d = leer();
    expect(d.elementos).toEqual([]);
    expect(d.maquinas).toEqual([]);
    expect(d.ideas).toEqual([]);
    expect(d.dinero.impuestosPct).toBe(10);
  });

  it("un json corrupto no tira la app, devuelve el estado vacío", () => {
    almacen.set(KEY, "{esto no es json");
    expect(leer()).toEqual(VACIO);
  });

  it("avisa si no ha podido guardar", () => {
    globalThis.localStorage.setItem = () => {
      throw new Error("cuota llena");
    };
    expect(escribir(datos())).toBe(false);
  });
});
