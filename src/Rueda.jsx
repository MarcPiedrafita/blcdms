import React from "react";
import { eur } from "./lib.js";

/* La rueda dice dos cosas a la vez:
 *
 *   el anillo grueso   de qué se compone el objetivo, una variante del
 *                      amarillo por partida
 *   el arco fino       cuánto llevas ahorrado, en tinta y no en amarillo,
 *                      para que se lea como otra medida y no como una
 *                      quinta partida
 */

export const PARTES = [
  ["casa", "Precio de la casa"],
  ["impuestos", "Impuestos y gastos"],
  ["obra", "Obra imprescindible"],
  ["colchon", "Colchón"],
];

const R = 76;
const RP = 54;
const C = 2 * Math.PI * R;
const CP = 2 * Math.PI * RP;

/* Separación entre trozos, en unidades de circunferencia. Sin esto dos
   partidas contiguas se leen como una sola mancha. */
const HUECO = 5;

export default function Rueda({ obj, tengo, pct }) {
  const partidas = PARTES.map(([k, n]) => ({
    k,
    n: k === "casa" && obj.esHipoteca ? "Entrada de la casa" : n,
    valor: obj[k] || 0,
  }));
  const costes = partidas.reduce((a, t) => a + t.valor, 0);

  /* Con el objetivo forzado a mano por encima de lo calculado, las cuatro
     partidas no llenan el anillo. Ese hueco es dinero real del objetivo, así
     que se dibuja: sin él la rueda sumaría una cifra y el centro otra. En gris
     y no en amarillo, porque no es una partida costeada sino margen que
     pusiste tú. */
  const margen = Math.max(0, (obj.valor || 0) - costes);
  const trozos = [...partidas, { k: "margen", n: "Margen puesto a mano", valor: margen }];
  const suma = costes + margen;
  const conValor = trozos.filter((t) => t.valor > 0);

  let acumulado = 0;
  const arcos = conValor.map((t) => {
    const largo = (t.valor / suma) * C;
    const desde = acumulado;
    acumulado += largo;
    // El hueco se come del final del trozo, nunca más de un tercio: con una
    // partida diminuta preferimos una raya fina a que desaparezca.
    const hueco = conValor.length > 1 ? Math.min(HUECO, largo / 3) : 0;
    return { ...t, largo: largo - hueco, desde };
  });

  /* El objetivo que manda es obj.valor, que no tiene por qué ser la suma de
     las partidas: se puede haber forzado por debajo de lo calculado. */
  const resumen = conValor.length
    ? `Objetivo de ${eur(obj.valor)}: ` +
      conValor.map((t) => `${t.n}, ${eur(t.valor)}`).join("; ") +
      (obj.valor < costes ? ` (las partidas suman ${eur(costes)})` : "") +
      `. Ahorrado ${eur(tengo)}, un ${pct.toFixed(0)}%.`
    : "Todavía no hay objetivo: rellena el precio de la casa.";

  return (
    <div className="rueda">
      <svg viewBox="0 0 200 200" role="img" aria-label={resumen}>
        {/* pista */}
        <circle className="pista" cx="100" cy="100" r={R} />

        {arcos.map((a) => (
          <circle
            key={a.k}
            className={`trozo t-${a.k}`}
            cx="100"
            cy="100"
            r={R}
            strokeDasharray={`${a.largo} ${C - a.largo}`}
            strokeDashoffset={-a.desde}
          />
        ))}

        {/* avance */}
        <circle className="pista-avance" cx="100" cy="100" r={RP} />
        {/* A cero no se dibuja: el extremo redondeado de un arco de largo cero
            deja un punto suelto flotando arriba. */}
        {pct > 0 && (
          <circle
            className="avance"
            cx="100"
            cy="100"
            r={RP}
            strokeDasharray={`${(pct / 100) * CP} ${CP}`}
          />
        )}
      </svg>

      <div className="centro">
        <div className="cifra">{eur(tengo)}</div>
        <div className="pct">{pct.toFixed(0)}%</div>
      </div>
    </div>
  );
}
