/* ---------- almacenamiento ---------- */

export const KEY = "la-obra-v1";

export const VACIO = {
  dinero: {
    base: 0,
    aportaciones: [],
    precioCasa: null,
    entradaPct: null, // vacío = al contado
    impuestosPct: 10,
    colchonPct: 15,
    objetivoManual: null,
    aplicarAyudas: false,
  },
  categorias: [],
  elementos: [],
  maquinas: [],
  ideas: [],
  tramites: [],
  ayudas: [],
  ultimaCopia: null,
};

export function leer() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return VACIO;
    const d = JSON.parse(raw);
    return {
      ...VACIO,
      ...d,
      dinero: { ...VACIO.dinero, ...(d.dinero || {}) },
      categorias: d.categorias || [],
      elementos: d.elementos || [],
      maquinas: d.maquinas || [],
      ideas: d.ideas || [],
      // Una copia hecha antes de que existieran los trámites no trae el campo.
      tramites: d.tramites || [],
      ayudas: d.ayudas || [],
    };
  } catch (e) {
    return VACIO;
  }
}

export function escribir(d) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
    return true;
  } catch (e) {
    return false;
  }
}

/* ---------- utilidades ---------- */

export const uid = () => Math.random().toString(36).slice(2, 10);
export const hoy = () => new Date().toISOString().slice(0, 10);

/* `useGrouping: "always"` para que 5800 salga «5.800 €» y no «5800 €».
   Sin esto el español agrupa a partir de cinco cifras y las columnas de
   dinero quedan con unos importes puntuados y otros no. */
export const eur = (n) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    useGrouping: "always",
  }).format(Number(n) || 0);

export const eur2 = (n) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: "always",
  }).format(Number(n) || 0);

export const num = (v) => (v === "" || v == null ? null : Number(v));

export const UNIDADES = ["ud", "m", "m²", "m³", "kg", "saco", "bolsa", "l", "h", "día"];

export const ESTADOS = ["idea", "decidido", "comprado", "hecho"];

/* ---------- plantillas ---------- */

export const nuevaCategoria = (nombre) => ({ id: uid(), nombre, creada: Date.now() });

export const nuevoElemento = (categoriaId, nombre) => ({
  id: uid(),
  categoriaId,
  nombre,
  fase: "imprescindible",
  estado: "idea",
  notas: "",
  lineas: [],
  creado: Date.now(),
});

export const nuevaLinea = () => ({
  id: uid(),
  concepto: "",
  cantidad: 1,
  unidad: "ud",
  precio: null,
  tienda: "",
  enlace: "",
});

export const nuevaMaquina = (nombre) => ({
  id: uid(),
  nombre,
  dias: null,
  precioDia: null,
  precioCompra: null,
  fase: "imprescindible",
  decision: "auto",
  notas: "",
  creada: Date.now(),
});

export const nuevaIdea = () => ({
  id: uid(),
  titulo: "",
  texto: "",
  etiqueta: "casa",
  creada: Date.now(),
});

/* Los tres tipos separan cosas que se gestionan distinto: un trámite se pide y
   se espera, un documento se guarda y se enseña, y un pago tiene fecha límite
   y se paga tarde con recargo. */
export const TIPOS_TRAMITE = [
  ["tramite", "Trámite"],
  ["documento", "Documento"],
  ["pago", "Pago"],
];

/* Lo único que importa antes de arrancar: si esto te va a frenar. */
export const URGENCIAS = [
  ["antelacion", "Con mucha antelación"],
  ["justo", "Justo antes"],
  ["suelto", "No frena la obra"],
];

export const nuevoTramite = () => ({
  id: uid(),
  tipo: "tramite",
  nombre: "",
  descripcion: "",
  urgencia: "antelacion",
  coste: null, // vacío = todavía no sabes lo que cuesta, o no cuesta nada
  hecho: false,
  ayudaId: null, // si nace de una ayuda, cuál
  creado: Date.now(),
});

/* ---------- ayudas ----------
 *
 *  Los cuatro estados van de menos a más firme. Importa mucho la diferencia:
 *  una ayuda que estás mirando no es dinero, y una concedida sí. */
