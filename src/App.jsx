import React, { useState, useEffect, useRef, useCallback } from "react";
import { leer, escribir, VACIO } from "./lib.js";
import { useNube } from "./useNube.js";
import Dinero from "./Dinero.jsx";
import Obra from "./Obra.jsx";
import Maquinaria from "./Maquinaria.jsx";
import Ideas from "./Ideas.jsx";
import Papeleo from "./Papeleo.jsx";
import Copia from "./Copia.jsx";
import Temario from "./Temario.jsx";
import { IcoDinero, IcoObra, IcoMaquinas, IcoIdeas, IcoTramites, IcoCopia } from "./Iconos.jsx";

const TABS = [
  ["dinero", "Dinero", IcoDinero],
  ["presupuesto", "Obra", IcoObra],
  ["maquinaria", "Máquinas", IcoMaquinas],
  ["ideas", "Ideas", IcoIdeas],
  ["papeleo", "Papeleo", IcoTramites],
  ["copia", "Copia", IcoCopia],
];

/* Dos mundos que no se mezclan: la obra es dinero y decisiones de una casa
   concreta; el temario es aprender, y dura años. Meterlos en la misma barra de
   pestañas obligaba a una séptima y dejaba los rótulos sin sitio, pero sobre
   todo los ponía al mismo nivel y no lo están. */
const MUNDOS = [
  ["obra", "La obra"],
  ["temario", "Aprender"],
];

const ESPERA = 7000;

export default function App() {
  const [mundo, setMundo] = useState("obra");
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
  }, [tab, abierto, mundo]);

  const cambiarTab = (k) => {
    setAbierto(null);
    setTab(k);
  };

  /* Cambiar de mundo cierra lo que hubiera abierto: los ids de un lado no
     significan nada en el otro, y una ficha abierta se quedaría en blanco. */
  const cambiarMundo = (m) => {
    setAbierto(null);
    setMundo(m);
  };

  const irAElemento = (id) => {
    setTab("presupuesto");
    setAbierto(id);
  };

  const comun = { datos, onGuardar: guardar, onQuitar: quitar, abierto, setAbierto };

  return (
    <>
      <div className="mundos">
        {MUNDOS.map(([k, l]) => (
          <button
            key={k}
            className={mundo === k ? "on" : ""}
            aria-current={mundo === k ? "true" : undefined}
            onClick={() => cambiarMundo(k)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="wrap">
        {mundo === "temario" ? (
          <Temario datos={datos} onGuardar={guardar} abierto={abierto} setAbierto={setAbierto} />
        ) : (
          <>
            {tab === "dinero" && <Dinero datos={datos} onGuardar={guardar} onQuitar={quitar} />}
            {tab === "presupuesto" && <Obra {...comun} />}
            {tab === "maquinaria" && <Maquinaria {...comun} />}
            {tab === "ideas" && <Ideas {...comun} irAElemento={irAElemento} />}
            {tab === "papeleo" && <Papeleo {...comun} />}
            {tab === "copia" && <Copia datos={datos} onGuardar={guardar} nube={nube} />}
          </>
        )}
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

      {/* El temario no tiene pestañas: es una sola cosa con su propia
          navegación por dentro. */}
      <nav className="tabs" hidden={mundo === "temario"}>
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
