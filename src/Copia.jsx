import React, { useRef, useState } from "react";
import { VACIO, eur, totales, objetivo, ahorrado, ratios } from "./lib.js";
import Sincronizacion from "./Sincronizacion.jsx";
import { hayNube } from "./nube.js";

/* Los ratios en texto separado por tabuladores: pegado en una hoja de cálculo
   cae en columnas solo, sin tener que trocear nada a mano.
 *
 *  Los números van en crudo y con punto decimal, no formateados en euros: una
 *  hoja de cálculo con «1.234,56 €» dentro no suma. Formatear es cosa de la
 *  hoja; lo que tiene que llegar es el número. */
const CABECERA = [
  "Plantilla",
  "m2 referencia",
  "EUR/m2 esencial",
  "Fijo esencial",
  "EUR/m2 con extras",
  "Fijo con extras",
];

const aTsv = (plantillas) =>
  [
    CABECERA.join("\t"),
    ...plantillas.map((p) => {
      const r = ratios(p);
      return [
        p.nombre || "Sin nombre",
        r.metros,
        r.esencial.ratio.toFixed(2),
        r.esencial.fijo.toFixed(2),
        r.conExtras.ratio.toFixed(2),
        r.conExtras.fijo.toFixed(2),
      ].join("\t");
    }),
  ].join("\n");

function Ratios({ plantillas }) {
  const [copiado, setCopiado] = useState(false);
  const [fallo, setFallo] = useState(false);
  const area = useRef(null);
  const tsv = aTsv(plantillas);

  const copiar = async () => {
    setFallo(false);
    try {
      await navigator.clipboard.writeText(tsv);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 4000);
    } catch (e) {
      /* Sin permiso de portapapeles —pasa en Safari fuera de un gesto, y en
         páginas sin https— se enseña el texto para copiarlo a mano. */
      setFallo(true);
      setTimeout(() => area.current?.select(), 0);
    }
  };

  return (
    <div className="blq">
      <div className="tit">Ratios para la hoja de casas</div>
      <p className="parrafo">
        El €/m² de cada plantilla y su coste fijo, en columnas. Se pega directamente en una hoja de cálculo
        para comparar casas.
      </p>

      <button className="btn sec" onClick={copiar}>
        {copiado ? "Copiado" : "Copiar los ratios"}
      </button>

      {fallo && (
        <>
          <div className="ayuda" style={{ color: "var(--ambar)" }}>
            El navegador no me ha dejado copiar. Aquí lo tienes para copiarlo a mano:
          </div>
          <textarea
            ref={area}
            readOnly
            rows={plantillas.length + 2}
            value={tsv}
            aria-label="Ratios para copiar"
            style={{ fontFamily: "var(--mono)", fontSize: 11 }}
          />
        </>
      )}

      <div className="ayuda">
        El fijo va aparte a propósito: no depende de los metros, así que en la hoja se suma entero a cada
        casa en vez de multiplicarse.
      </div>
    </div>
  );
}