export const ESTADOS_AYUDA = [
  ["explorando", "La estoy mirando"],
  ["solicitada", "Solicitada"],
  ["concedida", "Concedida"],
  ["denegada", "Denegada"],
];

/* Un requisito solo puede estar en uno de tres sitios, y el tercero no es un
   detalle: «no lo sé» es el estado en el que empiezan casi todos, y meterlo con
   los incumplidos haría parecer imposible una ayuda que a lo mejor te toca. */
export const CUMPLIMIENTOS = [
  ["si", "Lo cumplo"],
  ["no", "No lo cumplo"],
  ["?", "No lo sé"],
];

export const nuevoRequisito = (texto = "") => ({ id: uid(), texto, cumplido: "?" });

export const nuevaAyuda = () => ({
  id: uid(),
  nombre: "",
  organismo: "",
  importe: null,
  estado: "explorando",
  notas: "",
  requisitos: [],
  creada: Date.now(),
});

/* ---------- cálculos ---------- */

export const totalLinea = (l) => (Number(l.cantidad) || 0) * (Number(l.precio) || 0);

export const totalElemento = (e) => (e.lineas || []).reduce((s, l) => s + totalLinea(l), 0);

export function costeMaquina(m) {
  const alquiler =
    m.dias != null && m.precioDia != null ? (Number(m.dias) || 0) * (Number(m.precioDia) || 0) : null;
  const compra = m.precioCompra != null ? Number(m.precioCompra) : null;

  let elegido = m.decision;
  if (elegido === "auto") {
    if (alquiler == null && compra == null) elegido = null;
    else if (alquiler == null) elegido = "comprar";
    else if (compra == null) elegido = "alquilar";
    else elegido = alquiler <= compra ? "alquilar" : "comprar";
  }

  const coste = elegido === "alquilar" ? alquiler : elegido === "comprar" ? compra : 0;
  return { alquiler, compra, elegido, coste: coste || 0 };
}

/** Totales globales partidos por fase. */
export function totales(d) {
  const r = {
    obra: { imprescindible: 0, extra: 0 },
    maquinaria: { imprescindible: 0, extra: 0 },
  };
  for (const e of d.elementos) r.obra[e.fase] += totalElemento(e);
  for (const m of d.maquinas) r.maquinaria[m.fase] += costeMaquina(m).coste;

  /* Los trámites que cuestan dinero cuentan enteros como imprescindibles: sin
     la licencia no hay obra y sin la cédula no entras a vivir, así que no hay
     versión «extra» de esto.

     Lo ya marcado como hecho sigue sumando a propósito. La app no lleva el
     gasto real, así que lo que has pagado no se descuenta de tus ahorros: si
     además lo quitara del objetivo, el objetivo bajaría mientras el ahorro se
     queda igual y parecerías más cerca de lo que estás. Sumando siempre, los
     dos lados se quedan quietos y la diferencia sigue siendo verdad. */
  const tramites = (d.tramites || []).reduce((s, t) => s + (Number(t.coste) || 0), 0);

  const imprescindible = r.obra.imprescindible + r.maquinaria.imprescindible + tramites;
  const extra = r.obra.extra + r.maquinaria.extra;
  return { ...r, tramites, imprescindible, extra, total: imprescindible + extra };
}

/** Lo que esperas cobrar en ayudas, partido por lo firme que es cada una. */
export function ayudas(d) {
  const r = { explorando: 0, solicitada: 0, concedida: 0, denegada: 0 };
  for (const a of d.ayudas || []) {
    if (r[a.estado] == null) continue;
    r[a.estado] += Number(a.importe) || 0;
  }
  /* Una denegada no suma. El importe se sigue guardando —sirve para saber qué
     te has perdido y para reabrirla si recurres— pero no es dinero contable. */
  const total = r.explorando + r.solicitada + r.concedida;
  return { ...r, total, firme: r.concedida };
}

/** Objetivo de ahorro: casa + impuestos + imprescindibles, y encima el colchón.
 *
 *  El colchón va sobre la suma de todo, no solo sobre la obra. Calculándolo
 *  solo sobre la obra salía 0 € mientras el presupuesto estuviera vacío, que
 *  es justo cuando más margen hace falta. */
