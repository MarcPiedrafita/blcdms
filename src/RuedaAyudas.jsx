import React from "react";
import { eur } from "./lib.js";

/* La misma geometría que la rueda del objetivo, pero los trozos no son
   partidas de gasto: son grados de certeza. Lo concedido es dinero, lo
   solicitado es una espera y lo que estás mirando todavía no es nada.
 *
 *  Se ordena así a propósito, de más firme a menos: de un vistazo ves cuánto
 *  de ese total es de verdad. */
const GRADOS = [
  ["concedida", "Concedida"],
  ["solicitada", "Solicitada"],
  ["explorando", "La estoy mirando"],
];

const R = 76;
const C = 2 * Math.PI * R;
const HUECO = 5;

export default function RuedaAyudas({ a, objetivoBruto }) {
  const trozos = GRADOS.map(([k, n]) => ({ k, n, valor: a[k] || 0 })).filter((t) => t.valor > 0);
  const suma = trozos.reduce((s, t) => s + t.valor, 0);

  /* El anillo entero es el objetivo, no la suma de las ayudas. Un importe
     suelto no dice nada —11.000 € ¿de qué?—; contra lo que hay que juntar sí,
     porque lo que se ve es el trozo del problema que te quitarían de encima.
     Y de paso el anillo deja de salir lleno de amarillo por tener una sola. */
  const escala = Math.max(objetivoBruto || 0, suma) || 1;
  const cubre = Math.min(100, (suma / escala) * 100);

  let acumulado = 0;
  const arcos = trozos.map((t) => {
    const largo = (t.valor / escala) * C;
    const desde = acumulado;
    acumulado += largo;
    const hueco = trozos.length > 1 ? Math.min(HUECO, largo / 3) : 0;
    return { ...t, largo: Math.max(0, largo - hueco), desde };
  });

  const resumen = trozos.length
    ? `Ayudas por ${eur(suma)}, un ${cubre.toFixed(0)}% del objetivo de ${eur(objetivoBruto)}: ` +
      trozos.map((t) => `${t.n}, ${eur(t.valor)}`).join("; ") +
      (a.denegada > 0 ? `. Denegadas ${eur(a.denegada)}, que no cuentan.` : ".")
    : "Todavía no has apuntado ninguna ayuda.";

  return (
    <div className="rueda">
      <svg viewBox="0 0 200 200" role="img" aria-label={resumen}>
        <circle className="pista" cx="100" cy="100" r={R} />
        {arcos.map((x) => (
          <circle
            key={x.k}
            className={`trozo a-${x.k}`}
            cx="100"
            cy="100"
            r={R}
            strokeDasharray={`${x.largo} ${C - x.largo}`}
            strokeDashoffset={-x.desde}
          />
        ))}
      </svg>

      <div className="centro">
        <div className="cifra">{eur(suma)}</div>
        <div className="pct">{suma > 0 ? `${cubre.toFixed(0)}% del objetivo` : "en ayudas"}</div>
      </div>
    </div>
  );
}