export default function Copia({ datos, onGuardar, nube }) {
  const input = useRef(null);
  const [msg, setMsg] = useState(null);
  const [pendiente, setPendiente] = useState(null);

  const t = totales(datos);
  const obj = objetivo(datos);

  const exportar = async () => {
    const cuando = new Date();
    const paquete = { ...datos, ultimaCopia: cuando.toISOString() };
    const nombre = `la-obra-${cuando.toISOString().slice(0, 10)}.json`;
    const fichero = new File([JSON.stringify(paquete, null, 2)], nombre, {
      type: "application/json",
    });

    // En el iPhone la descarga clásica se pierde dentro de la app instalada.
    // Compartir deja guardarla en Archivos o mandársela a quien sea.
    if (navigator.canShare?.({ files: [fichero] })) {
      try {
        await navigator.share({ files: [fichero], title: "La obra" });
        onGuardar(paquete);
        setMsg("Copia guardada. Ponla donde no la pierdas.");
        return;
      } catch (err) {
        if (err?.name === "AbortError") return; // lo ha cancelado
        // cualquier otro fallo: seguimos con la descarga de toda la vida
      }
    }

    const url = URL.createObjectURL(fichero);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Liberar la URL en la misma instrucción que el click cancela la descarga
    // en Safari. Se suelta más tarde, cuando ya se ha escrito el fichero.
    setTimeout(() => URL.revokeObjectURL(url), 60000);

    onGuardar(paquete);
    setMsg("Copia descargada. Ponla donde no la pierdas.");
  };

  const elegir = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const d = JSON.parse(lector.result);
        if (!d || typeof d !== "object" || !Array.isArray(d.elementos)) throw new Error("formato");
        setMsg(null);
        setPendiente({ d, nombre: f.name });
      } catch (err) {
        setPendiente(null);
        setMsg("Ese fichero no vale. Tiene que ser un .json exportado desde aquí.");
      }
    };
    lector.onerror = () => {
      setPendiente(null);
      setMsg("No he podido leer ese fichero.");
    };
    lector.readAsText(f);
  };

  const restaurar = () => {
    const d = pendiente.d;
    onGuardar({ ...VACIO, ...d, dinero: { ...VACIO.dinero, ...(d.dinero || {}) } });
    setPendiente(null);
    setMsg("Restaurado.");
  };

  const dias = datos.ultimaCopia
    ? Math.floor((Date.now() - new Date(datos.ultimaCopia).getTime()) / 86400000)
    : null;

  return (
    <>
      <header className="cab">
        <div className="marca">
          <em>La</em>Copia
        </div>
        <div className="sub">
          {datos.elementos.length} elementos · {datos.maquinas.length} máquinas · {datos.ideas.length} ideas
        </div>
      </header>

      <div className="tit">Qué es esto</div>
      {hayNube() ? (
        <p className="parrafo">
          Esta app guarda todo <b>dentro de este aparato</b>, y si entras con tu correo ahí abajo, además
          lo lleva a los demás. Aun así conviene la copia: es un fichero tuyo, que no depende de ninguna
          cuenta ni de que el servidor siga ahí dentro de cinco años.
        </p>
      ) : (
        <p className="parrafo">
          Esta app guarda todo <b>dentro de este móvil</b>. No hay cuenta, ni servidor, ni nada tuyo en
          internet. Nadie más lo ve, pero tampoco hay nada en la nube que te salve si le pasa algo al
          teléfono.
        </p>
      )}
      <p className="parrafo">
        Una <b>copia</b> es un fichero con todos tus datos dentro. Le das a exportar, se descarga, y lo
        guardas donde quieras: Archivos, Drive, o un correo a ti mismo. Si cambias de móvil o borras la app
        sin querer, cargas ese fichero en «Restaurar» y vuelve todo: aportaciones, presupuesto, máquinas e
        ideas.
      </p>
      <p className="parrafo">Hazla de vez en cuando. Es lo único que hay entre tus datos y perderlos.</p>

      {nube && <Sincronizacion nube={nube} />}

      <div className="blq">
        <div className="aviso">
          <b>Cuándo se pierde lo de este aparato</b>
          <br />
          Si borras los datos de navegación, cambias de teléfono o lo abres en modo incógnito. En iPhone,
          además, se borra solo si no abres la app en siete días.
          {hayNube() && " Con la sincronización puesta lo recuperas entrando otra vez con tu correo."}
        </div>
      </div>

      <div className="blq">
        <div className="tit">Lo que hay ahora mismo</div>
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
      </div>

      <div className="blq">
        <div className="tit">Última copia</div>
        <div style={{ fontSize: 14.5, marginBottom: 18, fontWeight: 500 }}>
          {dias === null ? (
            <span style={{ color: "var(--rojo)", fontWeight: 700 }}>Nunca has hecho una copia.</span>
          ) : dias === 0 ? (
            "Hoy."
          ) : (
            <span style={{ color: dias > 30 ? "var(--rojo)" : "inherit", fontWeight: dias > 30 ? 700 : 500 }}>
              Hace {dias} {dias === 1 ? "día" : "días"}.
            </span>
          )}
        </div>
        <button className="btn pri" onClick={exportar}>
          Exportar copia
        </button>
      </div>

      {datos.plantillas.length > 0 && <Ratios plantillas={datos.plantillas} />}

      <div className="blq">
        <div className="tit">Restaurar</div>

        {pendiente ? (
          <div className="aviso">
            <b>Vas a sustituir todo</b>
            <br />
            <span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{pendiente.nombre}</span> trae{" "}
            {(pendiente.d.elementos || []).length} elementos, {(pendiente.d.maquinas || []).length} máquinas y{" "}
            {(pendiente.d.ideas || []).length} ideas. Lo que tienes ahora se pierde: no se mezcla.
            <div className="fila" style={{ marginTop: 14 }}>
              <button className="btn peli mini" style={{ width: "100%" }} onClick={restaurar}>
                Sí, restaurar
              </button>
              <button className="btn sec mini" style={{ width: "100%" }} onClick={() => setPendiente(null)}>
                No
              </button>
            </div>
          </div>
        ) : (
          <>
            <button className="btn sec" onClick={() => input.current?.click()}>
              Cargar un fichero
            </button>
            <div className="ayuda">Sustituye todo lo que tengas ahora. No mezcla.</div>
          </>
        )}

        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          onChange={elegir}
          style={{ display: "none" }}
        />
      </div>

      {msg && (
        <div className="blq">
          <div style={{ fontSize: 13.5, color: "var(--suave)", fontWeight: 500, lineHeight: 1.5 }}>{msg}</div>
        </div>
      )}
    </>
  );
}
