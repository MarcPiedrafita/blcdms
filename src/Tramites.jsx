import React, { useState } from "react";
import { nuevoTramite, num, eur, totales, TIPOS_TRAMITE, URGENCIAS } from "./lib.js";
import { IcoSello, IcoDocumento, IcoDinero, IcoHecho } from "./Iconos.jsx";

const ICONO = { tramite: IcoSello, documento: IcoDocumento, pago: IcoDinero };
const NOMBRE_TIPO = Object.fromEntries(TIPOS_TRAMITE);
const NOMBRE_URGENCIA = Object.fromEntries(URGENCIAS);

/* Lo más urgente arriba, y dentro de cada nivel lo último que metiste. Lo ya
   hecho baja del todo: deja de ser trabajo pendiente. */
const ORDEN = { antelacion: 0, justo: 1, suelto: 2 };
const ordenar = (a, b) =>
  Number(a.hecho) - Number(b.hecho) ||
  (ORDEN[a.urgencia] ?? 9) - (ORDEN[b.urgencia] ?? 9) ||
  b.creado - a.creado;

export default function Tramites({ datos, onGuardar, onQuitar, abierto, setAbierto, irAAyuda, volverA }) {
  const tramite = datos.tramites.find((t) => t.id === abierto);

  const otro = () => {
    const t = nuevoTramite();
    if (tramite) {
      t.tipo = tramite.tipo;
      t.urgencia = tramite.urgencia;
    }
    onGuardar({ ...datos, tramites: [t, ...datos.tramites] });
    setAbierto(t.id);
  };

  if (tramite) {
    return (
      <Ficha
        key={tramite.id}
        tramite={tramite}
        ayuda={datos.ayudas.find((a) => a.id === tramite.ayudaId)}
        irAAyuda={irAAyuda}
        onOtro={otro}
        onCambio={(n) =>
          onGuardar({ ...datos, tramites: datos.tramites.map((t) => (t.id === n.id ? n : t)) })
        }
        onBorrar={() => {
          onQuitar(`«${tramite.nombre || "Trámite sin nombre"}» borrado`, {
            ...datos,
            tramites: datos.tramites.filter((t) => t.id !== tramite.id),
          });
          setAbierto(null);
        }}
        onVolver={() => (volverA ? irAAyuda(volverA) : setAbierto(null))}
      />
    );
  }
  return <Lista datos={datos} onGuardar={onGuardar} setAbierto={setAbierto} />;
}

function Lista({ datos, onGuardar, setAbierto }) {
  const [filtro, setFiltro] = useState("todo");

  const crear = () => {
    const t = nuevoTramite();
    if (filtro !== "todo") t.tipo = filtro;
    onGuardar({ ...datos, tramites: [t, ...datos.tramites] });
    setAbierto(t.id);
  };

  const alternar = (t) =>
    onGuardar({
      ...datos,
      tramites: datos.tramites.map((x) => (x.id === t.id ? { ...x, hecho: !x.hecho } : x)),
    });

  const lista = [...datos.tramites].filter((t) => filtro === "todo" || t.tipo === filtro).sort(ordenar);
  return (
    <>
      <button className="btn pri" style={{ marginBottom: 18 }} onClick={crear}>
        + Nuevo trámite
      </button>

      <div className="seg" style={{ marginBottom: 24 }}>
        {[["todo", "Todo"], ...TIPOS_TRAMITE].map(([k, l]) => (
          <button key={k} className={filtro === k ? "on" : ""} onClick={() => setFiltro(k)}>
            {l}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="vacio">
          <b>El papeleo también es obra</b>
          Licencia municipal, alta de suministros, nota simple, seguro decenal, el ITP. Apunta aquí lo que
          hay que pedir y con cuánta antelación, que es lo que de verdad frena una obra.
        </div>
      ) : (
        lista.map((t) => {
          const Ico = ICONO[t.tipo] || IcoSello;
          return (
            <div className={`item-tram${t.hecho ? " hecho" : ""}`} key={t.id}>
              <button
                className="marca-hecho"
                aria-label={t.hecho ? `Marcar «${t.nombre}» como pendiente` : `Marcar «${t.nombre}» como hecho`}
                aria-pressed={t.hecho}
                onClick={() => alternar(t)}
              >
                {t.hecho && <IcoHecho tam={15} />}
              </button>

              <button className="cuerpo" onClick={() => setAbierto(t.id)}>
                <div className="nom">
                  <Ico tam={15} />
                  <span>{t.nombre || "Sin nombre"}</span>
                </div>
                {t.descripcion && <div className="det">{t.descripcion.slice(0, 110)}{t.descripcion.length > 110 ? "…" : ""}</div>}
                <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`urg u-${t.urgencia}`}>{NOMBRE_URGENCIA[t.urgencia]}</span>
                  {t.coste != null && <span className="coste-tram">{eur(t.coste)}</span>}
                </div>
              </button>
            </div>
          );
        })
      )}
    </>
  );
}

