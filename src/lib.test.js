import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  VACIO,
  nuevaAyuda,
  ayudas,
  frescura,
  nuevaPlantilla,
  nuevaLineaPlantilla,
  nuevaLinea,
  nuevoElemento,
  ratios,
  estimar,
  desdePlantilla,
  nuevoTramite,
  TIPOS_TRAMITE,
  URGENCIAS,
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

  it("sin entrada puesta se entiende que es al contado", () => {
    const o = objetivo(datos(base));
    expect(o.esHipoteca).toBe(false);
    expect(o.entradaPct).toBe(null);
    expect(o.casa).toBe(o.precio);
  });
});

describe("objetivo con hipoteca", () => {
  const conEntrada = (entradaPct) =>
    objetivo(
      datos({
        dinero: { precioCasa: 58000, impuestosPct: 10, colchonPct: 15, entradaPct },
        elementos: [elemento("imprescindible", [{ cantidad: 1, precio: 4000 }])],
      })
    );

  it("de la casa solo se ahorra la entrada", () => {
    const o = conEntrada(20);
    expect(o.esHipoteca).toBe(true);
    expect(o.precio).toBe(58000);
    expect(o.casa).toBe(11600);
  });

  /* El error que deja a la gente corta en la firma: el banco presta contra el
     valor de la casa, pero el ITP y la notaría salen de tu bolsillo ese mismo
     día. Escalarlos con la entrada sería contar 1.160 € en vez de 5.800 €. */
  it("los impuestos siguen yendo sobre el precio entero", () => {
    expect(conEntrada(20).impuestos).toBe(5800);
    expect(conEntrada(20).impuestos).toBe(objetivo(datos({ dinero: { precioCasa: 58000, impuestosPct: 10 } })).impuestos);
  });

  it("el colchón se calcula sobre la entrada, no sobre el precio", () => {
    const o = conEntrada(20);
    expect(o.antesDelColchon).toBe(21400); // 11.600 + 5.800 + 4.000
    expect(o.colchon).toBe(3210);
    expect(o.calculado).toBe(24610);
  });

  /* Lo que motivó el arreglo: a contado le salían 77.970 €. */
  it("baja mucho el objetivo respecto a pagar a contado", () => {
    const contado = objetivo(
      datos({
        dinero: { precioCasa: 58000, impuestosPct: 10, colchonPct: 15 },
        elementos: [elemento("imprescindible", [{ cantidad: 1, precio: 4000 }])],
      })
    );
    expect(contado.calculado).toBe(77970);
    expect(conEntrada(20).calculado).toBeLessThan(contado.calculado / 3);
  });

  it("una entrada del 100% cuesta lo mismo que pagar a contado", () => {
    expect(conEntrada(100).calculado).toBe(77970);
  });

  /* Una hipoteca al 100% existe, y aun así hay que ahorrar impuestos y obra. */
  it("con entrada cero sigue habiendo objetivo", () => {
    const o = conEntrada(0);
    expect(o.casa).toBe(0);
    expect(o.esHipoteca).toBe(true);
    expect(o.antesDelColchon).toBe(9800); // impuestos + obra
    expect(o.calculado).toBe(11270);
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

  /* Los trámites llegaron después: hay copias por ahí que no traen el campo, y
     sin esto la pestaña reventaría al recorrer un undefined. */
  it("una copia anterior a los trámites se abre con la lista vacía", () => {
    almacen.set(KEY, JSON.stringify({ categorias: [], elementos: [], ideas: [] }));
    expect(leer().tramites).toEqual([]);
  });

  it("los trámites guardados se recuperan", () => {
    const t = { ...nuevoTramite(), nombre: "Licencia de obra" };
    escribir(datos({ tramites: [t] }));
    expect(leer().tramites).toEqual([t]);
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

describe("trámites", () => {
  it("un trámite nuevo nace pendiente y con el tipo más común", () => {
    const t = nuevoTramite();
    expect(t.tipo).toBe("tramite");
    expect(t.hecho).toBe(false);
    expect(t.nombre).toBe("");
    expect(t.descripcion).toBe("");
  });

  /* Nace en el nivel más exigente a propósito: si te equivocas, que sea por
     adelantarte y no por llegar tarde a pedir una licencia. */
  it("nace en el nivel más urgente", () => {
    expect(nuevoTramite().urgencia).toBe("antelacion");
  });

  it("cada trámite tiene su propio id", () => {
    expect(nuevoTramite().id).not.toBe(nuevoTramite().id);
  });

  it("el tipo y la urgencia de fábrica existen en sus listas", () => {
    const t = nuevoTramite();
    expect(TIPOS_TRAMITE.map(([k]) => k)).toContain(t.tipo);
    expect(URGENCIAS.map(([k]) => k)).toContain(t.urgencia);
  });

  it("hay tres tipos y tres urgencias, cada uno con su rótulo", () => {
    expect(TIPOS_TRAMITE).toHaveLength(3);
    expect(URGENCIAS).toHaveLength(3);
    for (const [k, l] of [...TIPOS_TRAMITE, ...URGENCIAS]) {
      expect(k).toBeTruthy();
      expect(l).toBeTruthy();
    }
  });

  it("el estado vacío trae la lista de trámites", () => {
    expect(VACIO.tramites).toEqual([]);
  });

  it("un trámite nuevo no cuesta nada hasta que le pones precio", () => {
    expect(nuevoTramite().coste).toBe(null);
  });
});

describe("lo que cuestan los trámites", () => {
  const con = (tramites) => datos({ tramites: tramites.map((t) => ({ ...nuevoTramite(), ...t })) });

  it("suma los costes y van al imprescindible", () => {
    const t = totales(con([{ coste: 180 }, { coste: 420 }]));
    expect(t.tramites).toBe(600);
    expect(t.imprescindible).toBe(600);
    expect(t.extra).toBe(0);
    expect(t.total).toBe(600);
  });

  it("los que no tienen coste no suman", () => {
    expect(totales(con([{ coste: null }, { coste: 300 }])).tramites).toBe(300);
  });

  /* La app no lleva el gasto real, así que lo pagado no se descuenta de los
     ahorros. Si además se cayera del objetivo, el objetivo bajaría mientras el
     ahorro se queda igual y parecerías más cerca de lo que estás. */
  it("un trámite ya hecho sigue contando", () => {
    expect(totales(con([{ coste: 400, hecho: true }])).tramites).toBe(400);
  });

  it("se suman a la obra, no la sustituyen", () => {
    const d = datos({
      elementos: [elemento("imprescindible", [{ cantidad: 1, precio: 1000 }])],
      tramites: [{ ...nuevoTramite(), coste: 250 }],
    });
    const t = totales(d);
    expect(t.obra.imprescindible).toBe(1000);
    expect(t.imprescindible).toBe(1250);
  });

  it("suben el objetivo de ahorro y también el colchón", () => {
    const base = { precioCasa: 50000, impuestosPct: 10, colchonPct: 10 };
    const sin = objetivo(datos({ dinero: base }));
    const conTramite = objetivo(datos({ dinero: base, tramites: [{ ...nuevoTramite(), coste: 1000 }] }));
    expect(sin.calculado).toBe(60500); // (50.000 + 5.000) × 1,1
    expect(conTramite.obra).toBe(1000);
    expect(conTramite.calculado).toBe(61600); // (50.000 + 5.000 + 1.000) × 1,1
  });

  it("sin trámites el total sigue siendo el de antes", () => {
    expect(totales(datos()).tramites).toBe(0);
    expect(totales(datos()).imprescindible).toBe(0);
  });

  /* Una copia vieja no trae la lista, y totales se llama en cada render. */
  it("no revienta si no hay lista de trámites", () => {
    const d = { ...VACIO, dinero: VACIO.dinero };
    delete d.tramites;
    expect(totales(d).tramites).toBe(0);
  });
});

describe("ayudas", () => {
  const con = (lista) => datos({ ayudas: lista.map((a) => ({ ...nuevaAyuda(), ...a })) });

  it("agrupa por lo firme que es cada una", () => {
    const a = ayudas(con([
      { estado: "concedida", importe: 11000 },
      { estado: "solicitada", importe: 4000 },
      { estado: "explorando", importe: 2000 },
    ]));
    expect(a.concedida).toBe(11000);
    expect(a.solicitada).toBe(4000);
    expect(a.explorando).toBe(2000);
    expect(a.total).toBe(17000);
    expect(a.firme).toBe(11000);
  });

  /* El importe se guarda para saber qué te has perdido, pero no es dinero. */
  it("una denegada no suma al total", () => {
    const a = ayudas(con([{ estado: "concedida", importe: 5000 }, { estado: "denegada", importe: 9000 }]));
    expect(a.denegada).toBe(9000);
    expect(a.total).toBe(5000);
  });

  it("las que no tienen importe no rompen la suma", () => {
    expect(ayudas(con([{ estado: "concedida", importe: null }])).total).toBe(0);
  });

  it("un estado desconocido se ignora en vez de reventar", () => {
    expect(ayudas(con([{ estado: "loquesea", importe: 100 }])).total).toBe(0);
  });

  it("sin lista de ayudas devuelve ceros", () => {
    expect(ayudas({}).total).toBe(0);
  });
});

describe("aplicar las ayudas al objetivo", () => {
  const base = { precioCasa: 50000, impuestosPct: 10, colchonPct: 0 };
  const conAyuda = (importe, aplicar) =>
    objetivo(datos({
      dinero: { ...base, aplicarAyudas: aplicar },
      ayudas: [{ ...nuevaAyuda(), estado: "concedida", importe }],
    }));

  it("apagado, el objetivo no se entera", () => {
    const o = conAyuda(11000, false);
    expect(o.aplicaAyudas).toBe(false);
    expect(o.ayudas).toBe(0);
    expect(o.valor).toBe(55000);
    expect(o.valor).toBe(o.bruto);
  });

  it("encendido, baja el objetivo pero no el coste", () => {
    const o = conAyuda(11000, true);
    expect(o.calculado).toBe(55000); // lo que cuesta sigue siendo lo mismo
    expect(o.bruto).toBe(55000);
    expect(o.ayudas).toBe(11000);
    expect(o.valor).toBe(44000);
  });

  /* Si te dieran más de lo que cuesta, lo que sobra no es ahorro negativo. */
  it("no puede dejar el objetivo por debajo de cero", () => {
    const o = conAyuda(90000, true);
    expect(o.valor).toBe(0);
    expect(o.ayudas).toBe(55000);
  });

  it("se aplica también sobre un objetivo forzado a mano", () => {
    const o = objetivo(datos({
      dinero: { ...base, objetivoManual: 30000, aplicarAyudas: true },
      ayudas: [{ ...nuevaAyuda(), estado: "concedida", importe: 5000 }],
    }));
    expect(o.bruto).toBe(30000);
    expect(o.valor).toBe(25000);
    expect(o.esManual).toBe(true);
  });

  it("una denegada no baja el objetivo aunque esté encendido", () => {
    const o = objetivo(datos({
      dinero: { ...base, aplicarAyudas: true },
      ayudas: [{ ...nuevaAyuda(), estado: "denegada", importe: 11000 }],
    }));
    expect(o.valor).toBe(55000);
  });

  it("sin ayudas apuntadas, encender el interruptor no cambia nada", () => {
    const o = objetivo(datos({ dinero: { ...base, aplicarAyudas: true } }));
    expect(o.valor).toBe(55000);
  });
});

describe("frescura de la información de una ayuda", () => {
  const EN = (iso) => new Date(iso).getTime();

  it("recién comprobada está fresca", () => {
    const f = frescura("2026-08-01", EN("2026-08-06"));
    expect(f.meses).toBe(0);
    expect(f.estado).toBe("fresco");
  });

  it("a los cinco meses sigue fresca", () => {
    expect(frescura("2026-03-06", EN("2026-08-06")).estado).toBe("fresco");
  });

  /* Seis meses porque las convocatorias son anuales: a partir de ahí lo
     apuntado puede ser de una que ya cerró. */
  it("a los seis se pone tibia", () => {
    const f = frescura("2026-02-06", EN("2026-08-06"));
    expect(f.meses).toBe(6);
    expect(f.estado).toBe("tibio");
  });

  it("al año se da por vieja", () => {
    const f = frescura("2025-08-06", EN("2026-08-06"));
    expect(f.meses).toBe(12);
    expect(f.estado).toBe("viejo");
  });

  it("cuenta meses cumplidos, no cambios de mes", () => {
    // Del 20 de febrero al 6 de agosto no son seis meses todavía.
    expect(frescura("2026-02-20", EN("2026-08-06")).meses).toBe(5);
    expect(frescura("2026-02-06", EN("2026-08-06")).meses).toBe(6);
  });

  it("cruza el cambio de año", () => {
    expect(frescura("2025-11-06", EN("2026-08-06")).meses).toBe(9);
  });

  it("sin fecha no inventa una antigüedad", () => {
    expect(frescura(null).estado).toBe("sin");
    expect(frescura(undefined).meses).toBe(null);
  });

  it("una fecha ilegible se trata como que no hay", () => {
    expect(frescura("esto no es una fecha").estado).toBe("sin");
  });

  it("una fecha futura no da meses negativos", () => {
    expect(frescura("2027-01-01", EN("2026-08-06")).meses).toBe(0);
  });

  it("una ayuda nueva nace comprobada hoy", () => {
    expect(frescura(nuevaAyuda().comprobado).estado).toBe("fresco");
  });
});

describe("plantillas: ratios y coste fijo", () => {
  const ln = (cantidad, precio, escala = "metro") => ({ ...nuevaLineaPlantilla(), cantidad, precio, escala });
  const el = (fase, lineas) => ({ ...nuevoElemento("c", "x"), fase, lineas });
  const pl = (metros, elementos) => ({ ...nuevaPlantilla("p"), metros, elementos });

  it("el €/m² sale solo de lo que escala", () => {
    const r = ratios(pl(100, [el("imprescindible", [ln(1, 40000), ln(1, 9000, "fijo")])]));
    expect(r.esencial.porMetro).toBe(40000);
    expect(r.esencial.fijo).toBe(9000);
    expect(r.esencial.ratio).toBe(400);
    expect(r.esencial.total).toBe(49000);
  });

  /* El fallo que hay que evitar: si el coste fijo entrase en el ratio, una
     casa de 50 m² saldría a mitad de precio cuando la fosa séptica cuesta
     exactamente lo mismo. */
  it("meter el fijo en el ratio abarataría las casas pequeñas", () => {
    const r = ratios(pl(100, [el("imprescindible", [ln(1, 40000), ln(1, 9000, "fijo")])]));
    expect(estimar(r.esencial, 50)).toBe(29000); // 400 × 50 + 9.000
    expect(estimar(r.esencial, 50)).not.toBe(24500); // lo que saldría metiéndolo todo
  });

  it("los extras dan un segundo ratio, sin tocar el esencial", () => {
    const r = ratios(pl(100, [
      el("imprescindible", [ln(1, 30000)]),
      el("extra", [ln(1, 10000), ln(1, 2000, "fijo")]),
    ]));
    expect(r.esencial.ratio).toBe(300);
    expect(r.esencial.fijo).toBe(0);
    expect(r.conExtras.ratio).toBe(400);
    expect(r.conExtras.fijo).toBe(2000);
  });

  it("sin metros de referencia no inventa un ratio", () => {
    const r = ratios(pl(0, [el("imprescindible", [ln(1, 5000)])]));
    expect(r.sinMetros).toBe(true);
    expect(r.ratio).toBe(undefined);
    expect(r.esencial.ratio).toBe(0);
    expect(r.esencial.porMetro).toBe(5000);
  });

  it("una línea sin escala marcada cuenta como que escala", () => {
    const suelta = { ...nuevaLinea(), cantidad: 1, precio: 1000 };
    const r = ratios(pl(100, [el("imprescindible", [suelta])]));
    expect(r.esencial.porMetro).toBe(1000);
    expect(r.esencial.fijo).toBe(0);
  });

  it("una plantilla vacía no revienta", () => {
    expect(ratios(nuevaPlantilla("x")).esencial.total).toBe(0);
    expect(ratios({}).sinMetros).toBe(true);
  });

  it("estimar es ratio por metros más el fijo", () => {
    const r = ratios(pl(80, [el("imprescindible", [ln(1, 24000), ln(1, 6000, "fijo")])]));
    expect(r.esencial.ratio).toBe(300);
    expect(estimar(r.esencial, 80)).toBe(30000); // la casa de referencia
    expect(estimar(r.esencial, 160)).toBe(54000); // el doble de metros, no el doble de dinero
  });
});

describe("generar un presupuesto desde una plantilla", () => {
  const base = {
    ...nuevaPlantilla("Integral"),
    metros: 100,
    categorias: [{ id: "c1", nombre: "Cubierta" }],
    elementos: [
      {
        ...nuevoElemento("c1", "Tejado"),
        fase: "imprescindible",
        lineas: [
          { ...nuevaLineaPlantilla(), concepto: "Teja", cantidad: 200, precio: 18, escala: "metro" },
          { ...nuevaLineaPlantilla(), concepto: "Fosa", cantidad: 1, precio: 4000, escala: "fijo" },
        ],
      },
    ],
  };

  it("escala las cantidades de lo que va por metro", () => {
    const { elementos } = desdePlantilla(base, 50);
    expect(elementos[0].lineas[0].cantidad).toBe(100); // 200 × 0,5
  });

  it("deja intacto lo que es coste fijo", () => {
    const { elementos } = desdePlantilla(base, 50);
    expect(elementos[0].lineas[1].cantidad).toBe(1);
    expect(elementos[0].lineas[1].precio).toBe(4000);
  });

  it("el presupuesto generado cuadra con lo que estimaba el ratio", () => {
    const r = ratios(base);
    const { elementos } = desdePlantilla(base, 50);
    const suma = elementos.reduce((s, e) => s + totalElemento(e), 0);
    expect(suma).toBeCloseTo(estimar(r.conExtras, 50), 2);
  });

  it("los ids son nuevos, para no pisar la plantilla al editar", () => {
    const { categorias, elementos } = desdePlantilla(base, 100);
    expect(categorias[0].id).not.toBe("c1");
    expect(elementos[0].id).not.toBe(base.elementos[0].id);
    expect(elementos[0].categoriaId).toBe(categorias[0].id);
    expect(elementos[0].lineas[0].id).not.toBe(base.elementos[0].lineas[0].id);
  });

  it("conserva la fase de cada elemento", () => {
    const conExtra = { ...base, elementos: [{ ...base.elementos[0], fase: "extra" }] };
    expect(desdePlantilla(conExtra, 100).elementos[0].fase).toBe("extra");
  });

  it("a los mismos metros no cambia nada", () => {
    const { elementos, factor } = desdePlantilla(base, 100);
    expect(factor).toBe(1);
    expect(elementos[0].lineas[0].cantidad).toBe(200);
  });

  it("una plantilla sin metros no multiplica por cero", () => {
    const { factor } = desdePlantilla({ ...base, metros: 0 }, 80);
    expect(factor).toBe(1);
  });

  it("el estado de partida es idea, aunque en la plantilla fuera otro", () => {
    const { elementos } = desdePlantilla(base, 100);
    expect(elementos[0].estado).toBe("idea");
  });
});

describe("las plantillas viajan en la copia", () => {
  it("el estado vacío las trae", () => {
    expect(VACIO.plantillas).toEqual([]);
  });

  it("una copia anterior a las plantillas se abre con la lista vacía", () => {
    const m = new Map();
    globalThis.localStorage = {
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => m.set(k, v),
      removeItem: (k) => m.delete(k),
    };
    m.set(KEY, JSON.stringify({ categorias: [], elementos: [], ideas: [] }));
    expect(leer().plantillas).toEqual([]);
    delete globalThis.localStorage;
  });
});
