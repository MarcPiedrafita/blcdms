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
