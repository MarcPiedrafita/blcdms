import React, { useState, useEffect, useRef } from "react";
import { leer, escribir } from "./lib.js";
import Dinero from "./Dinero.jsx";
import Presupuesto from "./Presupuesto.jsx";
import Maquinaria from "./Maquinaria.jsx";
import Ideas from "./Ideas.jsx";
import Copia from "./Copia.jsx";

const TABS = [
  ["dinero", "Dinero"],
  ["presupuesto", "Obra"],
  ["maquinaria", "Máquinas"],
  ["ideas", "Ideas"],
  ["copia", "Copia"],
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

  const olvidar = () => {
    clearTimeout(reloj.current);
    setDeshacer(null);
  };

  const guardar = (nuevo) => {
    olvidar();
    aplicar(nuevo);
  };

  /* Borrar guarda el estado anterior y deja siete segundos para arrepentirse.
     Cualquier otro cambio cierra la ventana, así que deshacer solo puede
     revertir lo último y nunca se lleva por delante una edición posterior. */
  const quitar = (texto, nuevo) => {
    const previo = datos;
    clearTimeout(reloj.current);
    aplicar(nuevo);
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
        {tab === "copia" && <Copia datos={datos} onGuardar={guardar} />}
      </div>

      {deshacer && (
        <div className="toast" role="status">
          <span className="txt">{deshacer.texto}</span>
          <button
            onClick={() => {
              const previo = deshacer.previo;
              olvidar();
              aplicar(previo);
            }}
          >
            Deshacer
          </button>
        </div>
      )}

      <nav className="tabs">
        {TABS.map(([k, t]) => (
          <button
            key={k}
            className={tab === k ? "on" : ""}
            aria-current={tab === k ? "page" : undefined}
            onClick={() => cambiarTab(k)}
          >
            {t}
          </button>
        ))}
      </nav>
    </>
  );
}
