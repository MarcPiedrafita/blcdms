import React, { useState } from "react";
import { nuevaAyuda, nuevoRequisito, nuevoTramite, num, eur, ayudas as calcAyudas, ESTADOS_AYUDA, CUMPLIMIENTOS } from "./lib.js";
import { PLANTILLAS } from "./ayudasEstado.js";
import { IcoHecho } from "./Iconos.jsx";

const NOMBRE_ESTADO = Object.fromEntries(ESTADOS_AYUDA);

/* Lo más firme arriba: lo concedido es dinero, lo denegado ya no. */
const ORDEN = { concedida: 0, solicitada: 1, explorando: 2, denegada: 3 };
const ordenar = (a, b) => (ORDEN[a.estado] ?? 9) - (ORDEN[b.estado] ?? 9) || b.creada - a.creada;

export default function Ayudas({ datos, onGuardar, onQuitar, abierto, setAbierto, irATramite }) {
  const ayuda = datos.ayudas.find((a) => a.id === abierto);

  if (ayuda) {
    return (
      <Ficha
        key={ayuda.id}
        datos={datos}
        ayuda={ayuda}
        onGuardar={onGuardar}
        irATramite={irATramite}
        onCambio={(n) => onGuardar({ ...datos, ayudas: datos.ayudas.map((a) => (a.id === n.id ? n : a)) })}
        onBorrar={() => {
          onQuitar(`«${ayuda.nombre || "Ayuda sin nombre"}» borrada`, {
            ...datos,
            ayudas: datos.ayudas.filter((a) => a.id !== ayuda.id),
            // Los trámites que colgaban de ella se quedan, pero sueltos.
            tramites: datos.tramites.map((t) => (t.ayudaId === ayuda.id ? { ...t, ayudaId: null } : t)),
          });
          setAbierto(null);
        }}
        onVolver={() => setAbierto(null)}
      />
    );
  }
  return <Lista datos={datos} onGuardar={onGuardar} setAbierto={setAbierto} />;
}