export function objetivo(d) {
  const t = totales(d);
  const precio = Number(d.dinero.precioCasa) || 0;

  /* Con hipoteca, de la casa solo tienes que ahorrar la entrada. Vacío = al
     contado, y entonces hay que ahorrar el precio entero. */
  const pct = d.dinero.entradaPct;
  const esHipoteca = pct != null;
  const casa = esHipoteca ? precio * ((Number(pct) || 0) / 100) : precio;

  /* Los impuestos van sobre el precio entero aunque haya hipoteca, y no sobre
     la entrada: el banco presta contra el valor de la casa, pero el ITP, la
     notaría y el registro salen de tu bolsillo el mismo día. Escalarlos con la
     entrada es el error que deja a la gente corta de dinero en la firma. */
  const impuestos = precio * ((Number(d.dinero.impuestosPct) || 0) / 100);

  const antesDelColchon = casa + impuestos + t.imprescindible;
  const colchon = antesDelColchon * ((Number(d.dinero.colchonPct) || 0) / 100);
  const calculado = antesDelColchon + colchon;
  const manual = d.dinero.objetivoManual;
  const bruto = manual != null ? Number(manual) : calculado;

  /* Las ayudas no tocan el objetivo mientras no le des al interruptor. Aunque
     esté puesto, lo que descuentan no puede pasar del propio objetivo: si te
     dieran más de lo que cuesta la casa, lo que sobra no es ahorro negativo. */
  const ay = ayudas(d);
  const aplica = !!d.dinero.aplicarAyudas;
  const descuento = aplica ? Math.min(bruto, ay.total) : 0;

  return {
    precio,
    casa,
    esHipoteca,
    entradaPct: esHipoteca ? Number(pct) || 0 : null,
    impuestos,
    obra: t.imprescindible,
    antesDelColchon,
    colchon,
    calculado,
    bruto,
    ayudas: descuento,
    aplicaAyudas: aplica,
    valor: bruto - descuento,
    esManual: manual != null,
  };
}

export function ahorrado(d) {
  const aps = d.dinero.aportaciones || [];
  return (Number(d.dinero.base) || 0) + aps.reduce((s, a) => s + (Number(a.importe) || 0), 0);
}

export function ritmoMensual(d) {
  const aps = d.dinero.aportaciones || [];
  if (aps.length === 0) return null;
  const primera = Math.min(...aps.map((a) => new Date(a.fecha).getTime()));
  const meses = Math.max(1, (Date.now() - primera) / (1000 * 60 * 60 * 24 * 30.4));
  const suma = aps.reduce((s, a) => s + (Number(a.importe) || 0), 0);
  return suma / meses;
}

/** «49 meses» no dice nada. Esto lo pasa a años y meses, y da la fecha. */
export function plazo(meses, desde = new Date()) {
  if (meses == null || !isFinite(meses) || meses <= 0) return null;

  const total = Math.ceil(meses);
  const anos = Math.floor(total / 12);
  const resto = total % 12;

  const trozo = (n, sing, plur) => `${n} ${n === 1 ? sing : plur}`;
  let texto;
  if (anos === 0) texto = trozo(resto, "mes", "meses");
  else if (resto === 0) texto = trozo(anos, "año", "años");
  else texto = `${trozo(anos, "año", "años")} y ${trozo(resto, "mes", "meses")}`;

  const fecha = new Date(desde.getTime());
  fecha.setDate(1); // evita que un 31 se desborde al mes siguiente
  fecha.setMonth(fecha.getMonth() + total);

  return {
    meses: total,
    texto,
    fecha,
    cuando: fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
  };
}

/** Cuánto falta para el objetivo al ritmo actual. null si no se puede saber. */
export function prevision(d, desde = new Date()) {
  const falta = Math.max(0, objetivo(d).valor - ahorrado(d));
  if (falta <= 0) return null;
  const ritmo = ritmoMensual(d);
  if (!ritmo || ritmo <= 0) return null;
  return { ...plazo(falta / ritmo, desde), ritmo, falta };
}
