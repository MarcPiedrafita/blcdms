import React from "react";

/* ---------- iconos ----------
 *
 *  Dibujados a mano sobre una retícula de 24, no traídos de una librería: así
 *  pesan cero y siguen la misma geometría recta del resto de la app.
 *
 *  Nada de emojis. Un emoji lo pinta el sistema operativo, así que cambia de
 *  forma y de color en cada teléfono y trae su propia paleta de fábrica —
 *  justo lo contrario de una app que usa un solo color como señal.
 *
 *  Todos van a `currentColor`, así que el color lo pone quien los usa y nunca
 *  se sale de la paleta.
 */

function Svg({ children, tam = 22, ...resto }) {
  return (
    <svg
      className="ico"
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...resto}
    >
      {children}
    </svg>
  );
}

/* Moneda con la curva del euro. Vale para el dinero y para los pagos. */
export const IcoDinero = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M14.9 8.9a4 4 0 1 0 0 6.2" />
    <path d="M7.9 11.2h5.3M7.9 13.4h4.5" />
  </Svg>
);

/* Aparejo a soga: la obra es esto. */
export const IcoObra = (p) => (
  <Svg {...p}>
    <rect x="3.4" y="5.6" width="17.2" height="12.8" />
    <path d="M3.4 9.87h17.2M3.4 14.13h17.2" />
    <path d="M12 5.6v4.27M7.7 9.87v4.26M16.3 9.87v4.26M12 14.13v4.27" />
  </Svg>
);

/* Engranaje: cubo, llanta y ocho dientes.
   Los dientes van con el extremo recto y cortos a propósito. Con el extremo
   redondeado y largos —que fue la primera versión— dejan de ser dientes y se
   leen como los rayos de un sol, que además choca con la bombilla de ideas. */
export const IcoMaquinas = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="5.3" />
    <circle cx="12" cy="12" r="1.9" />
    <path
      strokeLinecap="butt"
      strokeWidth="2.5"
      d="M12 3.9v1.9M12 18.2v1.9M20.1 12h-1.9M5.8 12H3.9M17.75 6.25l-1.35 1.35M7.6 16.4l-1.35 1.35M17.75 17.75L16.4 16.4M7.6 7.6L6.25 6.25"
    />
  </Svg>
);

/* Bombilla con su casquillo. */
export const IcoIdeas = (p) => (
  <Svg {...p}>
    <path d="M12 3.2a5.6 5.6 0 0 0-3.3 10.14c.52.38.83.98.83 1.62v.44h4.94v-.44c0-.64.31-1.24.83-1.62A5.6 5.6 0 0 0 12 3.2Z" />
    <path d="M9.53 18.1h4.94M10.6 20.6h2.8" />
  </Svg>
);

/* Hoja con la esquina doblada: los trámites son papel. */
export const IcoTramites = (p) => (
  <Svg {...p}>
    <path d="M6.2 2.9h7.9l4.7 4.7v13.5H6.2Z" />
    <path d="M14.1 2.9v4.7h4.7" />
    <path d="M9 12.4h6M9 15.4h6M9 18.4h3.4" />
  </Svg>
);

/* Dos hojas: una copia es esto. */
export const IcoCopia = (p) => (
  <Svg {...p}>
    <rect x="9" y="3" width="12" height="12" />
    <path d="M15 15v6H3V9h6" />
  </Svg>
);

/* ---------- tipos de trámite ---------- */

/* Sello de caucho: lo que hay que ir a que te firmen. */
export const IcoSello = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8.2" r="4.4" />
    <path d="M9.1 12.6v2.3c0 .8-.38 1.55-1.02 2.02L6.6 18.05h10.8l-1.48-1.13a2.52 2.52 0 0 1-1.02-2.02v-2.3" />
    <path d="M4.6 21h14.8" />
  </Svg>
);

/* Hoja escrita: el papel que hay que tener guardado. */
export const IcoDocumento = (p) => (
  <Svg {...p}>
    <rect x="5.2" y="3" width="13.6" height="18" />
    <path d="M8.4 7.6h7.2M8.4 11.2h7.2M8.4 14.8h7.2M8.4 18.4h4" />
  </Svg>
);