function Lista({ datos, onGuardar, setAbierto }) {
  const a = calcAyudas(datos);
  const lista = [...datos.ayudas].sort(ordenar);

  const crear = (base) => {
    const n = { ...nuevaAyuda(), ...(base || {}) };
    onGuardar({ ...datos, ayudas: [n, ...datos.ayudas] });
    setAbierto(n.id);
  };

  return (
    <>
      <button className="btn pri" style={{ marginBottom: 12 }} onClick={() => crear()}>
        + Nueva ayuda
      </button>

      {lista.length === 0 ? (
        <>
          <div className="vacio">
            <b>Dinero que no tienes que devolver</b>
            Hay ayudas del Estado para comprar en pueblos pequeños siendo joven, y para rehabilitar. Te dejo
            las dos rellenas con lo que dice el plan vigente, para que solo tengas que comprobar tus
            requisitos.
          </div>
          <Plantillas onUsar={crear} />
        </>
      ) : (
        <>
          <div className="blq" style={{ marginTop: 4 }}>
            <div className="desg">
              <span className="n">Concedido</span>
              <span className="c">{eur(a.concedida)}</span>
            </div>
            <div className="desg">
              <span className="n">Solicitado, sin respuesta</span>
              <span className="c">{eur(a.solicitada)}</span>
            </div>
            <div className="desg">
              <span className="n">Solo explorando</span>
              <span className="c">{eur(a.explorando)}</span>
            </div>
            <div className="desg suma">
              <span className="n">Si todo saliera bien</span>
              <span className="c">{eur(a.total)}</span>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            {lista.map((x) => (
              <button key={x.id} className="item" onClick={() => setAbierto(x.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nom">{x.nombre || "Sin nombre"}</div>
                  {x.organismo && <div className="det">{x.organismo}</div>}
                  <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 10 }}>
                    <span className={`est e-${x.estado}`}>{NOMBRE_ESTADO[x.estado]}</span>
                    <Progreso ayuda={x} />
                  </div>
                </div>
                {x.importe != null && (
                  <span className="c-ayuda" style={{ opacity: x.estado === "denegada" ? 0.35 : 1 }}>
                    {eur(x.importe)}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="blq">
            <div className="tit">Añadir una conocida</div>
            <Plantillas onUsar={crear} />
          </div>
        </>
      )}
    </>
  );
}

function Plantillas({ onUsar }) {
  return (
    <>
      {PLANTILLAS.map((p) => (
        <button key={p.clave} className="btn sec" style={{ marginBottom: 10 }} onClick={() => onUsar(p.construir())}>
          {p.titulo}
        </button>
      ))}
      <div className="ayuda">
        Vienen rellenas con lo que dice el Real Decreto 326/2026, comprobado en agosto de 2026. Son un punto
        de partida para que edites, no una resolución: quien pone las cifras finales y los plazos es la
        convocatoria de tu comunidad autónoma.
      </div>
    </>
  );
}

function Progreso({ ayuda }) {
  const r = ayuda.requisitos || [];
  if (!r.length) return null;
  const si = r.filter((x) => x.cumplido === "si").length;
  const no = r.filter((x) => x.cumplido === "no").length;
  return (
    <span className="prog-req">
      {no > 0 && <b className="mal">{no} sin cumplir</b>}
      {no === 0 && `${si}/${r.length} comprobados`}
    </span>
  );
}

function Ficha({ datos, ayuda, onCambio, onGuardar, onBorrar, onVolver, irATramite }) {
  const [conf, setConf] = useState(false);
  const [nuevoReq, setNuevoReq] = useState("");
  const set = (k, v) => onCambio({ ...ayuda, [k]: v });

  const reqs = ayuda.requisitos || [];
  const vinculados = datos.tramites.filter((t) => t.ayudaId === ayuda.id);
  const sueltos = datos.tramites.filter((t) => !t.ayudaId);

  const setReq = (id, cumplido) =>
    set("requisitos", reqs.map((r) => (r.id === id ? { ...r, cumplido } : r)));

  const anadirReq = () => {
    if (!nuevoReq.trim()) return;
    set("requisitos", [...reqs, nuevoRequisito(nuevoReq.trim())]);
    setNuevoReq("");
  };

  const crearTramite = () => {
    const t = { ...nuevoTramite(), nombre: "", ayudaId: ayuda.id };
    onGuardar({ ...datos, tramites: [t, ...datos.tramites] });
    irATramite(t.id, ayuda.id);
  };

  const vincular = (id) =>
    onGuardar({ ...datos, tramites: datos.tramites.map((t) => (t.id === id ? { ...t, ayudaId: ayuda.id } : t)) });

  const sinCumplir = reqs.filter((r) => r.cumplido === "no").length;
  const sinSaber = reqs.filter((r) => r.cumplido === "?").length;

  return (
    <>
      <header className="cab" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="volver" aria-label="Volver a la lista" onClick={onVolver}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="marca" style={{ fontSize: 22 }}>{ayuda.nombre || "Nueva ayuda"}</div>
        </div>
      </header>

      <div style={{ marginBottom: 13 }}>
        <label className="lab" htmlFor="ay-nombre">Nombre</label>
        <input
          id="ay-nombre"
          autoFocus={!ayuda.nombre}
          value={ayuda.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          placeholder="Ayuda a jóvenes para comprar en municipio pequeño"
        />
      </div>

      <div style={{ marginBottom: 13 }}>
        <label className="lab" htmlFor="ay-organismo">Quién la da</label>
        <input
          id="ay-organismo"
          value={ayuda.organismo}
          onChange={(e) => set("organismo", e.target.value)}
          placeholder="Estado, comunidad autónoma, ayuntamiento…"
        />
      </div>

      <div style={{ marginBottom: 13 }}>
        <label className="lab" htmlFor="ay-importe">Lo que esperas cobrar €</label>
        <input
          id="ay-importe"
          inputMode="numeric"
          value={ayuda.importe ?? ""}
          onChange={(e) => set("importe", num(e.target.value))}
          placeholder="11000"
        />
        <div className="ayuda">
          {ayuda.estado === "denegada"
            ? "Denegada: esta cifra ya no cuenta en ninguna suma. Se guarda por si recurres."
            : "Aparece en la rueda de ayudas. Solo baja el objetivo de ahorro si activas «aplicar ayudas» en la pestaña de dinero."}
        </div>
      </div>

      <div style={{ marginBottom: 13 }}>
        <span className="lab">Por dónde va</span>
        <div className="seg col">
          {ESTADOS_AYUDA.map(([k, l]) => (
            <button key={k} className={ayuda.estado === k ? "on" : ""} onClick={() => set("estado", k)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ---- requisitos ---- */}
      <div className="blq">
        <div className="tit">Requisitos</div>

        {reqs.length === 0 ? (
          <div className="ayuda" style={{ marginTop: 0 }}>
            Apunta abajo lo que te piden y ve marcando lo que ya cumples.
          </div>
        ) : (
          <>
            <div className="aviso" style={{ marginBottom: 16 }}>
              {sinCumplir > 0 ? (
                <>
                  <b>{sinCumplir} {sinCumplir === 1 ? "requisito te deja fuera" : "requisitos te dejan fuera"}</b>
                  <br />
                  Mientras siga así no te la van a dar. Míralo antes de contar con el dinero.
                </>
              ) : sinSaber > 0 ? (
                <>
                  <b>Te faltan {sinSaber} por comprobar</b>
                  <br />
                  Ninguno te deja fuera de momento, pero hasta comprobarlos no sabes si entras.
                </>
              ) : (
                <>
                  <b>Los cumples todos</b>
                  <br />
                  Con lo que has marcado, entras. Falta que haya convocatoria y que quede dinero.
                </>
              )}
            </div>

            {reqs.map((r) => (
              <div className={`req c-${r.cumplido}`} key={r.id}>
                <div className="txt">{r.texto}</div>
                <div className="seg mini3">
                  {CUMPLIMIENTOS.map(([k, l]) => (
                    <button
                      key={k}
                      className={r.cumplido === k ? "on" : ""}
                      aria-label={l}
                      onClick={() => setReq(r.id, k)}
                    >
                      {k === "si" ? "Sí" : k === "no" ? "No" : "?"}
                    </button>
                  ))}
                </div>
                <button
                  className="equis"
                  aria-label={`Borrar el requisito «${r.texto}»`}
                  onClick={() => set("requisitos", reqs.filter((x) => x.id !== r.id))}
                >
                  ×
                </button>
              </div>
            ))}
          </>
        )}

        <div className="fila" style={{ marginTop: 16 }}>
          <input
            aria-label="Nuevo requisito"
            value={nuevoReq}
            onChange={(e) => setNuevoReq(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && anadirReq()}
            placeholder="Tener 35 años o menos…"
          />
          <button className="btn sec mini" style={{ flex: "none", width: 90 }} onClick={anadirReq}>
            Añadir
          </button>
        </div>
      </div>

      {/* ---- trámites ---- */}
      <div className="blq">
        <div className="tit">Lo que hay que hacer</div>

        {vinculados.length === 0 ? (
          <div className="ayuda" style={{ marginTop: 0, marginBottom: 16 }}>
            Los papeles que haya que pedir para esta ayuda van aquí, y aparecen también en la vista de
            trámites con su urgencia.
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {vinculados.map((t) => (
              <button key={t.id} className="item" onClick={() => irATramite(t.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nom" style={{ fontSize: 14.5 }}>
                    {t.hecho && <IcoHecho tam={14} />} {t.nombre || "Sin nombre"}
                  </div>
                  <div style={{ marginTop: 5 }}>
                    <span className={`urg u-${t.urgencia}`}>
                      {t.urgencia === "antelacion" ? "Con mucha antelación" : t.urgencia === "justo" ? "Justo antes" : "No frena la obra"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <button className="btn sec" onClick={crearTramite}>
          + Trámite para esta ayuda
        </button>

        {sueltos.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <label className="lab" htmlFor="ay-vincular">O engancha uno que ya tengas</label>
            <select
              id="ay-vincular"
              value=""
              onChange={(e) => e.target.value && vincular(e.target.value)}
            >
              <option value="">Elige un trámite…</option>
              {sueltos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre || "Sin nombre"}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="lab" htmlFor="ay-notas">Notas</label>
        <textarea
          id="ay-notas"
          rows={10}
          value={ayuda.notas}
          onChange={(e) => set("notas", e.target.value)}
          placeholder="Dónde se pide, qué plazos hay, teléfono, enlaces al BOE o a la convocatoria…"
        />
      </div>

      <div className="blq">
        {conf ? (
          <div className="fila">
            <button className="btn peli" onClick={onBorrar}>Sí, borrar</button>
            <button className="btn sec" onClick={() => setConf(false)}>No</button>
          </div>
        ) : (
          <button className="btn peli" onClick={() => setConf(true)}>Borrar ayuda</button>
        )}
        <div className="ayuda">Los trámites que cuelguen de ella no se borran: se quedan sueltos.</div>
      </div>
    </>
  );
}
