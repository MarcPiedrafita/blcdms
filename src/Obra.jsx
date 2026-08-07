import React, { useState } from "react";
import { eur, totales, ratios, estimar, desdePlantilla, num } from "./lib.js";
import Presupuesto from "./Presupuesto.jsx";
import Plantillas from "./Plantillas.jsx";

/* La obra tiene dos vistas: el presupuesto de esta casa y las plantillas, que
   son presupuestos tipo sobre una casa de referencia para sacar un €/m².
 *
 *  Cuando hay una ficha abierta manda la ficha, que trae su cabecera. */
export default function Obra({ datos, onGuardar, onQuitar, abierto, setAbierto }) {
  const [vista, setVista] = useState("presupuesto");

  const elementoAbierto = datos.elementos.find((e) => e.id === abierto);
  const plantillaAbierta = datos.plantillas.find((p) => p.id === abierto);

  const comun = { datos, onGuardar, onQuitar, abierto, setAbierto };

  if (elementoAbierto) return <Presupuesto {...comun} />;
  if (plantillaAbierta) return <Plantillas {...comun} />;

  const t = totales(datos);

  return (
    <>
      <header className="cab">
        <div className="marca">
          <em>{vista === "presupuesto" ? "La" : "Las"}</em>
          {vista === "presupuesto" ? "Obra" : "Plantillas"}
        </div>
        <div className="sub">
          {vista === "presupuesto"
            ? `${eur(t.total)} · ${eur(t.imprescindible)} imprescindible`
            : `${datos.plantillas.length} ${datos.plantillas.length === 1 ? "plantilla" : "plantillas"}`}
        </div>
      </header>

      <div className="seg" style={{ marginBottom: 22 }}>
        {[
          ["presupuesto", "Presupuesto"],
          ["plantillas", "Plantillas"],
        ].map(([k, l]) => (
          <button key={k} className={vista === k ? "on" : ""} onClick={() => setVista(k)}>
            {l}
          </button>
        ))}
      </div>

      {vista === "presupuesto" ? (
        <>
          <Desglose t={t} />
          {datos.plantillas.length > 0 && <Generar datos={datos} onGuardar={onGuardar} />}
          <Presupuesto {...comun} />
        </>
      ) : (
        <Plantillas {...comun} />
      )}
    </>
  );
}

/* Qué cuesta la obra, por partes. «Imprescindible» a secas junta cuatro cosas
   que se compran en sitios distintos —materiales, máquinas, EPIs y papeleo— y
   así no se ve cuál se está comiendo el presupuesto.
 *
 *  Los extras van al final y aparte, porque no cuentan para el objetivo de
 *  ahorro y mezclarlos arriba haría parecer que sí. */
function Desglose({ t }) {
  const conValor = t.partes.filter(([, , v]) => v > 0);

  if (t.total === 0) return null;

  return (
    <div className="blq" style={{ marginTop: 0, marginBottom: 22, borderTop: "none", paddingTop: 0 }}>
      {conValor.length === 0 ? (
        <div className="ayuda" style={{ marginTop: 0 }}>
          Todavía no hay nada imprescindible presupuestado.
        </div>
      ) : (
        conValor.map(([k, etiqueta, v]) => (
          <div className="desg" key={k}>
            <span className="n">{etiqueta}</span>
            <span className="c">{eur(v)}</span>
          </div>
        ))
      )}

      <div className="desg suma">
        <span className="n">Imprescindible</span>
        <span className="c">{eur(t.imprescindible)}</span>
      </div>

      {t.extra > 0 && (
        <div className="desg" style={{ borderBottom: "none" }}>
          <span className="n">
            Extras
            <span className="matiz">aparte: no cuentan para el objetivo de ahorro</span>
          </span>
          <span className="c">{eur(t.extra)}</span>
        </div>
      )}
    </div>
  );
}

