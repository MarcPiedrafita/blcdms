import React, { useRef, useState } from "react";
import { VACIO, eur, totales, objetivo, ahorrado } from "./lib.js";

export default function Copia({ datos, onGuardar }) {
  const input = useRef(null);
  const [msg, setMsg] = useState(null);

  const t = totales(datos);
  const obj = objetivo(datos);

  const exportar = () => {
    const cuando = new Date();
    const paquete = { ...datos, ultimaCopia: cuando.toISOString() };
    const blob = new Blob([JSON.stringify(paquete, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `la-obra-${cuando.toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    onGuardar(paquete);
    setMsg("Copia descargada. Guárdala donde no la pierdas.");
  };

  const importar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const d = JSON.parse(lector.result);
        if (!d || typeof d !== "object" || !Array.isArray(d.elementos)) throw new Error("formato");
        if (!confirm("Vas a sustituir todo lo que tienes ahora. ¿Seguro?")) return;
        onGuardar({
          ...VACIO,
          ...d,
          dinero: { ...VACIO.dinero, ...(d.dinero || {}) },
        });
        setMsg("Restaurado.");
      } catch (err) {
        setMsg("Ese fichero no vale. Tiene que ser un .json exportado desde aquí.");
      }
    };
    lector.readAsText(f);
    e.target.value = "";
  };

  const dias = datos.ultimaCopia
    ? Math.floor((Date.now() - new Date(datos.ultimaCopia).getTime()) / 86400000)
    : null;

  return (
    <>
      <header className="cab">
        <div className="marca">
          La <em>copia</em>
        </div>
        <div className="sub">
          {datos.elementos.length} elementos · {datos.maquinas.length} máquinas · {datos.ideas.length} ideas
        </div>
      </header>

      <div className="desg">
        <span className="n">Ahorrado</span>
        <span className="c">{eur(ahorrado(datos))}</span>
      </div>
      <div className="desg">
        <span className="n">Objetivo</span>
        <span className="c">{eur(obj.valor)}</span>
      </div>
      <div className="desg">
        <span className="n">Obra imprescindible</span>
        <span className="c">{eur(t.imprescindible)}</span>
      </div>
      <div className="desg">
        <span className="n">Extras</span>
        <span className="c">{eur(t.extra)}</span>
      </div>

      <div className="blq">
        <div className="aviso">
          Todo esto vive en el navegador de este móvil. Si borras los datos de navegación, cambias de teléfono
          o usas el modo incógnito, desaparece. En iPhone, además, se borra solo si no abres la app en siete
          días.
        </div>
      </div>

      <div className="blq">
        <div className="tit">Última copia</div>
        <div style={{ fontSize: 14, marginBottom: 16 }}>
          {dias === null ? (
            <span style={{ color: "var(--rojo)", fontWeight: 700 }}>Nunca has hecho una copia.</span>
          ) : dias === 0 ? (
            "Hoy."
          ) : (
            <span style={{ color: dias > 30 ? "var(--rojo)" : "inherit", fontWeight: dias > 30 ? 700 : 400 }}>
              Hace {dias} {dias === 1 ? "día" : "días"}.
            </span>
          )}
        </div>
        <button className="btn" onClick={exportar}>
          Exportar copia
        </button>
      </div>

      <div className="blq">
        <div className="tit">Restaurar</div>
        <button className="btn sec" onClick={() => input.current?.click()}>
          Cargar un fichero
        </button>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          onChange={importar}
          style={{ display: "none" }}
        />
        <div style={{ fontSize: 12, color: "var(--piedra)", marginTop: 10, lineHeight: 1.5 }}>
          Sustituye todo lo que tengas ahora. No mezcla.
        </div>
      </div>

      {msg && (
        <div className="blq">
          <div style={{ fontSize: 13, color: "var(--musgo)", fontWeight: 600 }}>{msg}</div>
        </div>
      )}
    </>
  );
}
