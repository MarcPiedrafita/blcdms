/* ---------- el temario ----------
 *
 *  El índice de autoformación, tal cual. Es contenido fijo: lo que tú añades
 *  —estado, notas, enlaces, dudas— se guarda aparte y se engancha por id.
 *
 *  Los ids salen del rótulo, no de la posición. Así reordenar una lista o
 *  meter un punto en medio no le cambia el id a los de abajo, que es lo que
 *  haría que tus notas aparecieran de pronto colgando de otro tema. El precio
 *  es que reescribir un rótulo sí las desengancha, pero eso pasa mucho menos y
 *  se ve venir.
 */

const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* [número, título, [[número, título, [puntos…]]…]] */
const CRUDO = [
  ["0", "Planificación del proyecto", [
    ["0.1", "Objetivos y visión", [
      "Definir la vivienda ideal",
      "Prioridades",
      "Renuncias aceptables",
      "Horizonte temporal",
    ]],
    ["0.2", "Planificación económica", [
      "Estrategia de ahorro",
      "Presupuesto objetivo",
      "Fondo de imprevistos",
      "Hipoteca y financiación",
      "Costes ocultos",
    ]],
    ["0.3", "Organización del proyecto", [
      "Cronograma",
      "Registro de aprendizaje",
      "Seguimiento de habilidades",
      "Gestión documental",
    ]],
  ]],

  ["1", "Fundamentos de la construcción", [
    ["1.1", "Anatomía de una vivienda", [
      "Cimentación",
      "Estructura",
      "Muros",
      "Forjados",
      "Cubierta",
      "Fachadas",
      "Instalaciones",
    ]],
    ["1.2", "Física de la construcción", [
      "Cargas estructurales",
      "Humedad",
      "Capilaridad",
      "Condensación",
      "Filtraciones",
      "Transmisión térmica",
      "Inercia térmica",
      "Puentes térmicos",
      "Ventilación",
      "Hermeticidad",
    ]],
    ["1.3", "Tipologías constructivas", [
      "Piedra",
      "Ladrillo",
      "Hormigón",
      "Madera",
      "Entramado ligero",
      "Construcción tradicional",
    ]],
  ]],

  ["2", "Evaluación de viviendas", [
    ["2.1", "Búsqueda", ["Ubicación", "Orientación", "Parcela", "Servicios", "Normativa"]],
    ["2.2", "Inspección", [
      "Estructura",
      "Cubierta",
      "Humedades",
      "Instalaciones",
      "Patologías",
      "Grietas",
      "Asentamientos",
    ]],
    ["2.3", "Valoración", [
      "Estimación de costes",
      "Priorización de reformas",
      "Señales de alarma",
      "Comparativa entre viviendas",
    ]],
  ]],

  ["3", "Materiales", [
    ["3.1", "Materiales estructurales", ["Piedra", "Ladrillo", "Hormigón", "Acero", "Madera"]],
    ["3.2", "Materiales de acabado", [
      "Yesos",
      "Morteros",
      "Cementos",
      "Cerámica",
      "Pinturas",
      "Pladur",
    ]],
    ["3.3", "Materiales técnicos", [
      "Aislantes",
      "Impermeabilizantes",
      "Membranas",
      "Barreras de vapor",
      "Selladores",
    ]],
  ]],

  ["4", "Herramientas y taller", [
    ["4.1", "Herramientas manuales", []],
    ["4.2", "Herramientas eléctricas", []],
    ["4.3", "Herramientas de medición", []],
    ["4.4", "Seguridad", []],
    ["4.5", "Organización del taller", []],
    ["4.6", "Mantenimiento de herramientas", []],
  ]],

  ["5", "Albañilería", [
    ["5.1", "Demoliciones", []],
    ["5.2", "Morteros", []],
    ["5.3", "Tabiques", []],
    ["5.4", "Rozas", []],
    ["5.5", "Soleras", []],
    ["5.6", "Enfoscados", []],
    ["5.7", "Alicatados", []],
    ["5.8", "Solados", []],
    ["5.9", "Reparaciones", []],
  ]],

  ["6", "Cubiertas", [
    ["6.1", "Tipos de cubierta", []],
    ["6.2", "Estructuras", []],
    ["6.3", "Impermeabilización", []],
    ["6.4", "Aislamiento", []],
    ["6.5", "Canalones", []],
    ["6.6", "Reparaciones", []],
  ]],

  ["7", "Aislamiento y eficiencia energética", [
    ["7.1", "Aislamiento térmico", []],
    ["7.2", "Aislamiento acústico", []],
    ["7.3", "Ventanas", []],
    ["7.4", "Carpinterías", []],
    ["7.5", "Hermeticidad", []],
    ["7.6", "Ventilación", []],
    ["7.7", "Certificación energética", []],
  ]],

  ["8", "Carpintería", [
    ["8.1", "Puertas", []],
    ["8.2", "Ventanas", []],
    ["8.3", "Rodapiés", []],
    ["8.4", "Cocinas", []],
    ["8.5", "Armarios", []],
    ["8.6", "Mobiliario básico", []],
  ]],

  ["9", "Fontanería", [
    ["9.1", "Agua fría", []],
    ["9.2", "Agua caliente", []],
    ["9.3", "Desagües", []],
    ["9.4", "Saneamiento", []],
    ["9.5", "Materiales", []],
    ["9.6", "Diseño de instalaciones", []],
    ["9.7", "Averías habituales", []],
  ]],

  ["10", "Electricidad", [
    ["10.1", "Fundamentos", []],
    ["10.2", "Instalación doméstica", []],
    ["10.3", "Cuadro eléctrico", []],
    ["10.4", "Protecciones", []],
    ["10.5", "Iluminación", []],
    ["10.6", "Red de datos", []],
    ["10.7", "Domótica", []],
  ]],

  ["11", "Climatización", [
    ["11.1", "Estufa de leña", []],
    ["11.2", "Aerotermia", []],
    ["11.3", "Suelo radiante", []],
    ["11.4", "Radiadores", []],
    ["11.5", "Aire acondicionado", []],
    ["11.6", "Ventilación mecánica", []],
  ]],

  ["12", "Reforma integral", [
    ["12.1", "Planificación", []],
    ["12.2", "Licencias", []],
    ["12.3", "Orden de ejecución", []],
    ["12.4", "Gestión de residuos", []],
    ["12.5", "Coordinación de gremios", []],
    ["12.6", "Control de costes", []],
  ]],

  ["13", "Diseño de la vivienda", [
    ["13.1", "Distribución", []],
    ["13.2", "Ergonomía", []],
    ["13.3", "Arquitectura tradicional", []],
    ["13.4", "Diseño bioclimático", []],
    ["13.5", "Iluminación natural", []],
    ["13.6", "Espacios de trabajo", []],
    ["13.7", "Taller", []],
    ["13.8", "Almacenamiento", []],
  ]],

  ["14", "Exterior", [
    ["14.1", "Jardín", []],
    ["14.2", "Huerto", []],
    ["14.3", "Árboles frutales", []],
    ["14.4", "Invernadero", []],
    ["14.5", "Vallados", []],
    ["14.6", "Caminos", []],
    ["14.7", "Riego", []],
  ]],

  ["15", "Autosuficiencia", [
    ["15.1", "Energía solar", []],
    ["15.2", "Baterías", []],
    ["15.3", "Agua de lluvia", []],
    ["15.4", "Compostaje", []],
    ["15.5", "Gestión de residuos", []],
    ["15.6", "Leña", []],
  ]],

  ["16", "Finanzas y legalidad", [
    ["16.1", "Hipotecas", []],
    ["16.2", "Tasaciones", []],
    ["16.3", "Seguros", []],
    ["16.4", "Impuestos", []],
    ["16.5", "Ayudas y subvenciones", []],
    ["16.6", "Negociación de compra", []],
  ]],

  ["17", "Mantenimiento", [
    ["17.1", "Cubierta", []],
    ["17.2", "Fachadas", []],
    ["17.3", "Instalaciones", []],
    ["17.4", "Jardín", []],
    ["17.5", "Herramientas", []],
    ["17.6", "Calendario anual de mantenimiento", []],
  ]],

  ["18", "Proyectos prácticos", [
    ["18.1", "Carpintería", []],
    ["18.2", "Albañilería", []],
    ["18.3", "Electricidad", []],
    ["18.4", "Fontanería", []],
    ["18.5", "Aislamiento", []],
    ["18.6", "Cubiertas", []],
    ["18.7", "Mobiliario", []],
    ["18.8", "Cobertizos", []],
    ["18.9", "Taller", []],
    ["18.10", "Proyecto final: Reforma integral de la vivienda", []],
  ]],
];