/* Genera el presupuesto de esta casa a partir de una plantilla, escalando las
   cantidades de lo que va por metro y dejando lo fijo tal cual. */
function Generar({ datos, onGuardar }) {
  const [abierto, setAbierto] = useState(false);
  const [id, setId] = useState(datos.plantillas[0]?.id || "");
  const [metros, setMetros] = useState("");
  const [hecho, setHecho] = useState(null);

  const p = datos.plantillas.find((x) => x.id === id);
  const r = p ? ratios(p) : null;
  const m = num(metros);
  const previo = r && m ? estimar(r.conExtras, m) : null;
  const previoEsencial = r && m ? estimar(r.esencial, m) : null;

  const generar = () => {
    if (!p || !m) return;
    const { categorias, elementos } = desdePlantilla(p, m);

    /* Si ya tienes una categoría que se llama igual, se reutiliza en vez de
       crear una segunda con el mismo nombre. */
    const porNombre = new Map(datos.categorias.map((c) => [c.nombre.toLowerCase(), c.id]));
    const nuevas = [];
    const traduce = new Map();
    for (const c of categorias) {
      const ya = porNombre.get(c.nombre.toLowerCase());
      if (ya) traduce.set(c.id, ya);
      else {
        nuevas.push(c);
        traduce.set(c.id, c.id);
      }
    }

    onGuardar({
      ...datos,
      categorias: [...datos.categorias, ...nuevas],
      elementos: [
        ...datos.elementos,
        ...elementos.map((e) => ({ ...e, categoriaId: traduce.get(e.categoriaId) || e.categoriaId })),
      ],
    });
    setHecho({ n: elementos.length, m, nombre: p.nombre });
    setAbierto(false);
    setMetros("");
  };

  if (hecho) {
    return (
      <div className="aviso" style={{ marginBottom: 20 }}>
        <b>Metidos {hecho.n} elementos</b>
        <br />
        Salen de «{hecho.nombre}» escalada a {hecho.m} m². A partir de aquí edítalos como quieras: ya son
        de esta casa y no tocan la plantilla.
        <div style={{ marginTop: 12 }}>
          <button className="btn sec mini" onClick={() => setHecho(null)}>Vale</button>
        </div>
      </div>
    );
  }

  if (!abierto) {
    return (
      <button className="btn sec" style={{ marginBottom: 20 }} onClick={() => setAbierto(true)}>
        Crear desde una plantilla
      </button>
    );
  }

  return (
    <div className="blq" style={{ marginTop: 0, marginBottom: 20 }}>
      <div className="tit">Desde una plantilla</div>

      <label className="lab" htmlFor="gen-plantilla">Cuál</label>
      <select id="gen-plantilla" value={id} onChange={(e) => setId(e.target.value)} style={{ marginBottom: 12 }}>
        {datos.plantillas.map((x) => (
          <option key={x.id} value={x.id}>
            {x.nombre || "Sin nombre"}
          </option>
        ))}
      </select>

      <label className="lab" htmlFor="gen-metros">Metros de esta casa</label>
      <input
        id="gen-metros"
        inputMode="decimal"
        value={metros}
        onChange={(e) => setMetros(e.target.value)}
        placeholder={String(r?.metros || 100)}
      />

      {previo != null && (
        <div className="desg" style={{ marginTop: 14 }}>
          <span className="n">
            Saldría por
            <span className="matiz">{eur(previoEsencial)} solo lo esencial</span>
          </span>
          <span className="c">{eur(previo)}</span>
        </div>
      )}

      <div className="fila" style={{ marginTop: 16 }}>
        <button className="btn pri" disabled={!m} onClick={generar}>
          Generar
        </button>
        <button className="btn sec" onClick={() => setAbierto(false)}>
          Cancelar
        </button>
      </div>
      <div className="ayuda">
        Se añade a lo que ya tengas, no lo sustituye. Las categorías que ya existan con el mismo nombre se
        reutilizan.
      </div>
    </div>
  );
}
