import React, { useState } from "react";
import { eur, hoy, uid, num, objetivo, ahorrado, ritmoMensual, totales } from "./lib.js";

export default function Dinero({ datos, onGuardar }) {
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
  const ritmo = ritmoMensual(datos);

  const aps = [...(d.aportaciones || [])].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const anadir = () => {
    if (!importe) return;
    set("aportaciones", [{ id: uid(), fecha, importe: Number(importe) }, ...(d.aportaciones || [])]);
    setImporte("");
    setFecha(hoy());
  };

  return (
    <>
      <header className="cab">
        <div className="marca">
          El <em>dinero</em>
        </div>
        <div className="sub">{pct.toFixed(0)}% del objetivo</div>
      </header>

      <div className="dato">{eur(tengo)}</div>
      <div style={{ fontSize: 12.5, color: "var(--piedra)", margin: "5px 0 13px" }}>
        de {eur(obj.valor)} · faltan {eur(falta)}
      </div>
      <div className="barra">
        <div style={{ width: `${pct}%` }} />
      </div>

      {ritmo && falta > 0 && (
        <div style={{ fontSize: 12.5, color: "var(--musgo)", marginTop: 13, fontWeight: 600, lineHeight: 1.5 }}>
          Ritmo de {eur(ritmo)}/mes. A este paso llegas en {Math.ceil(falta / Math.max(1, ritmo))} meses.
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
          <div
            className="desg suma"
            style={{ borderTop: "none", marginTop: 6, paddingTop: 0, color: "var(--barro)" }}
          >
            <span className="n" style={{ color: "var(--barro)" }}>
              Objetivo forzado a mano
            </span>
            <span className="c">{eur(obj.valor)}</span>
          </div>
        )}

        <button
          className="link"
          style={{ marginTop: 14, display: "inline-block" }}
          onClick={() => setAbrirDesglose(!abrirDesglose)}
        >
          {abrirDesglose ? "Cerrar ajustes" : "Ajustar cifras"}
        </button>

        {abrirDesglose && (
          <div style={{ marginTop: 14 }}>
            <div style={{ marginBottom: 11 }}>
              <label className="lab">Precio de la casa €</label>
              <input
                inputMode="numeric"
                value={d.precioCasa ?? ""}
                onChange={(e) => set("precioCasa", num(e.target.value))}
                placeholder="55000"
              />
            </div>
            <div className="fila" style={{ marginBottom: 11 }}>
              <div>
                <label className="lab">Impuestos %</label>
                <input
                  inputMode="decimal"
                  value={d.impuestosPct ?? ""}
                  onChange={(e) => set("impuestosPct", num(e.target.value))}
                />
              </div>
              <div>
                <label className="lab">Colchón %</label>
                <input
                  inputMode="decimal"
                  value={d.colchonPct ?? ""}
                  onChange={(e) => set("colchonPct", num(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="lab">Objetivo a mano € (vacío = calculado)</label>
              <input
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
        <div style={{ fontSize: 12, color: "var(--piedra)", marginTop: 10, lineHeight: 1.5 }}>
          Solo los imprescindibles cuentan para el objetivo. Los extras van aparte porque pueden esperar.
        </div>
      </div>

      {/* ---- aportaciones ---- */}
      <div className="blq">
        <div className="tit">Aportaciones</div>
        <div style={{ marginBottom: 16 }}>
          <label className="lab">Lo que ya tenía antes de empezar a registrar</label>
          <input
            inputMode="numeric"
            value={d.base ?? ""}
            onChange={(e) => set("base", Number(e.target.value) || 0)}
          />
        </div>
        <div className="fila" style={{ marginBottom: 11 }}>
          <div>
            <label className="lab">Importe €</label>
            <input
              inputMode="numeric"
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              placeholder="400"
            />
          </div>
          <div>
            <label className="lab">Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>
        <button className="btn" onClick={anadir}>
          Sumar
        </button>

        <div style={{ marginTop: 18 }}>
          {aps.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--piedra)" }}>Todavía no has registrado nada.</div>
          ) : (
            aps.map((a) => (
              <div className="fila-ap" key={a.id}>
                <span style={{ color: "var(--piedra)", fontSize: 12.5, width: 84 }}>
                  {new Date(a.fecha).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </span>
                <span style={{ flex: 1, fontWeight: 700 }}>{eur(a.importe)}</span>
                <button
                  className="equis"
                  onClick={() =>
                    set(
                      "aportaciones",
                      (d.aportaciones || []).filter((x) => x.id !== a.id)
                    )
                  }
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