/* ---------- estado ---------- */

export const IcoHecho = (p) => (
  <Svg {...p}>
    <path d="M4.5 12.5l5 5 10-11" />
  </Svg>
);

/* ---------- iconos de las fases del temario ----------
 *
 *  Uno por fase, dibujados con las mismas primitivas que los demás. Se evitan
 *  a propósito las formas que ya usan las pestañas —ladrillos, engranaje,
 *  bombilla— para que dos cosas distintas no se lean igual.
 */

/* 0 · Diana: objetivos y visión. */
const IcoDiana = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <circle cx="12" cy="12" r="4.4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

/* 1 · Muro sobre su zapata, con la línea del terreno. Una columna suelta se
   leía como un número romano. */
const IcoCimiento = (p) => (
  <Svg {...p}>
    <path d="M9 3.4v8.6M15 3.4v8.6" />
    <path d="M2.6 12h18.8" />
    <path d="M6 12h12l2.2 7.6H3.8z" />
  </Svg>
);

/* 2 · Lupa: ir a ver casas y mirarlas de cerca. */
const IcoLupa = (p) => (
  <Svg {...p}>
    <circle cx="10.4" cy="10.4" r="6.3" />
    <path d="M15 15l4.6 4.6" />
  </Svg>
);

/* 3 · Palé de material apilado. */
const IcoPale = (p) => (
  <Svg {...p}>
    <rect x="3.6" y="5.6" width="16.8" height="4.2" />
    <rect x="3.6" y="11.6" width="16.8" height="4.2" />
    <path d="M6.4 15.8v3.6M17.6 15.8v3.6" />
  </Svg>
);

/* 4 · Caja de herramientas. */
const IcoCaja = (p) => (
  <Svg {...p}>
    <rect x="3.4" y="8.6" width="17.2" height="10.8" />
    <path d="M9 8.6V7a1.6 1.6 0 0 1 1.6-1.6h2.8A1.6 1.6 0 0 1 15 7v1.6" />
    <path d="M3.4 13.2h17.2" />
  </Svg>
);

/* 5 · Paleta de albañil: hoja triangular y mango. De perfil se leía como un
   taburete, así que va vista de plano. */
const IcoPaleta = (p) => (
  <Svg {...p}>
    <path d="M2.8 15.2L12.4 5.6l5.6 5.6z" />
    <path d="M16 9.2l2.6-2.6" />
    <path d="M17.9 4.3a1.7 1.7 0 0 1 2.4 2.4l-1 1-2.4-2.4z" />
  </Svg>
);

/* 6 · Cubierta a dos aguas con su alero. */
const IcoCubierta = (p) => (
  <Svg {...p}>
    <path d="M2.8 13.4L12 5.6l9.2 7.8" />
    <path d="M5.4 13.4v5.2h13.2v-5.2" />
    <path d="M1.8 14.6h20.4" />
  </Svg>
);

/* 7 · Muro por capas, con el aislante en medio. */
const IcoCapas = (p) => (
  <Svg {...p}>
    <rect x="3.6" y="4.6" width="16.8" height="14.8" />
    <path d="M8.6 4.6v14.8M15.4 4.6v14.8" />
    <path d="M10.2 8.2h3.6M10.2 12h3.6M10.2 15.8h3.6" />
  </Svg>
);

/* 8 · Serrucho: carpintería. */
const IcoSierra = (p) => (
  <Svg {...p}>
    <path d="M3.4 8.4h13.2v4.2H3.4z" />
    <path d="M3.4 12.6l1.5 2 1.5-2 1.5 2 1.5-2 1.5 2 1.5-2 1.5 2 1.5-2" strokeWidth="1.3" />
    <path d="M16.6 10.5h2.2a1.8 1.8 0 0 1 1.8 1.8v3.4" />
  </Svg>
);

/* 9 · Grifo: fontanería. */
const IcoGrifo = (p) => (
  <Svg {...p}>
    <path d="M4.4 9.6h6.2v3.2H4.4z" />
    <path d="M10.6 11.2h4.2a2.4 2.4 0 0 1 2.4 2.4v2.2" />
    <path d="M6.2 9.6V7.4a2 2 0 0 1 2-2h.8" />
    <path d="M17.2 18.4v2.2" strokeWidth="1.3" />
  </Svg>
);

