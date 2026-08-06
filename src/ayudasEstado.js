import { uid } from "./lib.js";

/* ---------- ayudas estatales, para no empezar de cero ----------
 *
 *  Comprobado en agosto de 2026 contra el Real Decreto 326/2026, de 22 de
 *  abril, que regula el Plan Estatal de Vivienda 2026-2030 (BOE del 23 de
 *  abril, en vigor desde el 24). Sustituye al plan 2022-2025, donde esta misma
 *  ayuda topaba en 10.800 € y solo llegaba a viviendas de hasta 120.000 €.
 *
 *  Dos avisos que van también en la propia ficha, porque son la diferencia
 *  entre orientarse y llevarse un chasco:
 *
 *  - Esto lo gestiona cada comunidad autónoma. El Real Decreto pone el marco y
 *    los topes; el precio máximo de la vivienda, los plazos y el reparto los
 *    fija la convocatoria de tu comunidad, y hasta que no sale no hay nada que
 *    solicitar.
 *  - Son plantillas para que edites, no una resolución. Antes de contar con el
 *    dinero, mira la convocatoria de tu comunidad.
 */

export const COMPROBADO = "agosto de 2026";

const req = (texto, cumplido = "?") => ({ id: uid(), texto, cumplido });

export const PLANTILLAS = [
  {
    clave: "compra-joven",
    titulo: "Compra en municipio pequeño (jóvenes)",
    resumen: "Hasta 15.000 €, sin pasar del 20% del precio",
    construir: () => ({
      nombre: "Ayuda a jóvenes para comprar en municipio pequeño",
      organismo: "Estado · Plan Estatal de Vivienda 2026-2030, la gestiona tu comunidad",
      importe: null,
      estado: "explorando",
      notas:
        "Real Decreto 326/2026, de 22 de abril (BOE del 23), Línea 3. En vigor desde el 24 de abril de 2026.\n\n" +
        "Cuánto es: el 20% del precio de compra, con un tope de 15.000 €. Como el tope del 20% suele morder antes " +
        "que el de 15.000, para una casa de 55.000 € salen 11.000 €, y solo llegarías al tope con casas de 75.000 € " +
        "o más.\n\n" +
        "Ojo: la convocatoria la saca tu comunidad autónoma, y es ella la que fija el precio máximo de la vivienda " +
        "(entre 200.000 y 325.000 € según cuál), los plazos y el dinero disponible. Hasta que no publique la suya no " +
        "hay nada que solicitar, y suelen agotarse por orden de entrada.\n\n" +
        "Comprobado en " + COMPROBADO + ". Confírmalo en la convocatoria de tu comunidad antes de contar con ello.",
      requisitos: [
        req("Tener 35 años o menos al solicitarla"),
        req("Que el municipio tenga 10.000 habitantes o menos (hasta 20.000 si pierde población)"),
        req("Que sea tu primera vivienda: no ser titular de ninguna otra en España"),
        req("Ingresos de la unidad de convivencia de 5 veces el IPREM o menos (unos 42.000 € al año en 2026)"),
        req("Que vaya a ser tu residencia habitual y permanente"),
        req("Que el precio no pase del máximo que fije tu comunidad autónoma"),
        req("Que haya convocatoria abierta en tu comunidad y quede dinero"),
      ],
    }),
  },
  {
    clave: "rehabilitacion",
    titulo: "Rehabilitación de la vivienda",
    resumen: "Topes por tipo de obra, del 8.000 al 22.000 €",
    construir: () => ({
      nombre: "Ayudas a la rehabilitación",
      organismo: "Estado · Plan Estatal de Vivienda 2026-2030, la gestiona tu comunidad",
      importe: null,
      estado: "explorando",
      notas:
        "Real Decreto 326/2026, Línea 2 (rehabilitación, accesibilidad y renovación urbana y rural).\n\n" +
        "Topes por vivienda según el tipo de obra:\n" +
        "· Seguridad del edificio (estructura): hasta 8.000 €\n" +
        "· Habitabilidad: hasta 7.500 €\n" +
        "· Accesibilidad dentro de la vivienda: hasta 18.000 €\n" +
        "· Accesibilidad integral del edificio: hasta 22.000 €\n" +
        "· Si la casa tiene protección patrimonial: hasta 30.000 € más\n\n" +
        "Va dirigido a edificios construidos antes de 2006, y buena parte de los importes dependen de cuánto consumo " +
        "de energía primaria consigas bajar con la obra: cuanto más ahorro certificado, más ayuda.\n\n" +
        "Se suele pedir certificado energético antes y después, y proyecto técnico. Eso es tiempo y dinero por " +
        "delante, así que mira si te compensa antes de meterte.\n\n" +
        "Comprobado en " + COMPROBADO + ". Los tramos exactos y qué obras entran los concreta la convocatoria de tu " +
        "comunidad.",
      requisitos: [
        req("Que la casa se construyera antes de 2006"),
        req("Tener el certificado energético de partida"),
        req("Saber cuánto consumo de energía baja la obra que vas a hacer"),
        req("Que las obras no hayan empezado antes de pedirlo (suele ser motivo de denegación)"),
        req("Que haya convocatoria abierta en tu comunidad"),
      ],
    }),
  },
];
