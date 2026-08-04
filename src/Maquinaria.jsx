import React, { useState } from "react";
import { eur, num, nuevaMaquina, costeMaquina, totales } from "./lib.js";

export default function Maquinaria({ datos, onGuardar, onQuitar, abierto, setAbierto }) {
  const maquina = datos.maquinas.find((m) => m.id === abierto);

  /* No hay botón de guardar porque cada cambio se guarda solo. Lo que faltaba
     era poder encadenar: terminas una y sigues con la siguiente sin volver. */
  const otra = () => {
    const m = nuevaMaquina("");
    onGuardar({ ...datos, maquinas: [...datos.maquinas, m] });
    setAbierto(m.id);
  };

  if (maquina) {
    return (
      <Ficha
        key={maquina.id}
        maquina={maquina}
        onCambio={(n) =>
          onGuardar({ ...datos, maquinas: datos.maquinas.map((m) => (m.id === n.id ? n : m)) })
        }
        onBorrar={() => {
          onQuitar(`«${maquina.nombre || "Máquina sin nombre"}» borrada`, {
            ...datos,
            maquinas: datos.maquinas.filter((m) => m.id !== maquina.id),
          });
          setAbierto(null);
        }}
        onOtra={otra}
        onVolver={() => setAbierto(null)}
      />
    );
  }
  return <Lista datos={datos} onGuardar={onGuardar} setAbierto={setAbierto} />;
}

function Lista({ datos, onGuardar, setAbierto }) {
  const [nombre, setNombre] = useState("");
  const [form, setForm] = useState(false);
  const [filtro, setFiltro] = useState("todo");
  const t = totales(datos);

  const crear = () => {
    if (!nombre.trim()) return;
    const m = nuevaMaquina(nombre.trim());
    onGuardar({ ...datos, maquinas: [...datos.maquinas, m] });
    setNombre("");
    setForm(false);
    setAbierto(m.id);
  };

  const lista = datos.maquinas.filter((m) => filtro === "todo" || m.fase === filtro);

  return (
    <>
      <header className="cab">
        <div className="marca">
          <em>La</em>Maquinaria
        </div>
        <div className="sub">
          {datos.maquinas.length} {datos.maquinas.length === 1 ? "máquina" : "máquinas"}
        </div>
      </header>

      <div className="duo" style={{ marginBottom: 18 }}>
        <div className="imp">
          <div className="k">Imprescindible</div>
          <div className="v">{eur(t.maquinaria.imprescindible)}</div>
        </div>
        <div className="ext">
          <div className="k">Extras</div>
          <div className="v">{eur(t.maquinaria.extra)}</div>
        </div>
      </div>

      <div className="seg" style={{ marginBottom: 24 }}>
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

      {lista.length === 0 ? (
        <div className="vacio">
          <b>Sin máquinas</b>
          Hormigonera, martillo eléctrico, andamio, cortadora… Pon los días que la necesitas y los dos
          precios, y te digo si sale mejor alquilar o comprar.
        </div>
      ) : (
        lista.map((m) => {
          const c = costeMaquina(m);
          return (
            <button key={m.id} className="item" onClick={() => setAbierto(m.id)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="nom">{m.nombre || "Sin nombre"}</div>
                <div className="det">
                  {c.elegido === "alquilar"
                    ? `Alquilar · ${m.dias || 0} días × ${eur(m.precioDia || 0)}`
                    : c.elegido === "comprar"
                    ? "Comprar"
                    : "Sin precios"}
                  {m.decision !== "auto" ? " · decidido por ti" : ""}
                </div>
                <div style={{ marginTop: 7 }}>
                  <span className={`chip ${m.fase}`}>{m.fase}</span>
                </div>
              </div>
              <div className="imp">{eur(c.coste)}</div>
            </button>
          );
        })
      )}

      <div className="blq">
        {form ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Hormigonera"
              onKeyDown={(e) => e.key === "Enter" && crear()}
            />
            <button className="btn mini" style={{ flex: "none" }} onClick={crear}>
              Ok
            </button>
          </div>
        ) : (
          <button className="btn pri" onClick={() => setForm(true)}>
            + Añadir máquina
          </button>
        )}
      </div>
    </>
  );
}

