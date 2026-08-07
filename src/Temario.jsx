import React, { useState } from "react";
import { TEMARIO, UNIDADES_FASE, TODAS, POR_ID, unidades } from "./temario.js";
import { apunte, progreso, nuevoEnlace, tieneAlgo, ESTADOS_ESTUDIO } from "./lib.js";
import { IcoHecho, ICONOS_FASE } from "./Iconos.jsx";

const NOMBRE_ESTADO = Object.fromEntries(ESTADOS_ESTUDIO);

const sinTildes = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function Temario({ datos, onGuardar, abierto, setAbierto }) {
  const [fase, setFase] = useState(null);
  const [busca, setBusca] = useState("");

  /* Lo tuyo se guarda por id de unidad. Un registro que se queda sin nada
     dentro se borra en vez de quedarse como objeto vacío ocupando sitio en la
     copia y en la sincronización. */
  const guardar = (id, cambios) => {
    const nuevo = { ...apunte(datos, id), ...cambios };
    const estudio = { ...datos.estudio };
    if (tieneAlgo(nuevo)) estudio[id] = nuevo;
    else delete estudio[id];
    onGuardar({ ...datos, estudio });
  };

  if (abierto && POR_ID[abierto]) {
    return (
      <Punto
        key={abierto}
        datos={datos}
        ficha={POR_ID[abierto]}
        onCambio={(c) => guardar(abierto, c)}
        onVolver={() => setAbierto(null)}
      />
    );
  }

  if (fase) {
    return (
      <Fase
        key={fase.id}
        datos={datos}
        fase={fase}
        onAbrir={setAbierto}
        onVolver={() => setFase(null)}
      />
    );
  }

  const q = sinTildes(busca.trim());
  const encontrados = q
    ? TODAS.filter((u) => sinTildes(u.titulo).includes(q)).slice(0, 40)
    : null;

  const global = progreso(datos, TODAS.map((u) => u.id));

  return (
    <>
      <header className="cab">
        <div className="marca">
          <em>El</em>Temario
        </div>
        <div className="sub">
          {global.sabido} de {global.total} · {global.pct.toFixed(0)}%
        </div>
      </header>

      <div className="barra-prog" aria-hidden="true">
        <i style={{ width: `${global.pct}%` }} />
      </div>
      <div className="pie-prog">
        {global.estudiando > 0 && `${global.estudiando} en marcha · `}
        {global.conNotas} con apuntes
      </div>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar en el temario…"
        aria-label="Buscar en el temario"
        style={{ margin: "20px 0 8px" }}
      />

      {encontrados ? (
        encontrados.length === 0 ? (
          <div className="ayuda">Nada con «{busca}».</div>
        ) : (
          encontrados.map((u) => {
            const { fase: f, apartado } = POR_ID[u.id];
            const a = apunte(datos, u.id);
            return (
              <button key={u.id} className="item" onClick={() => setAbierto(u.id)}>
                <Marca estado={a.estado} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nom" style={{ fontSize: 14.5 }}>{u.titulo}</div>
                  <div className="det">
                    {f.n}. {f.titulo} · {apartado.n} {apartado.titulo}
                  </div>
                </div>
              </button>
            );
          })
        )
      ) : (
        <div style={{ marginTop: 12 }}>
          {TEMARIO.map((f) => {
            const p = progreso(datos, UNIDADES_FASE[f.id].map((u) => u.id));
            const Ico = ICONOS_FASE[f.n];
            return (
              <button key={f.id} className="fase" onClick={() => setFase(f)}>
                <div className="marca-fase">
                  {Ico && <Ico tam={24} />}
                  <span className="n">{f.n}</span>
                </div>
                <div className="cuerpo">
                  <div className="tt">{f.titulo}</div>
                  <div className="barra-prog fina">
                    <i style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
                <div className="cuenta">
                  {p.sabido}<span>/{p.total}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

function Marca({ estado }) {
  if (estado === "sabido") return <span className="marca-est sabido"><IcoHecho tam={13} /></span>;
  if (estado === "estudiando") return <span className="marca-est estudiando" />;
  return <span className="marca-est" />;
}

function Fase({ datos, fase, onAbrir, onVolver }) {
  const p = progreso(datos, UNIDADES_FASE[fase.id].map((u) => u.id));

  return (
    <>
      <header className="cab" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="volver" aria-label="Volver al temario" onClick={onVolver}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
          {ICONOS_FASE[fase.n] &&
            React.createElement(ICONOS_FASE[fase.n], { tam: 30, className: "ico ico-cab" })}
          <div className="marca" style={{ fontSize: 21 }}>
            <em>Fase {fase.n}</em>
            {fase.titulo}
          </div>
        </div>
      </header>

      <div className="barra-prog">
        <i style={{ width: `${p.pct}%` }} />
      </div>
      <div className="pie-prog">
        {p.sabido} de {p.total} · {p.pct.toFixed(0)}%
      </div>

      {fase.apartados.map((ap) => {
        const us = unidades(ap);
        const suelto = ap.puntos.length === 0;
        return (
          <div className="blq" key={ap.id}>
            {suelto ? (
              <Fila
                datos={datos}
                unidad={us[0]}
                numero={ap.n}
                grande
                onAbrir={onAbrir}
              />
            ) : (
              <>
                <div className="tit" style={{ fontSize: 19, marginBottom: 12 }}>
                  <span className="num-ap">{ap.n}</span> {ap.titulo}
                </div>
                {us.map((u) => (
                  <Fila key={u.id} datos={datos} unidad={u} onAbrir={onAbrir} />
                ))}
              </>
            )}
          </div>
        );
      })}
    </>
  );
}

function Fila({ datos, unidad, numero, grande, onAbrir }) {
  const a = apunte(datos, unidad.id);
  const tiene = a.notas.trim() || a.enlaces.length > 0 || a.dudas.trim();

  return (
    <button className={`fila-tema${grande ? " grande" : ""}`} onClick={() => onAbrir(unidad.id)}>
      <Marca estado={a.estado} />
      <span className="tt">
        {numero && <span className="num-ap">{numero}</span>} {unidad.titulo}
      </span>
      {tiene && <span className="tiene" aria-label="Con apuntes" />}
    </button>
  );
}

function Punto({ datos, ficha, onCambio, onVolver }) {
  const { fase, apartado, unidad } = ficha;
  const a = apunte(datos, unidad.id);
  const [nuevoEnlaceAbierto, setNuevo] = useState(false);
  const [borrador, setBorrador] = useState(nuevoEnlace());

  const anadirEnlace = () => {
    if (!borrador.url.trim() && !borrador.titulo.trim()) return;
    onCambio({ enlaces: [...a.enlaces, borrador] });
    setBorrador(nuevoEnlace());
    setNuevo(false);
  };

  return (
    <>
      <header className="cab" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="volver" aria-label="Volver a la fase" onClick={onVolver}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="marca" style={{ fontSize: 21 }}>
            <em>
              {fase.n}. {fase.titulo}
            </em>
            {unidad.titulo}
          </div>
        </div>
      </header>

      <div className="migas">
        {apartado.n} · {apartado.titulo}
      </div>

      <div style={{ marginBottom: 18 }}>
        <span className="lab">Por dónde vas</span>
        <div className="seg">
          {ESTADOS_ESTUDIO.map(([k, l]) => (
            <button key={k} className={a.estado === k ? "on" : ""} onClick={() => onCambio({ estado: k })}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label className="lab" htmlFor="te-notas">Apuntes</label>
        <textarea
          id="te-notas"
          rows={12}
          value={a.notas}
          onChange={(e) => onCambio({ notas: e.target.value })}
          placeholder="Lo que vayas aprendiendo, con tus palabras. Lo que se te olvida siempre, las medidas que se repiten, el error que cometiste una vez…"
        />
      </div>

      <div className="blq">
        <div className="tit">Dónde lo estás aprendiendo</div>

        {a.enlaces.length === 0 && !nuevoEnlaceAbierto && (
          <div className="ayuda" style={{ marginTop: 0, marginBottom: 14 }}>
            Vídeos, artículos, el capítulo de un libro. Lo que te sirvió, para no volver a buscarlo.
          </div>
        )}

        {a.enlaces.map((e) => (
          <div className="enlace" key={e.id}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="tt">{e.titulo || e.url}</div>
              {e.url && (
                <a className="link" href={e.url} target="_blank" rel="noreferrer">
                  Abrir
                </a>
              )}
            </div>
            <button
              className="equis"
              aria-label={`Quitar ${e.titulo || e.url}`}
              onClick={() => onCambio({ enlaces: a.enlaces.filter((x) => x.id !== e.id) })}
            >
              ×
            </button>
          </div>
        ))}

        {nuevoEnlaceAbierto ? (
          <div style={{ marginTop: 12 }}>
            <input
              autoFocus
              value={borrador.titulo}
              onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })}
              placeholder="Qué es"
              aria-label="Título del recurso"
              style={{ marginBottom: 8 }}
            />
            <input
              value={borrador.url}
              onChange={(e) => setBorrador({ ...borrador, url: e.target.value })}
              placeholder="https://…"
              aria-label="Enlace"
              onKeyDown={(e) => e.key === "Enter" && anadirEnlace()}
            />
            <div className="fila" style={{ marginTop: 10 }}>
              <button className="btn sec mini" onClick={anadirEnlace}>Guardar</button>
              <button className="btn sec mini" onClick={() => setNuevo(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <button className="btn sec" onClick={() => setNuevo(true)}>
            + Añadir recurso
          </button>
        )}
      </div>

      <div className="blq">
        <div className="tit">Dudas</div>
        <textarea
          rows={5}
          value={a.dudas}
          onChange={(e) => onCambio({ dudas: e.target.value })}
          placeholder="Lo que no acabas de entender, para preguntarlo o volver a ello."
          aria-label="Dudas"
        />
        <div className="ayuda">
          Apuntar lo que no entiendes vale tanto como apuntar lo que sí: es la lista de lo que te queda.
        </div>
      </div>
    </>
  );
}
