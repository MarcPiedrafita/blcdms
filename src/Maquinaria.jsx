import React, { useState } from "react";
import { eur, num, nuevaMaquina, costeMaquina, totales } from "./lib.js";

export default function Maquinaria({ datos, onGuardar, abierto, setAbierto }) {
  const maquina = datos.maquinas.find((m) => m.id === abierto);
  if (maquina) {
    return (
      <Ficha
        maquina={maquina}
        onCambio={(n) =>
          onGuardar({ ...datos, maquinas: datos.maquinas.map((m) => (m.id === n.id ? n : m)) })
        }
        onBorrar={() => {
          onGuardar({ ...datos, maquinas: datos.maquinas.filter((m) => m.id !== maquina.id) });
          setAbierto(null);
        }}
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
          La <em>maquinaria</em>
        </div>
        <div className="sub">{datos.maquinas.length} máquinas</div>
      </header>

      <div className="duo" style={{ marginBottom: 16 }}>
        <div className="imp">
          <div className="k">Imprescindible</div>
          <div className="v">{eur(t.maquinaria.imprescindible)}</div>
        </div>
        <div className="ext">
          <div className="k">Extras</div>
          <div className="v">{eur(t.maquinaria.extra)}</div>
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
                <div className="nom">{m.nombre}</div>
                <div className="det">
                  {c.elegido === "alquilar"
                    ? `Alquilar · ${m.dias || 0} días × ${eur(m.precioDia || 0)}`
                    : c.elegido === "comprar"
                    ? "Comprar"
                    : "Sin precios"}
                  {m.decision !== "auto" ? " · decidido por ti" : ""}
                </div>
                <div style={{ marginTop: 6 }}>
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
          <button className="btn" onClick={() => setForm(true)}>
            + Añadir máquina
          </button>
        )}
      </div>
    </>
  );
}

function Ficha({ maquina, onCambio, onBorrar, onVolver }) {
  const [conf, setConf] = useState(false);
  const set = (k, v) => onCambio({ ...maquina, [k]: v });
  const c = costeMaquina(maquina);
  const hayComparativa = c.alquiler != null && c.compra != null;
  const diferencia = hayComparativa ? Math.abs(c.alquiler - c.compra) : 0;

  return (
    <>
      <header className="cab" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="volver" onClick={onVolver}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="marca" style={{ fontSize: 21 }}>
            {maquina.nombre}
          </div>
          <div className="sub">{eur(c.coste)}</div>
        </div>
      </header>

      <div style={{ marginBottom: 12 }}>
        <label className="lab">Nombre</label>
        <input value={maquina.nombre} onChange={(e) => set("nombre", e.target.value)} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label className="lab">Fase</label>
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
            <label className="lab">Días que la necesito</label>
            <input
              inputMode="decimal"
              value={maquina.dias ?? ""}
              onChange={(e) => set("dias", num(e.target.value))}
              placeholder="3"
            />
          </div>
          <div>
            <label className="lab">Precio por día €</label>
            <input
              inputMode="decimal"
              value={maquina.precioDia ?? ""}
              onChange={(e) => set("precioDia", num(e.target.value))}
              placeholder="35"
            />
          </div>
        </div>
        {c.alquiler != null && (
          <div style={{ marginTop: 10, fontWeight: 700, fontSize: 15 }}>{eur(c.alquiler)}</div>
        )}
      </div>

      <div className="blq">
        <div className="tit">Comprar</div>
        <label className="lab">Precio de compra €</label>
        <input
          inputMode="decimal"
          value={maquina.precioCompra ?? ""}
          onChange={(e) => set("precioCompra", num(e.target.value))}
          placeholder="220"
        />
      </div>

      <div className="blq">
        <div className="tit">Veredicto</div>
        {!hayComparativa ? (
          <div style={{ fontSize: 13, color: "var(--piedra)", lineHeight: 1.55 }}>
            Necesito los días, el precio por día y el precio de compra para compararlos.
          </div>
        ) : (
          <div className="aviso" style={{ borderLeftColor: "var(--musgo)" }}>
            <b style={{ color: "var(--tinta)" }}>
              {c.alquiler <= c.compra ? "Sale mejor alquilar" : "Sale mejor comprar"}
            </b>
            <br />
            Alquilar {eur(c.alquiler)} · comprar {eur(c.compra)}. Diferencia de {eur(diferencia)}.
            {c.alquiler > c.compra && maquina.precioDia > 0 && (
              <>
                {" "}
                Comprándola te sale a cuenta a partir de{" "}
                {Math.ceil(maquina.precioCompra / maquina.precioDia)} días de uso.
              </>
            )}
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <label className="lab">Qué cuento en el presupuesto</label>
          <div className="seg">
            {[
              ["auto", "Lo más barato"],
              ["alquilar", "Alquilar"],
              ["comprar", "Comprar"],
            ].map(([k, l]) => (
              <button key={k} className={maquina.decision === k ? "on" : ""} onClick={() => set("decision", k)}>
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
            Borrar máquina
          </button>
        )}
      </div>
    </>
  );
}