export const TEMARIO = CRUDO.map(([n, titulo, apartados]) => ({
  n,
  titulo,
  id: `f${n}`,
  apartados: apartados.map(([an, atitulo, puntos]) => ({
    n: an,
    titulo: atitulo,
    id: an,
    puntos: puntos.map((t) => ({ id: `${an}/${slug(t)}`, titulo: t })),
  })),
}));

/* Lo que se estudia y se marca. Un apartado con puntos no es una unidad: lo
   son sus puntos. Un apartado sin puntos sí, porque si no la fase 5 entera no
   tendría nada que marcar. */
export const unidades = (apartado) =>
  apartado.puntos.length ? apartado.puntos : [{ id: apartado.id, titulo: apartado.titulo }];

export const UNIDADES_FASE = Object.fromEntries(
  TEMARIO.map((f) => [f.id, f.apartados.flatMap(unidades)])
);

export const TODAS = TEMARIO.flatMap((f) => UNIDADES_FASE[f.id]);

/* Índice plano id → { fase, apartado, unidad }, para poder abrir una unidad
   sabiendo solo su id y para el buscador. */
export const POR_ID = Object.fromEntries(
  TEMARIO.flatMap((f) =>
    f.apartados.flatMap((a) => unidades(a).map((u) => [u.id, { fase: f, apartado: a, unidad: u }]))
  )
);