function Ficha({ tramite, ayuda, irAAyuda, onCambio, onBorrar, onOtro, onVolver }) {
  const [conf, setConf] = useState(false);
  const set = (k, v) => onCambio({ ...tramite, [k]: v });
  const Ico = ICONO[tramite.tipo] || IcoSello;

  return (
    <>
      <header className="cab" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="volver" aria-label="Volver a la lista" onClick={onVolver}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="marca" style={{ fontSize: 24, display: "flex", alignItems: "center", gap: 9 }}>
            <Ico tam={20} />
            {tramite.nombre || `Nuevo ${NOMBRE_TIPO[tramite.tipo].toLowerCase()}`}
          </div>
        </div>
      </header>

      {ayuda && (
        <button className="colgado" onClick={() => irAAyuda(ayuda.id)}>
          <span className="lab" style={{ marginBottom: 3 }}>Es para la ayuda</span>
          {ayuda.nombre || "Ayuda sin nombre"}
        </button>
      )}

      <div style={{ marginBottom: 13 }}>
        <span className="lab">Qué es</span>
        <div className="seg">
          {TIPOS_TRAMITE.map(([k, l]) => (
            <button key={k} className={tramite.tipo === k ? "on" : ""} onClick={() => set("tipo", k)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 13 }}>
        <label className="lab" htmlFor="tram-nombre">
          Nombre
        </label>
        <input
          id="tram-nombre"
          autoFocus={!tramite.nombre}
          value={tramite.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          placeholder="Licencia de obra menor"
        />
      </div>

      <div style={{ marginBottom: 13 }}>
        <span className="lab">Cuánto hay que adelantarse</span>
        <div className="seg col">
          {URGENCIAS.map(([k, l]) => (
            <button key={k} className={tramite.urgencia === k ? "on" : ""} onClick={() => set("urgencia", k)}>
              {l}
            </button>
          ))}
        </div>
        <div className="ayuda">
          {tramite.urgencia === "antelacion"
            ? "Se pide con semanas o meses de margen. Si se te olvida, la obra espera."
            : tramite.urgencia === "justo"
            ? "Se puede resolver poco antes de empezar, pero antes."
            : "Puede esperar a que la obra esté en marcha."}
        </div>
      </div>

      <div style={{ marginBottom: 13 }}>
        <label className="lab" htmlFor="tram-coste">
          Lo que cuesta € (vacío = nada, o todavía no lo sabes)
        </label>
        <input
          id="tram-coste"
          inputMode="decimal"
          value={tramite.coste ?? ""}
          onChange={(e) => set("coste", num(e.target.value))}
          placeholder="180"
        />
        <div className="ayuda">
          Cuenta como imprescindible y sube el objetivo de ahorro, igual que una partida de obra. Sin la
          licencia no hay obra, así que no hay versión opcional de esto.
        </div>
      </div>

      <div>
        <label className="lab" htmlFor="tram-desc">
          Descripción
        </label>
        <textarea
          id="tram-desc"
          rows={9}
          value={tramite.descripcion}
          onChange={(e) => set("descripcion", e.target.value)}
          placeholder="Dónde se pide, qué papeles piden a su vez, cuánto cuesta, cuánto tarda, teléfono al que llamar…"
        />
      </div>

      <div className="blq">
        <button
          className={tramite.hecho ? "btn sec" : "btn pri"}
          onClick={() => set("hecho", !tramite.hecho)}
        >
          {tramite.hecho ? "Volver a pendiente" : "Marcar como hecho"}
        </button>
      </div>

      <div className="blq">
        <button className="btn pri" onClick={onOtro}>
          + Añadir otro
        </button>
        <div className="ayuda">Este se guarda solo. No hace falta guardar nada.</div>
      </div>

      <div className="blq">
        {conf ? (
          <div className="fila">
            <button className="btn peli" onClick={onBorrar}>
              Sí, borrar
            </button>
            <button className="btn sec" onClick={() => setConf(false)}>
              No
            </button>
          </div>
        ) : (
          <button className="btn peli" onClick={() => setConf(true)}>
            Borrar trámite
          </button>
        )}
      </div>
    </>
  );
}
