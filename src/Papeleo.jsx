import React, { useState } from "react";
import { eur, totales, ayudas as calcAyudas } from "./lib.js";
import Ayudas from "./Ayudas.jsx";
import Tramites from "./Tramites.jsx";

/* Ayudas y trámites viven en la misma pestaña con dos vistas: son la misma
   faena —papeles que hay que mover antes de empezar— y una séptima pestaña
   habría dejado los rótulos de abajo sin sitio.
 *
 *  Cuando hay una ficha abierta se sale del marco y manda la ficha, que trae
 *  su propia cabecera con la flecha de volver. */
export default function Papeleo({ datos, onGuardar, onQuitar, abierto, setAbierto }) {
  const [vista, setVista] = useState("ayudas");
  /* De qué ayuda venías al abrir un trámite. Sin esto, volver desde un trámite
     que acabas de crear desde una ayuda te deja en la lista de trámites, que no
     es de donde salías. */
  const [volverA, setVolverA] = useState(null);

  const ayudaAbierta = datos.ayudas.find((a) => a.id === abierto);
  const tramiteAbierto = datos.tramites.find((t) => t.id === abierto);

  const irATramite = (id, desdeAyuda = null) => {
    setVolverA(desdeAyuda);
    setVista("tramites");
    setAbierto(id);
  };
  const irAAyuda = (id) => {
    setVolverA(null);
    setVista("ayudas");
    setAbierto(id);
  };
  const cambiarVista = (v) => {
    setVolverA(null);
    setVista(v);
  };

  const comun = { datos, onGuardar, onQuitar, abierto, setAbierto };

  if (ayudaAbierta) return <Ayudas {...comun} irATramite={irATramite} />;
  if (tramiteAbierto) return <Tramites {...comun} irAAyuda={irAAyuda} volverA={volverA} />;

  const a = calcAyudas(datos);
  const pendientes = datos.tramites.filter((t) => !t.hecho).length;
  const frenan = datos.tramites.filter((t) => !t.hecho && t.urgencia === "antelacion").length;
  const cuestan = totales(datos).tramites;

  const sub =
    vista === "ayudas"
      ? datos.ayudas.length === 0
        ? "sin mirar todavía"
        : `${datos.ayudas.length} ${datos.ayudas.length === 1 ? "ayuda" : "ayudas"}${
            a.total > 0 ? ` · hasta ${eur(a.total)}` : ""
          }`
      : `${pendientes} ${pendientes === 1 ? "pendiente" : "pendientes"}${
          frenan > 0 ? ` · ${frenan} con antelación` : ""
        }${cuestan > 0 ? ` · ${eur(cuestan)}` : ""}`;

  return (
    <>
      <header className="cab">
        <div className="marca">
          <em>{vista === "ayudas" ? "Las" : "Los"}</em>
          {vista === "ayudas" ? "Ayudas" : "Trámites"}
        </div>
        <div className="sub">{sub}</div>
      </header>

      <div className="seg" style={{ marginBottom: 22 }}>
        {[
          ["ayudas", "Ayudas"],
          ["tramites", "Trámites"],
        ].map(([k, l]) => (
          <button key={k} className={vista === k ? "on" : ""} onClick={() => cambiarVista(k)}>
            {l}
          </button>
        ))}
      </div>

      {vista === "ayudas" ? (
        <Ayudas {...comun} irATramite={irATramite} />
      ) : (
        <Tramites {...comun} irAAyuda={irAAyuda} />
      )}
    </>
  );
}
