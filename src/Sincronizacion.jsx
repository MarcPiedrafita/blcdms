import React, { useState } from "react";
import { hayNube, enviarEnlace, salir } from "./nube.js";

const CUANDO = { dateStyle: "short", timeStyle: "short" };
const fecha = (iso) => (iso ? new Date(iso).toLocaleString("es-ES", CUANDO) : "nunca");

export default function Sincronizacion({ nube }) {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [fallo, setFallo] = useState(null);
  const [mandando, setMandando] = useState(false);

  // Sin credenciales configuradas no hay nada que enseñar: la app es local y ya.
  if (!hayNube()) return null;

  const mandar = async (e) => {
    e.preventDefault();
    if (!correo.trim()) return;
    setMandando(true);
    setFallo(null);
    try {
      await enviarEnlace(correo.trim());
      setEnviado(true);
    } catch (err) {
      setFallo(err?.message || "No he podido enviar el enlace.");
    } finally {
      setMandando(false);
    }
  };

  return (
    <div className="blq">
      <div className="tit">Entre tus aparatos</div>

      {nube.estado === "fuera" ? (
        enviado ? (
          <div className="aviso">
            <b>Mira el correo</b>
            <br />
            Te he mandado un enlace a <b>{correo}</b>. Ábrelo <b>en este mismo aparato</b> y entrarás. No
            hay contraseña que recordar.
            <div style={{ marginTop: 14 }}>
              <button className="btn sec mini" onClick={() => setEnviado(false)}>
                Usar otro correo
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="parrafo">
              Entra con tu correo en el móvil y en el ordenador y los dos verán lo mismo. Lo que metas en
              uno aparece en el otro.
            </p>
            <p className="parrafo">
              Sigue guardándose primero en este aparato, así que la app funciona igual sin cobertura. Lo
              pendiente sube solo cuando vuelve la conexión.
            </p>
            <form onSubmit={mandar} style={{ marginTop: 16 }}>
              <label className="lab" htmlFor="correo">
                Tu correo
              </label>
              <input
                id="correo"
                type="email"
                autoComplete="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@correo.com"
                style={{ marginBottom: 12 }}
              />
              <button className="btn pri" type="submit" disabled={mandando}>
                {mandando ? "Enviando…" : "Enviarme un enlace"}
              </button>
            </form>
            {fallo && <div className="ayuda" style={{ color: "var(--rojo)" }}>{fallo}</div>}
          </>
        )
      ) : (
        <>
          <Estado nube={nube} />

          {nube.estado === "conflicto" && (
            <div className="aviso" style={{ marginTop: 14 }}>
              <b>Los dos lados han cambiado</b>
              <br />
              Editaste aquí y en otro aparato desde la última vez que cuadraron. No puedo juntarlos sin
              inventarme algo, así que eliges tú. Lo que descartes se pierde.
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, margin: "12px 0" }}>
                aquí: cambiado {fecha(nube.sync.actualizado)}
                <br />
                servidor: cambiado {fecha(nube.conflicto?.marca)}
              </div>
              <div className="fila">
                <button
                  className="btn peli mini"
                  style={{ width: "100%" }}
                  onClick={() => nube.resolver("aqui")}
                >
                  Mando yo
                </button>
                <button
                  className="btn sec mini"
                  style={{ width: "100%" }}
                  onClick={() => nube.resolver("servidor")}
                >
                  Manda el servidor
                </button>
              </div>
            </div>
          )}

          {nube.error && (
            <div className="ayuda" style={{ color: "var(--rojo)" }}>
              {nube.error}
            </div>
          )}

          <div className="fila" style={{ marginTop: 16 }}>
            <button
              className="btn sec mini"
              style={{ width: "100%" }}
              onClick={nube.sincronizar}
              disabled={nube.estado === "trabajando"}
            >
              Sincronizar ya
            </button>
            <button
              className="btn sec mini"
              style={{ width: "100%" }}
              onClick={async () => {
                await salir();
                nube.setSesion(null);
              }}
            >
              Salir
            </button>
          </div>
          <div className="ayuda">
            Al salir, los datos se quedan en este aparato. No se borra nada.
          </div>
        </>
      )}
    </div>
  );
}

const TEXTOS = {
  ok: ["var(--verde)", "Todo sincronizado"],
  pendiente: ["var(--ambar)", "Cambios sin subir"],
  sinConexion: ["var(--ambar)", "Sin conexión"],
  trabajando: ["var(--suave)", "Sincronizando…"],
  conflicto: ["var(--rojo)", "Hay que decidir"],
  error: ["var(--rojo)", "No he podido sincronizar"],
};

function Estado({ nube }) {
  const [color, texto] = TEXTOS[nube.estado] || TEXTOS.ok;
  return (
    <>
      <div className="desg">
        <span className="n">Estado</span>
        <span className="c" style={{ color, fontWeight: 700 }}>
          {texto}
        </span>
      </div>
      <div className="desg">
        <span className="n">Última vez que cuadraron</span>
        <span className="c">{fecha(nube.sync.sincronizado)}</span>
      </div>
      <div className="desg">
        <span className="n">Cuenta</span>
        <span className="c" style={{ fontSize: 12 }}>
          {nube.sesion?.user?.email || "—"}
        </span>
      </div>
    </>
  );
}