/* 10 · Rayo: electricidad. */
const IcoRayo = (p) => (
  <Svg {...p}>
    <path d="M13.4 2.8L5.2 13.6h5.6l-.6 7.6 8.4-11h-5.8z" />
  </Svg>
);

/* 11 · Radiador: climatización. */
const IcoRadiador = (p) => (
  <Svg {...p}>
    <rect x="4.4" y="6.6" width="15.2" height="11.4" rx="1" />
    <path d="M8.2 6.6v11.4M12 6.6v11.4M15.8 6.6v11.4" />
    <path d="M6.6 18v2.4M17.4 18v2.4" strokeWidth="1.3" />
  </Svg>
);

/* 12 · La casa entera: reforma integral. */
const IcoCasa = (p) => (
  <Svg {...p}>
    <path d="M3.6 10.4L12 4l8.4 6.4v9.8H3.6z" />
    <path d="M9.6 20.2v-6h4.8v6" />
  </Svg>
);

/* 13 · Plano de planta: diseño y distribución. */
const IcoPlano = (p) => (
  <Svg {...p}>
    <rect x="3.6" y="4.6" width="16.8" height="14.8" />
    <path d="M3.6 12.4h7.2v7M10.8 4.6v4.2" />
    <path d="M14.4 12.4h6" />
  </Svg>
);

/* 14 · Árbol: el exterior. */
const IcoArbol = (p) => (
  <Svg {...p}>
    <path d="M12 3.4l-5.6 8h3.2l-3.6 5.4h12l-3.6-5.4h3.2z" />
    <path d="M12 16.8v4" />
  </Svg>
);

/* 15 · Placa solar: autosuficiencia. */
const IcoPlaca = (p) => (
  <Svg {...p}>
    <path d="M3 16.4L6 6.4h12l3 10z" />
    <path d="M4.5 11.4h15M11.2 6.4l-1.4 10M12.8 6.4l1.4 10" />
    <path d="M12 16.4v4.2" strokeWidth="1.3" />
  </Svg>
);

/* 16 · Balanza: finanzas y legalidad. */
const IcoBalanza = (p) => (
  <Svg {...p}>
    <path d="M12 4.6v15.8M6.6 20.4h10.8" />
    <path d="M4 7.6h16" />
    <path d="M1.8 13.4l3-5.8 3 5.8a3 3 0 0 1-6 0ZM16.2 13.4l3-5.8 3 5.8a3 3 0 0 1-6 0Z" />
  </Svg>
);

/* 17 · Calendario: el mantenimiento se hace por fechas. */
const IcoCalendario = (p) => (
  <Svg {...p}>
    <rect x="3.6" y="5.6" width="16.8" height="14.8" rx="1" />
    <path d="M3.6 10h16.8M8.4 3.2v4.4M15.6 3.2v4.4" />
    <path d="M8 14h3M13 14h3M8 17.2h3" strokeWidth="1.3" />
  </Svg>
);

/* 18 · Martillo: los proyectos prácticos son ya ponerse. El casco que había
   antes se leía como una campana. */
const IcoMartillo = (p) => (
  <Svg {...p}>
    <rect x="5" y="4.2" width="14" height="4.6" rx="0.8" />
    <path d="M12 8.8v11" />
    <path d="M5 6.5H2.4" />
  </Svg>
);

/* Por número de fase, en el orden del temario. */
export const ICONOS_FASE = {
  0: IcoDiana,
  1: IcoCimiento,
  2: IcoLupa,
  3: IcoPale,
  4: IcoCaja,
  5: IcoPaleta,
  6: IcoCubierta,
  7: IcoCapas,
  8: IcoSierra,
  9: IcoGrifo,
  10: IcoRayo,
  11: IcoRadiador,
  12: IcoCasa,
  13: IcoPlano,
  14: IcoArbol,
  15: IcoPlaca,
  16: IcoBalanza,
  17: IcoCalendario,
  18: IcoMartillo,
};
