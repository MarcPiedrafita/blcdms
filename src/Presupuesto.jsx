import React, { useState } from "react";
import {
  eur,
  eur2,
  num,
  uid,
  UNIDADES,
  ESTADOS,
  nuevaCategoria,
  nuevoElemento,
  nuevaLinea,
  totalElemento,
  totalLinea,
  totales,
} from "./lib.js";

export default function Presupuesto({ datos, onGuardar, abierto, setAbierto }) {
  const elemento = datos.elementos.find((e) => e.id === abierto);
  if (elemento) {
    return (
      <Ficha
        datos={datos}
        elemento={elemento}
        onCambio={(n) =>
          onGuardar({ ...datos, elementos: datos.elementos.map((e) => (e.id === n.id ? n : e)) })
        }
        onBorrar={() => {
          onGuardar({ ...datos, elementos: datos.elementos.filter((e) => e.id !== elemento.id) });
          setAbierto(null);
        }}
        onVolver={() => setAbierto(null)}
      />
    );
  }
  return <Lista datos={datos} onGuardar={onGuardar} setAbierto={setAbierto} />;
}

/* ---------- lista por categorías ---------- */

function Lista({ datos, onGuardar, setAbierto }) {
  const [nuevaCat, setNuevaCat] = useState("");
  const [formCat, setFormCat] = useState(false);
  const [nuevoEnCat, setNuevoEnCat] = useState(null);
  const [nombreEl, setNombreEl] = useState("");
  const [filtro, setFiltro] = useState("todo");

  const t = totales(datos);

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
    const n = datos.elementos.filter((e) => e.categoriaId === cat.id).length;
    if (!confirm(`Borrar "${cat.nombre}" y sus ${n} elementos?`)) return;
    onGuardar({
      ...datos,
      categorias: datos.categorias.filter((c) => c.id !== cat.id),
      elementos: datos.elementos.filter((e) => e.categoriaId !== cat.id),
    });
  };

  const visibles = (catId) =>
    datos.elementos.filter((e) => e.categoriaId === catId && (filtro === "todo" || e.fase === filtro));

  return (
    <>
      <header className="cab">
        <div className="marca">
          El <em>presupuesto</em>
        </div>
        <div className="sub">
          {datos.elementos.length} elementos · {datos.categorias.length} categorías
        </div>
      </header>

      <div className="duo" style={{ marginBottom: 16 }}>
        <div className="imp">
          <div className="k">Imprescindible</div>
          <div className="v">{eur(t.obra.imprescindible)}</div>
        </div>
        <div className="ext">
          <div className="k">Extras</div>
          <div className="v">{eur(t.obra.extra)}</div>
        </div>
      </div>

      <div className="seg" style={{ marginBottom: 6 }}>
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
        <div className="vacio">
          <b>Empieza por una categoría</b>
          Cocina, Baño, Tejado, Patio… Dentro de cada una irás metiendo elementos con sus materiales.
        </div>
      )}

      {datos.categorias.map((cat) => {
        const els = visibles(cat.id);
        const suma = datos.elementos
          .filter((e) => e.categoriaId === cat.id)
          .reduce((s, e) => s + totalElemento(e), 0);
        return (
          <div key={cat.id}>
            <div className="catcab">
              <span className="n">{cat.nombre}</span>
              <span className="c">{eur(suma)}</span>
              <button className="equis" onClick={() => borrarCat(cat)}>
                ×
              </button>
            </div>

            {els.map((e) => (
              <button key={e.id} className="item" onClick={() => setAbierto(e.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nom">{e.nombre}</div>
                  <div style={{ marginTop: 6, display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <span className={`chip ${e.fase}`}>{e.fase}</span>
                    <span className={`chip ${e.estado}`}>{e.estado}</span>
                    <span className="chip">{(e.lineas || []).length} líneas</span>
                  </div>
                </div>
                <div className="imp">{eur(totalElemento(e))}</div>
              </button>
            ))}

            {nuevoEnCat === cat.id ? (
              <div style={{ display: "flex", gap: 8, padding: "12px 0" }}>
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
                style={{ display: "inline-block", margin: "12px 0 4px" }}
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

function Ficha({ datos, elemento, onCambio, onBorrar, onVolver }) {
  const [conf, setConf] = useState(false);
  const [extras, setExtras] = useState({});
  const set = (k, v) => onCambio({ ...elemento, [k]: v });
  const lineas = elemento.lineas || [];

  const setLinea = (id, k, v) =>
    set(
      "lineas",
      lineas.map((l) => (l.id === id ? { ...l, [k]: v } : l))
    );

  const total = totalElemento(elemento);

  return (
    <>
      <header className="cab" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="volver" onClick={onVolver}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="marca" style={{ fontSize: 21 }}>
            {elemento.nombre}
          </div>
          <div className="sub">{eur2(total)}</div>
        </div>
      </header>

      <div style={{ marginBottom: 12 }}>
        <label className="lab">Nombre</label>
        <input value={elemento.nombre} onChange={(e) => set("nombre", e.target.value)} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label className="lab">Categoría</label>
        <select value={elemento.categoriaId} onChange={(e) => set("categoriaId", e.target.value)}>
          {datos.categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label className="lab">Fase</label>
        <div className="seg">
          {["imprescindible", "extra"].map((f) => (
            <button key={f} className={elemento.fase === f ? "on" : ""} onClick={() => set("fase", f)}>
              {f === "imprescindible" ? "Para entrar a vivir" : "Puede esperar"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="lab">Estado</label>
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

        {lineas.length === 0 && (
          <div style={{ fontSize: 13, color: "var(--piedra)", marginBottom: 12, lineHeight: 1.5 }}>
            Todavía no hay nada. Añade ladrillos, sacos de mortero, tornillos… lo que haga falta.
          </div>
        )}

        {lineas.map((l) => (
          <div className="ln" key={l.id}>
            <div className="top">
              <input
                value={l.concepto}
                onChange={(e) => setLinea(l.id, "concepto", e.target.value)}
                placeholder="Ladrillo refractario"
              />
              <button
                className="equis"
                onClick={() =>
                  set(
                    "lineas",
                    lineas.filter((x) => x.id !== l.id)
                  )
                }
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
              />
              <input
                className="und"
                list="unidades"
                value={l.unidad}
                onChange={(e) => setLinea(l.id, "unidad", e.target.value)}
                placeholder="ud"
              />
              <input
                className="pre"
                inputMode="decimal"
                value={l.precio ?? ""}
                onChange={(e) => setLinea(l.id, "precio", num(e.target.value))}
                placeholder="€ / unidad"
              />
            </div>

            <div className="pie">
              <span className="sub">{eur2(totalLinea(l))}</span>
              <button
                className="link"
                onClick={() => setExtras({ ...extras, [l.id]: !extras[l.id] })}
              >
                {extras[l.id] || l.tienda || l.enlace ? "Tienda" : "+ Tienda"}
              </button>
            </div>

            {(extras[l.id] || l.tienda || l.enlace) && (
              <div style={{ marginTop: 9 }}>
                <input
                  value={l.tienda}
                  onChange={(e) => setLinea(l.id, "tienda", e.target.value)}
                  placeholder="Dónde lo viste"
                  style={{ marginBottom: 7 }}
                />
                <input
                  value={l.enlace}
                  onChange={(e) => setLinea(l.id, "enlace", e.target.value)}
                  placeholder="https://…"
                />
                {l.enlace && (
                  <a
                    className="link"
                    href={l.enlace}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-block", marginTop: 8 }}
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

        <button className="btn sec" onClick={() => set("lineas", [...lineas, nuevaLinea()])}>
          + Añadir línea
        </button>

        <div className="desg suma" style={{ marginTop: 18 }}>
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
        />
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
