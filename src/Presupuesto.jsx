import React, { useState } from "react";
import {
  eur,
  eur2,
  num,
  UNIDADES,
  ESTADOS,
  nuevaCategoria,
  nuevoElemento,
  nuevaLinea,
  totalElemento,
  totalLinea,
} from "./lib.js";

const lineas = (n) => `${n} ${n === 1 ? "línea" : "líneas"}`;

export default function Presupuesto({ datos, onGuardar, onQuitar, abierto, setAbierto }) {
  const elemento = datos.elementos.find((e) => e.id === abierto);

  /* El nuevo cae en la misma categoría que el que estabas mirando, que es
     casi siempre lo que quieres: acabas la encimera y sigues con el fregadero. */
  const otro = () => {
    const el = nuevoElemento(elemento.categoriaId, "");
    onGuardar({ ...datos, elementos: [...datos.elementos, el] });
    setAbierto(el.id);
  };

  /* El key fuerza a remontar al saltar de un elemento a otro: si no, el foco
     no va al nombre y el estado local (confirmar borrado, paneles de tienda
     abiertos) se arrastra de una ficha a la siguiente. */
  if (elemento) {
    return (
      <Ficha
        key={elemento.id}
        datos={datos}
        elemento={elemento}
        onQuitar={onQuitar}
        onCambio={(n) =>
          onGuardar({ ...datos, elementos: datos.elementos.map((e) => (e.id === n.id ? n : e)) })
        }
        onBorrar={() => {
          onQuitar(`«${elemento.nombre || "Elemento sin nombre"}» borrado`, {
            ...datos,
            elementos: datos.elementos.filter((e) => e.id !== elemento.id),
          });
          setAbierto(null);
        }}
        onOtro={otro}
        onVolver={() => setAbierto(null)}
      />
    );
  }
  return <Lista datos={datos} onGuardar={onGuardar} onQuitar={onQuitar} setAbierto={setAbierto} />;
}

/* ---------- lista por categorías ---------- */

