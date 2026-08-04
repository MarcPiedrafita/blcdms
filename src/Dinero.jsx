import React, { useState } from "react";
import { eur, hoy, uid, num, objetivo, ahorrado, prevision, totales } from "./lib.js";

export default function Dinero({ datos, onGuardar, onQuitar }) {
  const [importe, setImporte] = useState("");
  const [fecha, setFecha] = useState(hoy());
  const [abrirDesglose, setAbrirDesglose] = useState(false);

  const d = datos.dinero;
  const set = (k, v) => onGuardar({ ...datos, dinero: { ...d, [k]: v } });

  const t = totales(datos);
  const obj = objetivo(datos);
  const tengo = ahorrado(datos);
  const falta = Math.max(0, obj.valor - tengo);
  const pct = obj.valor > 0 ? Math.min(100, (tengo / obj.valor) * 100) : 0;
  const prev = prevision(datos);

  const aps = [...(d.aportaciones || [])].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const anadir = () => {
    if (!importe) return;
    set("aportaciones", [{ id: uid(), fecha, importe: Number(importe) }, ...(d.aportaciones || [])]);
    setImporte("");
    setFecha(hoy());
  };

  const quitarAp = (a) =>
    onQuitar(`Aportación de ${eur(a.importe)} borrada`, {
      ...datos,
      dinero: { ...d, aportaciones: (d.aportaciones || []).filter((x) => x.id !== a.id) },
    });

  return (
    <>
      <header className="cab">
        <div className="marca">
          <em>El</em>dinero
        </div>
        <div className="sub">{pct.toFixed(0)}% del objetivo</div>
      </header>

      <div className="dato">{eur(tengo)}</div>
      <div className="pie-dato">
        de {eur(obj.valor)} · faltan {eur(falta)}
      </div>
      <div className="barra">
        <i style={{ width: `${pct}%` }} />
      </div>
      <div className="marcador">
        <span>0</span>
        <span>{eur(obj.valor)}</span>
      </div>

      {prev && (
        <div className="aviso" style={{ marginTop: 16 }}>
          <b>{prev.texto}</b>
          <br />
          Ahorras {eur(prev.ritmo)} al mes. A este paso llegas en {prev.cuando}.
        </div>
      )}

      {/* ---- objetivo ---- */}
      <div className="blq">
        <div className="tit">De dónde sale el objetivo</div>

        <div className="desg">
          <span className="n">Precio de la casa</span>
          <span className="c">{eur(obj.casa)}</span>
        </div>
        <div className="desg">
          <span className="n">Impuestos y gastos ({d.impuestosPct || 0}%)</span>
          <span className="c">{eur(obj.impuestos)}</span>
        </div>
        <div className="desg">
          <span className="n">Imprescindibles para entrar a vivir</span>
          <span className="c">{eur(obj.obra)}</span>
        </div>
        <div className="desg">
          <span className="n">Colchón para imprevistos ({d.colchonPct || 0}%)</span>
          <span className="c">{eur(obj.colchon)}</span>
        </div>
        <div className="desg suma">
          <span className="n">{obj.esManual ? "Calculado" : "Objetivo"}</span>
          <span className="c">{eur(obj.calculado)}</span>
        </div>

        {obj.esManual && (
          <div className="desg suma" style={{ borderTop: "none", marginTop: 6, paddingTop: 0 }}>
            <span className="n">Objetivo forzado a mano</span>
            <span className="c">{eur(obj.valor)}</span>
          </div>
        )}

        <button
          className="link"
          style={{ marginTop: 16, display: "inline-block" }}
          onClick={() => setAbrirDesglose(!abrirDesglose)}
        >
          {abrirDesglose ? "Cerrar ajustes" : "Ajustar cifras"}
        </button>

        {abrirDesglose && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <label className="lab" htmlFor="precio-casa">
                Precio de la casa €
              </label>
              <input
                id="precio-casa"
                inputMode="numeric"
                value={d.precioCasa ?? ""}
                onChange={(e) => set("precioCasa", num(e.target.value))}
                placeholder="55000"
              />
            </div>
            <div className="fila" style={{ marginBottom: 12 }}>
              <div>
                <label className="lab" htmlFor="impuestos">
                  Impuestos %
                </label>
                <input
                  id="impuestos"
                  inputMode="decimal"
                  value={d.impuestosPct ?? ""}
                  onChange={(e) => set("impuestosPct", num(e.target.value))}
                />
              </div>
              <div>
                <label className="lab" htmlFor="colchon">
                  Colchón %
                </label>
                <input
                  id="colchon"
                  inputMode="decimal"
                  value={d.colchonPct ?? ""}
                  onChange={(e) => set("colchonPct", num(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="lab" htmlFor="objetivo-manual">
                Objetivo a mano € (vacío = calculado)
              </label>
              <input
                id="objetivo-manual"
                inputMode="numeric"
                value={d.objetivoManual ?? ""}
                onChange={(e) => set("objetivoManual", num(e.target.value))}
                placeholder={String(Math.round(obj.calculado))}
              />
            </div>
          </div>
        )}
      </div>

      {/* ---- la obra ---- */}
      <div className="blq">
        <div className="tit">La obra</div>
        <div className="duo">
          <div className="imp">
            <div className="k">Imprescindible</div>
            <div className="v">{eur(t.imprescindible)}</div>
          </div>
          <div className="ext">
            <div className="k">Extras</div>
            <div className="v">{eur(t.extra)}</div>
          </div>
        </div>
        <div className="ayuda">
          Solo los imprescindibles cuentan para el objetivo. Los extras van aparte porque pueden esperar.
        </div>
      </div>

      {/* ---- aportaciones ---- */}
      <div className="blq">
        <div className="tit">Aportaciones</div>
        <div style={{ marginBottom: 18 }}>
          <label className="lab" htmlFor="base">
            Lo que ya tenía antes de empezar a registrar
          </label>
          <input
            id="base"
            inputMode="numeric"
            value={d.base ?? ""}
            onChange={(e) => set("base", Number(e.target.value) || 0)}
          />
        </div>
        <div className="fila" style={{ marginBottom: 12 }}>
          <div>
            <label className="lab" htmlFor="importe">
              Importe €
            </label>
            <input
              id="importe"
              inputMode="numeric"
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              placeholder="400"
              onKeyDown={(e) => e.key === "Enter" && anadir()}
            />
          </div>
          <div>
            <label className="lab" htmlFor="fecha-ap">
              Fecha
            </label>
            <input id="fecha-ap" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
        <button className="btn pri" onClick={anadir}>
          Sumar
        </button>

        <div style={{ marginTop: 20 }}>
          {aps.length === 0 ? (
            <div className="ayuda" style={{ marginTop: 0 }}>
              Todavía no has registrado nada.
            </div>
          ) : (
            aps.map((a) => (
              <div className="fila-ap" key={a.id}>
                <span className="cuando">
                  {new Date(a.fecha).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </span>
                <span className="cuanto">{eur(a.importe)}</span>
                <button
                  className="equis"
                  aria-label={`Borrar la aportación de ${eur(a.importe)}`}
                  onClick={() => quitarAp(a)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