function Ficha({ maquina, onCambio, onBorrar, onOtra, onVolver }) {
  const [conf, setConf] = useState(false);
  const set = (k, v) => onCambio({ ...maquina, [k]: v });
  const c = costeMaquina(maquina);
  const hayComparativa = c.alquiler != null && c.compra != null;
  const diferencia = hayComparativa ? Math.abs(c.alquiler - c.compra) : 0;
  const umbral =
    hayComparativa && maquina.precioDia > 0 ? Math.ceil(maquina.precioCompra / maquina.precioDia) : null;

  return (
    <>
      <header className="cab" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="volver" aria-label="Volver a la lista" onClick={onVolver}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="marca" style={{ fontSize: 24 }}>
            {maquina.nombre || "Máquina nueva"}
          </div>
          <div className="sub">{eur(c.coste)}</div>
        </div>
      </header>

      <div style={{ marginBottom: 13 }}>
        <label className="lab" htmlFor="maq-nombre">
          Nombre
        </label>
        <input
          id="maq-nombre"
          autoFocus={!maquina.nombre}
          value={maquina.nombre}
          onChange={(e) => set("nombre", e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 13 }}>
        <span className="lab">Fase</span>
        <div className="seg">
          {["imprescindible", "extra"].map((f) => (
            <button key={f} className={maquina.fase === f ? "on" : ""} onClick={() => set("fase", f)}>
              {f === "imprescindible" ? "Para entrar a vivir" : "Puede esperar"}
            </button>
          ))}
        </div>
      </div>

      <div className="blq">
        <div className="tit">Alquilar</div>
        <div className="fila">
          <div>
            <label className="lab" htmlFor="maq-dias">
              Días que la necesito
            </label>
            <input
              id="maq-dias"
              inputMode="decimal"
              value={maquina.dias ?? ""}
              onChange={(e) => set("dias", num(e.target.value))}
              placeholder="3"
            />
          </div>
          <div>
            <label className="lab" htmlFor="maq-precio-dia">
              Precio por día €
            </label>
            <input
              id="maq-precio-dia"
              inputMode="decimal"
              value={maquina.precioDia ?? ""}
              onChange={(e) => set("precioDia", num(e.target.value))}
              placeholder="35"
            />
          </div>
        </div>
        {c.alquiler != null && (
          <div className="desg suma" style={{ marginTop: 14 }}>
            <span className="n">Sale por</span>
            <span className="c">{eur(c.alquiler)}</span>
          </div>
        )}
      </div>

      <div className="blq">
        <div className="tit">Comprar</div>
        <label className="lab" htmlFor="maq-compra">
          Precio de compra €
        </label>
        <input
          id="maq-compra"
          inputMode="decimal"
          value={maquina.precioCompra ?? ""}
          onChange={(e) => set("precioCompra", num(e.target.value))}
          placeholder="220"
        />
      </div>

      <div className="blq">
        <div className="tit">Veredicto</div>
        {!hayComparativa ? (
          <div className="ayuda" style={{ marginTop: 0 }}>
            Necesito los días, el precio por día y el precio de compra para compararlos.
          </div>
        ) : (
          <div className="aviso">
            <b>{c.alquiler <= c.compra ? "Sale mejor alquilar" : "Sale mejor comprar"}</b>
            <br />
            Alquilar {eur(c.alquiler)} · comprar {eur(c.compra)}. Diferencia de {eur(diferencia)}.
            {umbral != null &&
              (c.alquiler > c.compra
                ? ` Comprándola te sale a cuenta a partir de ${umbral} días de uso.`
                : ` Si al final la necesitas más de ${umbral} días, compensa comprarla.`)}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <span className="lab">Qué cuento en el presupuesto</span>
          <div className="seg">
            {[
              ["auto", "Lo más barato"],
              ["alquilar", "Alquilar"],
              ["comprar", "Comprar"],
            ].map(([k, l]) => (
              <button
                key={k}
                className={maquina.decision === k ? "on" : ""}
                onClick={() => set("decision", k)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="blq">
        <div className="tit">Notas</div>
        <textarea
          rows={3}
          value={maquina.notas}
          onChange={(e) => set("notas", e.target.value)}
          placeholder="Dónde alquilarla, modelo, si te la deja alguien…"
          aria-label="Notas de la máquina"
        />
      </div>

      <div className="blq">
        <button className="btn pri" onClick={onOtra}>
          + Añadir otra máquina
        </button>
        <div className="ayuda">Esta se guarda sola. No hace falta guardar nada.</div>
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
            Borrar máquina
          </button>
        )}
      </div>
    </>
  );
}