function Lista({ datos, onGuardar, onQuitar, setAbierto }) {
  const [nuevaCat, setNuevaCat] = useState("");
  const [formCat, setFormCat] = useState(false);
  const [nuevoEnCat, setNuevoEnCat] = useState(null);
  const [borrandoCat, setBorrandoCat] = useState(null);
  const [nombreEl, setNombreEl] = useState("");
  const [filtro, setFiltro] = useState("todo");


  const crearCat = () => {
    if (!nuevaCat.trim()) return;
    onGuardar({ ...datos, categorias: [...datos.categorias, nuevaCategoria(nuevaCat.trim())] });
    setNuevaCat("");
    setFormCat(false);
  };

  const crearEl = (catId) => {
    if (!nombreEl.trim()) return;
    const el = nuevoElemento(catId, nombreEl.trim());
    onGuardar({ ...datos, elementos: [...datos.elementos, el] });
    setNombreEl("");
    setNuevoEnCat(null);
    setAbierto(el.id);
  };

  const borrarCat = (cat) => {
    setBorrandoCat(null);
    onQuitar(`«${cat.nombre}» borrada`, {
      ...datos,
      categorias: datos.categorias.filter((c) => c.id !== cat.id),
      elementos: datos.elementos.filter((e) => e.categoriaId !== cat.id),
    });
  };

  const visibles = (catId) =>
    datos.elementos.filter((e) => e.categoriaId === catId && (filtro === "todo" || e.fase === filtro));

  return (
    <>
      {/* Aquí había un resumen de materiales por fase. Sobra: el desglose de
          arriba ya trae la fila de materiales dentro del total de la obra, y
          dos cifras seguidas llamadas «imprescindible» valiendo cosas
          distintas se leen como una errata. */}

      <div className="seg">
        {[
          ["todo", "Todo"],
          ["imprescindible", "Imprescindibles"],
          ["extra", "Extras"],
        ].map(([k, l]) => (
          <button key={k} className={filtro === k ? "on" : ""} onClick={() => setFiltro(k)}>
            {l}
          </button>
        ))}
      </div>

      {datos.categorias.length === 0 && (
        <div className="vacio" style={{ marginTop: 24 }}>
          <b>Empieza por una categoría</b>
          Cocina, Baño, Tejado, Patio… Dentro de cada una irás metiendo elementos con sus materiales.
        </div>
      )}

      {datos.categorias.map((cat) => {
        const els = visibles(cat.id);
        const cuantos = datos.elementos.filter((e) => e.categoriaId === cat.id).length;
        const suma = datos.elementos
          .filter((e) => e.categoriaId === cat.id)
          .reduce((s, e) => s + totalElemento(e), 0);
        return (
          <div key={cat.id}>
            <div className="catcab">
              <span className="n">{cat.nombre}</span>
              <span className="c">{eur(suma)}</span>
              <button
                className="equis"
                aria-label={`Borrar la categoría ${cat.nombre}`}
                onClick={() => setBorrandoCat(borrandoCat === cat.id ? null : cat.id)}
              >
                ×
              </button>
            </div>

            {borrandoCat === cat.id && (
              <div className="aviso" style={{ margin: "12px 0" }}>
                <b>¿Borrar «{cat.nombre}»?</b>
                <br />
                Se van con ella {cuantos === 1 ? "su elemento" : `sus ${cuantos} elementos`}.
                <div className="fila" style={{ marginTop: 12 }}>
                  <button className="btn peli mini" style={{ width: "100%" }} onClick={() => borrarCat(cat)}>
                    Sí, borrar
                  </button>
                  <button
                    className="btn sec mini"
                    style={{ width: "100%" }}
                    onClick={() => setBorrandoCat(null)}
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {els.map((e) => (
              <button key={e.id} className="item" onClick={() => setAbierto(e.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nom">{e.nombre || "Sin nombre"}</div>
                  <div style={{ marginTop: 7, display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <span className={`chip ${e.fase}`}>{e.fase}</span>
                    <span className={`chip ${e.estado}`}>{e.estado}</span>
                    <span className="chip">{lineas((e.lineas || []).length)}</span>
                  </div>
                </div>
                <div className="imp">{eur(totalElemento(e))}</div>
              </button>
            ))}

            {nuevoEnCat === cat.id ? (
              <div style={{ display: "flex", gap: 8, padding: "14px 0" }}>
                <input
                  autoFocus
                  value={nombreEl}
                  onChange={(ev) => setNombreEl(ev.target.value)}
                  placeholder="Barbacoa de obra"
                  onKeyDown={(ev) => ev.key === "Enter" && crearEl(cat.id)}
                />
                <button className="btn mini" style={{ flex: "none" }} onClick={() => crearEl(cat.id)}>
                  Ok
                </button>
              </div>
            ) : (
              <button
                className="link"
                style={{ display: "inline-block", margin: "14px 0 4px" }}
                onClick={() => {
                  setNombreEl("");
                  setNuevoEnCat(cat.id);
                }}
              >
                + Añadir elemento
              </button>
            )}
          </div>
        );
      })}

      <div className="blq">
        {formCat ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              autoFocus
              value={nuevaCat}
              onChange={(e) => setNuevaCat(e.target.value)}
              placeholder="Patio"
              onKeyDown={(e) => e.key === "Enter" && crearCat()}
            />
            <button className="btn mini" style={{ flex: "none" }} onClick={crearCat}>
              Ok
            </button>
          </div>
        ) : (
          <button className="btn sec" onClick={() => setFormCat(true)}>
            + Nueva categoría
          </button>
        )}
      </div>
    </>
  );
}

/* ---------- ficha de elemento ---------- */

function Ficha({ datos, elemento, onCambio, onQuitar, onBorrar, onOtro, onVolver }) {
  const [conf, setConf] = useState(false);
  const [extras, setExtras] = useState({});
  const set = (k, v) => onCambio({ ...elemento, [k]: v });
  const ls = elemento.lineas || [];

  const setLinea = (id, k, v) =>
    set(
      "lineas",
      ls.map((l) => (l.id === id ? { ...l, [k]: v } : l))
    );

  const quitarLinea = (l) =>
    onQuitar(`«${l.concepto || "Línea sin concepto"}» borrada`, {
      ...datos,
      elementos: datos.elementos.map((e) =>
        e.id === elemento.id ? { ...elemento, lineas: ls.filter((x) => x.id !== l.id) } : e
      ),
    });

  const total = totalElemento(elemento);

  return (
    <>
      <header className="cab" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="volver" aria-label="Volver a la lista" onClick={onVolver}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="marca" style={{ fontSize: 24 }}>
            {elemento.nombre || "Elemento nuevo"}
          </div>
          <div className="sub">{eur2(total)}</div>
        </div>
      </header>

      <div style={{ marginBottom: 13 }}>
        <label className="lab" htmlFor="el-nombre">
          Nombre
        </label>
        <input
          id="el-nombre"
          autoFocus={!elemento.nombre}
          value={elemento.nombre}
          onChange={(e) => set("nombre", e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 13 }}>
        <label className="lab" htmlFor="el-cat">
          Categoría
        </label>
        <select
          id="el-cat"
          value={elemento.categoriaId}
          onChange={(e) => set("categoriaId", e.target.value)}
        >
          {datos.categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 13 }}>
        <span className="lab">Fase</span>
        <div className="seg">
          {["imprescindible", "extra"].map((f) => (
            <button key={f} className={elemento.fase === f ? "on" : ""} onClick={() => set("fase", f)}>
              {f === "imprescindible" ? "Para entrar a vivir" : "Puede esperar"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="lab">Estado</span>
        <div className="seg">
          {ESTADOS.map((s) => (
            <button key={s} className={elemento.estado === s ? "on" : ""} onClick={() => set("estado", s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="blq">
        <div className="tit">Materiales</div>

        {ls.length === 0 && (
          <div className="ayuda" style={{ margin: "0 0 14px" }}>
            Todavía no hay nada. Añade ladrillos, sacos de mortero, tornillos… lo que haga falta.
          </div>
        )}

        {ls.map((l) => (
          <div className="ln" key={l.id}>
            <div className="top">
              <input
                value={l.concepto}
                onChange={(e) => setLinea(l.id, "concepto", e.target.value)}
                placeholder="Ladrillo refractario"
                aria-label="Concepto"
              />
              <button
                className="equis"
                aria-label={`Borrar la línea ${l.concepto || "sin concepto"}`}
                onClick={() => quitarLinea(l)}
              >
                ×
              </button>
            </div>

            <div className="tres">
              <input
                className="cant"
                inputMode="decimal"
                value={l.cantidad ?? ""}
                onChange={(e) => setLinea(l.id, "cantidad", num(e.target.value))}
                placeholder="1"
                aria-label="Cantidad"
              />
              <input
                className="und"
                list="unidades"
                value={l.unidad}
                onChange={(e) => setLinea(l.id, "unidad", e.target.value)}
                placeholder="ud"
                aria-label="Unidad"
              />
              <input
                className="pre"
                inputMode="decimal"
                value={l.precio ?? ""}
                onChange={(e) => setLinea(l.id, "precio", num(e.target.value))}
                placeholder="€ / unidad"
                aria-label="Precio por unidad"
              />
            </div>

            <div className="pie">
              <span className="tot">{eur2(totalLinea(l))}</span>
              <button className="link" onClick={() => setExtras({ ...extras, [l.id]: !extras[l.id] })}>
                {extras[l.id] || l.tienda || l.enlace ? "Tienda" : "+ Tienda"}
              </button>
            </div>

            {(extras[l.id] || l.tienda || l.enlace) && (
              <div style={{ marginTop: 10 }}>
                <input
                  value={l.tienda}
                  onChange={(e) => setLinea(l.id, "tienda", e.target.value)}
                  placeholder="Dónde lo viste"
                  aria-label="Tienda"
                  style={{ marginBottom: 7 }}
                />
                <input
                  value={l.enlace}
                  onChange={(e) => setLinea(l.id, "enlace", e.target.value)}
                  placeholder="https://…"
                  aria-label="Enlace"
                />
                {l.enlace && (
                  <a
                    className="link"
                    href={l.enlace}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-block", marginTop: 10 }}
                  >
                    Abrir
                  </a>
                )}
              </div>
            )}
          </div>
        ))}

        <datalist id="unidades">
          {UNIDADES.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>

        <button className="btn sec" onClick={() => set("lineas", [...ls, nuevaLinea()])}>
          + Añadir línea
        </button>

        <div className="desg suma" style={{ marginTop: 20 }}>
          <span className="n">Total del elemento</span>
          <span className="c">{eur2(total)}</span>
        </div>
      </div>

      <div className="blq">
        <div className="tit">Notas</div>
        <textarea
          rows={4}
          value={elemento.notas}
          onChange={(e) => set("notas", e.target.value)}
          placeholder="Medidas, cómo lo vas a hacer, qué te falta por mirar…"
          aria-label="Notas del elemento"
        />
      </div>

      <div className="blq">
        <button className="btn pri" onClick={onOtro}>
          + Añadir otro elemento
        </button>
        <div className="ayuda">
          Este se guarda solo. No hace falta guardar nada. El nuevo va a la misma categoría.
        </div>
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
            Borrar elemento
          </button>
        )}
      </div>
    </>
  );
}
