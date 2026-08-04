import React, { useState, useEffect } from "react";
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

export default function App() {
  const [tab, setTab] = useState("dinero");
  const [datos, setDatos] = useState(leer);
  const [abierto, setAbierto] = useState(null);

  const guardar = (nuevo) => {
    setDatos(nuevo);
    escribir(nuevo);
  };

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

  return (
    <>
      <div className="wrap">
        {tab === "dinero" && <Dinero datos={datos} onGuardar={guardar} />}
        {tab === "presupuesto" && (
          <Presupuesto datos={datos} onGuardar={guardar} abierto={abierto} setAbierto={setAbierto} />
        )}
        {tab === "maquinaria" && (
          <Maquinaria datos={datos} onGuardar={guardar} abierto={abierto} setAbierto={setAbierto} />
        )}
        {tab === "ideas" && (
          <Ideas
            datos={datos}
            onGuardar={guardar}
            abierto={abierto}
            setAbierto={setAbierto}
            irAElemento={irAElemento}
          />
        )}
        {tab === "copia" && <Copia datos={datos} onGuardar={guardar} />}
      </div>

      <nav className="tabs">
        {TABS.map(([k, t]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => cambiarTab(k)}>
            {t}
          </button>
        ))}
      </nav>
    </>
  );
}
