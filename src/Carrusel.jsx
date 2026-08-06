import React, { useRef, useState } from "react";

/* Dos ruedas en el mismo hueco: se pasa arrastrando o con las flechas.
 *
 *  El arrastre lo hace el propio navegador con scroll-snap, sin escuchar
 *  gestos a mano. Sale gratis el rebote, el momento del dedo y que funcione
 *  con rueda de ratón y con teclado, que hacerlo a mano nunca queda igual. */
export default function Carrusel({ paginas }) {
  const pista = useRef(null);
  const [i, setI] = useState(0);

  const ir = (n) => {
    const j = Math.max(0, Math.min(paginas.length - 1, n));
    pista.current?.scrollTo({ left: j * pista.current.clientWidth, behavior: "smooth" });
    setI(j);
  };

  /* Al arrastrar manda el scroll, no el estado: se lee de vuelta para que los
     puntos y las flechas digan la verdad. */
  const alDeslizar = () => {
    const p = pista.current;
    if (!p) return;
    const j = Math.round(p.scrollLeft / p.clientWidth);
    if (j !== i) setI(j);
  };

  return (
    <div className="carrusel">
      <div className="pista" ref={pista} onScroll={alDeslizar}>
        {paginas.map((p) => (
          <div className="hoja" key={p.clave}>
            {p.contenido}
          </div>
        ))}
      </div>

      <div className="mando">
        <button className="flecha" aria-label="Anterior" disabled={i === 0} onClick={() => ir(i - 1)}>
          ←
        </button>

        <div className="puntos">
          {paginas.map((p, j) => (
            <button
              key={p.clave}
              className={j === i ? "on" : ""}
              aria-label={p.titulo}
              aria-current={j === i ? "true" : undefined}
              onClick={() => ir(j)}
            />
          ))}
        </div>

        <button
          className="flecha"
          aria-label="Siguiente"
          disabled={i === paginas.length - 1}
          onClick={() => ir(i + 1)}
        >
          →
        </button>
      </div>

      <div className="rotulo-carrusel">{paginas[i]?.titulo}</div>
    </div>
  );
}
