import React, { useState } from "react";
import { nuevaIdea, nuevoElemento } from "./lib.js";

export default function Ideas({ datos, onGuardar, onQuitar, abierto, setAbierto, irAElemento }) {
  const idea = datos.ideas.find((i) => i.id === abierto);
  if (idea) {
    return (
      <Ficha
        datos={datos}
        idea={idea}
        onCambio={(n) => onGuardar({ ...datos, ideas: datos.ideas.map((i) => (i.id === n.id ? n : i)) })}
        onBorrar={() => {
          onQuitar(`«${idea.titulo || "Idea sin título"}» borrada`, {
            ...datos,
            ideas: datos.ideas.filter((i) => i.id !== idea.id),
          });
          setAbierto(null);
        }}
        onConvertir={(catId) => {
          const el = nuevoElemento(catId, idea.titulo || "Sin nombre");
          el.notas = idea.texto || "";
          onGuardar({
            ...datos,
            elementos: [...datos.elementos, el],
            ideas: datos.ideas.filter((i) => i.id !== idea.id),
          });
          setAbierto(null);
          irAElemento(el.id);
        }}
        onVolver={() => setAbierto(null)}
      />
    );
  }
  return <Lista datos={datos} onGuardar={onGuardar} setAbierto={setAbierto} />;
}

function Lista({ datos, onGuardar, setAbierto }) {
  const [filtro, setFiltro] = useState("todo");

  const crear = () => {
    const i = nuevaIdea();
    if (filtro === "patio") i.etiqueta = "patio";
    onGuardar({ ...datos, ideas: [i, ...datos.ideas] });
    setAbierto(i.id);
  };

  const lista = datos.ideas
    .filter((i) => filtro === "todo" || i.etiqueta === filtro)
    .sort((a, b) => b.creada - a.creada);

  return (
    <>
      <header className="cab">
        <div className="marca">
          <em>Las</em>ideas
        </div>
        <div className="sub">
          {datos.ideas.length} {datos.ideas.length === 1 ? "nota" : "notas"}
        </div>
      </header>

      <button className="btn pri" style={{ marginBottom: 18 }} onClick={crear}>
        + Nueva idea
      </button>

      <div className="seg" style={{ marginBottom: 24 }}>
        {[
          ["todo", "Todo"],
          ["casa", "Casa"],
          ["patio", "Patio y jardín"],
        ].map(([k, l]) => (
          <button key={k} className={filtro === k ? "on" : ""} onClick={() => setFiltro(k)}>
            {l}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="vacio">
          <b>Aquí no hay dinero</b>
          Solo notas. Lo que se te ocurra para la casa o el patio. Cuando una idea deje de ser una idea, la
          conviertes en elemento del presupuesto de un toque.
        </div>
      ) : (
        lista.map((i) => (
          <button key={i.id} className="item" onClick={() => setAbierto(i.id)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="nom">{i.titulo || "Sin título"}</div>
              {i.texto && (
                <div className="det" style={{ whiteSpace: "pre-wrap" }}>
                  {i.texto.slice(0, 120)}
                  {i.texto.length > 120 ? "…" : ""}
                </div>
              )}
              <div style={{ marginTop: 7 }}>
                <span className={`chip ${i.etiqueta}`}>{i.etiqueta}</span>
              </div>
            </div>
          </button>
        ))
      )}
    </>
  );
}

function Ficha({ datos, idea, onCambio, onBorrar, onConvertir, onVolver }) {
  const [conf, setConf] = useState(false);
  const [convertir, setConvertir] = useState(false);
  const [cat, setCat] = useState(datos.categorias[0]?.id || "");
  const set = (k, v) => onCambio({ ...idea, [k]: v });

  return (
    <>
      <header className="cab" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="volver" aria-label="Volver a la lista" onClick={onVolver}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="marca" style={{ fontSize: 24 }}>
            {idea.titulo || "Nueva idea"}
          </div>
        </div>
      </header>

      <div style={{ marginBottom: 13 }}>
        <label className="lab" htmlFor="idea-titulo">
          Título
        </label>
        <input
          id="idea-titulo"
          autoFocus={!idea.titulo}
          value={idea.titulo}
          onChange={(e) => set("titulo", e.target.value)}
          placeholder="Pérgola de madera sobre la entrada"
        />
      </div>

      <div style={{ marginBottom: 13 }}>
        <span className="lab">Dónde</span>
        <div className="seg">
          {["casa", "patio"].map((t) => (
            <button key={t} className={idea.etiqueta === t ? "on" : ""} onClick={() => set("etiqueta", t)}>
              {t === "casa" ? "Casa" : "Patio y jardín"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="lab" htmlFor="idea-texto">
          La idea
        </label>
        <textarea
          id="idea-texto"
          rows={12}
          value={idea.texto}
          onChange={(e) => set("texto", e.target.value)}
          placeholder="Escribe lo que quieras. Medidas, materiales que te gustan, dónde lo has visto, por qué te convence…"
        />
      </div>

      <div className="blq">
        <div className="tit">Cuando deje de ser una idea</div>
        {datos.categorias.length === 0 ? (
          <div className="ayuda" style={{ marginTop: 0 }}>
            Crea antes alguna categoría en el presupuesto y podrás convertir esta idea en un elemento con sus
            materiales.
          </div>
        ) : convertir ? (
          <>
            <label className="lab" htmlFor="idea-cat">
              En qué categoría
            </label>
            <select
              id="idea-cat"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              style={{ marginBottom: 12 }}
            >
              {datos.categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <div className="fila">
              <button className="btn pri" onClick={() => onConvertir(cat)}>
                Convertir
              </button>
              <button className="btn sec" onClick={() => setConvertir(false)}>
                Cancelar
              </button>
            </div>
            <div className="ayuda">
              La nota pasa a ser un elemento del presupuesto y desaparece de aquí. El texto se guarda en sus
              notas.
            </div>
          </>
        ) : (
          <button className="btn sec" onClick={() => setConvertir(true)}>
            Pasar al presupuesto
          </button>
        )}
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
            Borrar idea
          </button>
        )}
      </div>
    </>
  );
}
