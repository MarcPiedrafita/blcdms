/* ---------- almacenamiento ---------- */

export const KEY = "la-obra-v1";

export const VACIO = {
  dinero: {
    base: 0,
    aportaciones: [],
    precioCasa: null,
    impuestosPct: 10,
    colchonPct: 15,
    objetivoManual: null,
  },
  categorias: [],
  elementos: [],
  maquinas: [],
  ideas: [],
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

export const eur = (n) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export const eur2 = (n) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

  const imprescindible = r.obra.imprescindible + r.maquinaria.imprescindible;
  const extra = r.obra.extra + r.maquinaria.extra;
  return { ...r, imprescindible, extra, total: imprescindible + extra };
}

/** Objetivo de ahorro: casa + impuestos + imprescindibles + colchón. */
export function objetivo(d) {
  const t = totales(d);
  const casa = Number(d.dinero.precioCasa) || 0;
  const impuestos = casa * ((Number(d.dinero.impuestosPct) || 0) / 100);
  const colchon = t.imprescindible * ((Number(d.dinero.colchonPct) || 0) / 100);
  const calculado = casa + impuestos + t.imprescindible + colchon;
  const manual = d.dinero.objetivoManual;
  return {
    casa,
    impuestos,
    obra: t.imprescindible,
    colchon,
    calculado,
    valor: manual != null ? Number(manual) : calculado,
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
