import React, { useState, useEffect, useRef, useCallback } from "react";
import { leer, escribir, VACIO } from "./lib.js";
import { useNube } from "./useNube.js";
import Dinero from "./Dinero.jsx";
import Presupuesto from "./Presupuesto.jsx";
import Maquinaria from "./Maquinaria.jsx";
import Ideas from "./Ideas.jsx";
import Papeleo from "./Papeleo.jsx";
import Copia from "./Copia.jsx";
import { IcoDinero, IcoObra, IcoMaquinas, IcoIdeas, IcoTramites, IcoCopia } from "./Iconos.jsx";

const TABS = [
  ["dinero", "Dinero", IcoDinero],
  ["presupuesto", "Obra", IcoObra],
  ["maquinaria", "Máquinas", IcoMaquinas],
  ["ideas", "Ideas", IcoIdeas],
  ["papeleo", "Papeleo", IcoTramites],
  ["copia", "Copia", IcoCopia],
];

const ESPERA = 7000;

export default function App() {
  const [tab, setTab] = useState("dinero");
  const [datos, setDatos] = useState(leer);
  const [abierto, setAbierto] = useState(null);
  const [deshacer, setDeshacer] = useState(null);
  const reloj = useRef(null);

  const aplicar = (nuevo) => {
    setDatos(nuevo);
    escribir(nuevo);
  };

  /* Adoptar lo que viene del servidor no es un cambio tuyo: escribe igual,
     pero no marca nada como pendiente de subir. Si lo marcara, cada bajada
     dispararía una subida y los dos aparatos se rebotarían para siempre. */
  const adoptar = useCallback((remoto) => {
    aplicar({ ...VACIO, ...remoto, dinero: { ...VACIO.dinero, ...(remoto?.dinero || {}) } });
  }, []);

  const nube = useNube(datos, adoptar);

  const olvidar = () => {
    clearTimeout(reloj.current);
    setDeshacer(null);
  };

  const guardar = (nuevo) => {
    olvidar();
    aplicar(nuevo);
    nube.marcarCambio();
  };

  /* Borrar guarda el estado anterior y deja siete segundos para arrepentirse.
     Cualquier otro cambio cierra la ventana, así que deshacer solo puede
     revertir lo último y nunca se lleva por delante una edición posterior. */
  const quitar = (texto, nuevo) => {
    const previo = datos;
    clearTimeout(reloj.current);
    aplicar(nuevo);
    nube.marcarCambio();
    setDeshacer({ texto, previo });
    reloj.current = setTimeout(() => setDeshacer(null), ESPERA);
  };

  useEffect(() => () => clearTimeout(reloj.current), []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, abierto]);

  const cambiarTab = (k) => {
    setAbierto(null);
    setTab(k);
  };

  const irAElemento = (id) => {
    setTab("presupuesto");
    setAbierto(id);
  };

  const comun = { datos, onGuardar: guardar, onQuitar: quitar, abierto, setAbierto };

  return (
    <>
      <div className="wrap">
        {tab === "dinero" && <Dinero datos={datos} onGuardar={guardar} onQuitar={quitar} />}
        {tab === "presupuesto" && <Presupuesto {...comun} />}
        {tab === "maquinaria" && <Maquinaria {...comun} />}
        {tab === "ideas" && <Ideas {...comun} irAElemento={irAElemento} />}
        {tab === "papeleo" && <Papeleo {...comun} />}
        {tab === "copia" && <Copia datos={datos} onGuardar={guardar} nube={nube} />}
      </div>

      {deshacer && (
        <div className="toast" role="status">
          <span className="txt">{deshacer.texto}</span>
          <button
            onClick={() => {
              const previo = deshacer.previo;
              olvidar();
              aplicar(previo);
              nube.marcarCambio(); // deshacer también es un cambio que subir
            }}
          >
            Deshacer
          </button>
        </div>
      )}

      <nav className="tabs">
        {TABS.map(([k, t, Ico]) => (
          <button
            key={k}
            className={tab === k ? "on" : ""}
            aria-current={tab === k ? "page" : undefined}
            onClick={() => cambiarTab(k)}
          >
            <Ico tam={20} />
            <span>{t}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
