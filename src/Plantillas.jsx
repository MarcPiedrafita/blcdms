import React, { useState } from "react";
import {
  nuevaPlantilla,
  nuevaCategoria,
  nuevoElemento,
  nuevaLineaPlantilla,
  ratios,
  totalLinea,
  num,
  eur,
  eur2,
  ESCALAS,
  UNIDADES,
} from "./lib.js";

export default function Plantillas({ datos, onGuardar, onQuitar, abierto, setAbierto }) {
  const plantilla = datos.plantillas.find((p) => p.id === abierto);

  if (plantilla) {
    return (
      <Ficha
        key={plantilla.id}
        plantilla={plantilla}
        onCambio={(n) =>
          onGuardar({ ...datos, plantillas: datos.plantillas.map((p) => (p.id === n.id ? n : p)) })
        }
        onBorrar={() => {
          onQuitar(`Plantilla «${plantilla.nombre || "sin nombre"}» borrada`, {
            ...datos,
            plantillas: datos.plantillas.filter((p) => p.id !== plantilla.id),
          });
          setAbierto(null);
        }}
        onVolver={() => setAbierto(null)}
      />
    );
  }
  return <Lista datos={datos} onGuardar={onGuardar} setAbierto={setAbierto} />;
}

/* Los dos nombres que pediste, para no empezar con la pantalla en blanco. */
const SUGERIDAS = ["Reforma integral", "Reforma parcial"];

function Lista({ datos, onGuardar, setAbierto }) {
  const crear = (nombre) => {
    const p = nuevaPlantilla(nombre);
    onGuardar({ ...datos, plantillas: [...datos.plantillas, p] });
    setAbierto(p.id);
  };

  const puestas = datos.plantillas.map((p) => p.nombre);
  const faltan = SUGERIDAS.filter((n) => !puestas.includes(n));

  return (
    <>
      {datos.plantillas.length === 0 ? (
        <div className="vacio">
          <b>Un presupuesto tipo, para comparar casas</b>
          Montas la obra sobre una casa de referencia de los metros que tú digas, marcas qué partidas
          escalan con los metros y cuáles no, y te sale un €/m² con el que medir cualquier casa que veas
          antes de comprarla.
        </div>
      ) : (
        datos.plantillas.map((p) => {
          const r = ratios(p);
          return (
            <button key={p.id} className="item" onClick={() => setAbierto(p.id)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="nom">{p.nombre || "Sin nombre"}</div>
                <div className="det">
                  {r.metros} m² de referencia · {p.elementos.length}{" "}
                  {p.elementos.length === 1 ? "elemento" : "elementos"}
                </div>
                <div className="ratio-fila">
                  <span>
                    <b>{eur2(r.esencial.ratio)}</b>/m²
                    {r.esencial.fijo > 0 && <i> + {eur(r.esencial.fijo)} fijo</i>}
                  </span>
                  <span className="ext">
                    con extras <b>{eur2(r.conExtras.ratio)}</b>/m²
                  </span>
                </div>
              </div>
            </button>
          );
        })
      )}

      <div style={{ marginTop: 20 }}>
        {faltan.map((n) => (
          <button key={n} className="btn sec" style={{ marginBottom: 10 }} onClick={() => crear(n)}>
            + {n}
          </button>
        ))}
        <button className="btn pri" onClick={() => crear("")}>
          + Plantilla en blanco
        </button>
      </div>
    </>
  );
}

function Ficha({ plantilla, onCambio, onBorrar, onVolver }) {
  const [conf, setConf] = useState(false);
  const [nuevaCat, setNuevaCat] = useState("");
  const [nuevoEl, setNuevoEl] = useState({});
  const [desplegado, setDesplegado] = useState({});

  const p = plantilla;
  const set = (k, v) => onCambio({ ...p, [k]: v });
  const r = ratios(p);

  const setElemento = (id, campo, valor) =>
    set("elementos", p.elementos.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)));

  const setLinea = (elId, lnId, campo, valor) =>
    set(
      "elementos",
      p.elementos.map((e) =>
        e.id === elId
          ? { ...e, lineas: e.lineas.map((l) => (l.id === lnId ? { ...l, [campo]: valor } : l)) }
          : e
      )
    );

  const anadirCat = () => {
    if (!nuevaCat.trim()) return;
    set("categorias", [...p.categorias, nuevaCategoria(nuevaCat.trim())]);
    setNuevaCat("");
  };

  const anadirEl = (catId) => {
    const nombre = (nuevoEl[catId] || "").trim();
    if (!nombre) return;
    const e = nuevoElemento(catId, nombre);
    onCambio({ ...p, elementos: [...p.elementos, e] });
    setNuevoEl({ ...nuevoEl, [catId]: "" });
    setDesplegado({ ...desplegado, [e.id]: true });
  };

  return (
    <>
      <header className="cab" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="volver" aria-label="Volver a las plantillas" onClick={onVolver}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="marca" style={{ fontSize: 22 }}>{p.nombre || "Nueva plantilla"}</div>
        </div>
      </header>

      {/* El número por el que existe todo esto, siempre a la vista. */}
      <div className="ratios">
        {r.sinMetros ? (
          <div className="sin-metros">Pon los metros de referencia para que salga el €/m²</div>
        ) : (
          <>
            <div className="par">
              <div className="k">Esencial</div>
              <div className="v">
                {eur2(r.esencial.ratio)}
                <span>/m²</span>
              </div>
              <div className="f">+ {eur(r.esencial.fijo)} fijo</div>
            </div>
            <div className="par">
              <div className="k">Con extras</div>
              <div className="v">
                {eur2(r.conExtras.ratio)}
                <span>/m²</span>
              </div>
              <div className="f">+ {eur(r.conExtras.fijo)} fijo</div>
            </div>
          </>
        )}
      </div>

      <div className="fila" style={{ marginBottom: 13 }}>
        <div>
          <label className="lab" htmlFor="pl-nombre">Nombre</label>
          <input
            id="pl-nombre"
            autoFocus={!p.nombre}
            value={p.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            placeholder="Reforma integral"
          />
        </div>
        <div style={{ maxWidth: 110 }}>
          <label className="lab" htmlFor="pl-metros">Metros ref.</label>
          <input
            id="pl-metros"
            inputMode="decimal"
            value={p.metros ?? ""}
            onChange={(e) => set("metros", num(e.target.value))}
            placeholder="100"
          />
        </div>
      </div>

      {r.conExtras.fijo === 0 && r.conExtras.porMetro > 0 && (
        <div className="aviso" style={{ marginBottom: 16 }}>
          <b>No has marcado ningún coste fijo</b>
          <br />
          La acometida eléctrica, la traída de agua, la fosa séptica o el acceso de maquinaria cuestan lo
          mismo en una casa de 60 m² que en una de 200. Si todo escala, las casas pequeñas te van a salir
          baratísimas y es mentira.
        </div>
      )}

      {p.categorias.length === 0 && (
        <div className="ayuda" style={{ marginTop: 0 }}>
          Empieza por una categoría: Cubierta, Fontanería, Solados…
        </div>
      )}

      {p.categorias.map((c) => {
        const suyos = p.elementos.filter((e) => e.categoriaId === c.id);
        const totalCat = suyos.reduce(
          (s, e) => s + (e.lineas || []).reduce((x, l) => x + totalLinea(l), 0),
          0
        );

        return (
          <div className="blq" key={c.id}>
            <div className="cab-cat">
              <div className="tit" style={{ margin: 0 }}>{c.nombre}</div>
              <div className="tot-cat">{eur(totalCat)}</div>
            </div>

            {suyos.map((e) => {
              const total = (e.lineas || []).reduce((s, l) => s + totalLinea(l), 0);
              const abierto = desplegado[e.id];
              return (
                <div className="el-pl" key={e.id}>
                  <div className="cabecera">
                    <button
                      className="nombre"
                      onClick={() => setDesplegado({ ...desplegado, [e.id]: !abierto })}
                    >
                      <span className={`disc ${abierto ? "on" : ""}`}>›</span>
                      {e.nombre}
                    </button>
                    <button
                      className={`chip ${e.fase}`}
                      onClick={() =>
                        setElemento(e.id, "fase", e.fase === "extra" ? "imprescindible" : "extra")
                      }
                    >
                      {e.fase === "extra" ? "extra" : "imprescindible"}
                    </button>
                    <span className="tot">{eur(total)}</span>
                  </div>

                  {abierto && (
                    <div className="lineas">
                      {(e.lineas || []).map((l) => (
                        <div className="ln" key={l.id}>
                          <div className="top">
                            <input
                              value={l.concepto}
                              onChange={(ev) => setLinea(e.id, l.id, "concepto", ev.target.value)}
                              placeholder="Teja curva"
                              aria-label="Concepto"
                            />
                            <button
                              className="equis"
                              aria-label={`Borrar ${l.concepto || "la línea"}`}
                              onClick={() =>
                                setElemento(e.id, "lineas", e.lineas.filter((x) => x.id !== l.id))
                              }
                            >
                              ×
                            </button>
                          </div>

                          <div className="tres">
                            <input
                              className="cant"
                              inputMode="decimal"
                              value={l.cantidad ?? ""}
                              onChange={(ev) => setLinea(e.id, l.id, "cantidad", num(ev.target.value))}
                              aria-label="Cantidad"
                            />
                            <input
                              className="und"
                              list="unidades-pl"
                              value={l.unidad}
                              onChange={(ev) => setLinea(e.id, l.id, "unidad", ev.target.value)}
                              aria-label="Unidad"
                            />
                            <input
                              className="pre"
                              inputMode="decimal"
                              value={l.precio ?? ""}
                              onChange={(ev) => setLinea(e.id, l.id, "precio", num(ev.target.value))}
                              placeholder="€ / unidad"
                              aria-label="Precio por unidad"
                            />
                          </div>

                          <div className="pie">
                            <div className="seg mini2">
                              {ESCALAS.map(([k, et]) => (
                                <button
                                  key={k}
                                  className={(l.escala || "metro") === k ? "on" : ""}
                                  onClick={() => setLinea(e.id, l.id, "escala", k)}
                                >
                                  {et}
                                </button>
                              ))}
                            </div>
                            <span className="tot">{eur2(totalLinea(l))}</span>
                          </div>
                        </div>
                      ))}

                      {/* `.btn.mini` es de ancho automático, así que sin esta
                          fila el enlace de borrar se pega al botón. */}
                      <div className="pie-el">
                        <button
                          className="btn sec mini"
                          onClick={() =>
                            setElemento(e.id, "lineas", [...(e.lineas || []), nuevaLineaPlantilla()])
                          }
                        >
                          + Línea
                        </button>
                        <button
                          className="link"
                          onClick={() => set("elementos", p.elementos.filter((x) => x.id !== e.id))}
                        >
                          Borrar «{e.nombre}»
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="fila" style={{ marginTop: 12 }}>
              <input
                value={nuevoEl[c.id] || ""}
                onChange={(ev) => setNuevoEl({ ...nuevoEl, [c.id]: ev.target.value })}
                onKeyDown={(ev) => ev.key === "Enter" && anadirEl(c.id)}
                placeholder="Nuevo elemento"
                aria-label={`Nuevo elemento en ${c.nombre}`}
              />
              <button
                className="btn sec mini"
                style={{ flex: "none", width: 84 }}
                onClick={() => anadirEl(c.id)}
              >
                Añadir
              </button>
            </div>

            <button
              className="link"
              style={{ marginTop: 12, display: "inline-block" }}
              onClick={() =>
                onCambio({
                  ...p,
                  categorias: p.categorias.filter((x) => x.id !== c.id),
                  elementos: p.elementos.filter((x) => x.categoriaId !== c.id),
                })
              }
            >
              Borrar la categoría y lo que lleva dentro
            </button>
          </div>
        );
      })}

      <datalist id="unidades-pl">
        {UNIDADES.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>

      <div className="blq">
        <div className="fila">
          <input
            value={nuevaCat}
            onChange={(e) => setNuevaCat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && anadirCat()}
            placeholder="Nueva categoría"
            aria-label="Nueva categoría"
          />
          <button className="btn sec mini" style={{ flex: "none", width: 84 }} onClick={anadirCat}>
            Añadir
          </button>
        </div>
      </div>

      <div className="blq">
        <div className="tit">Sale por</div>
        <div className="desg">
          <span className="n">Lo que escala con los metros</span>
          <span className="c">{eur(r.conExtras.porMetro)}</span>
        </div>
        <div className="desg">
          <span className="n">Lo que cuesta igual sea la casa que sea</span>
          <span className="c">{eur(r.conExtras.fijo)}</span>
        </div>
        <div className="desg suma">
          <span className="n">Total en {r.metros} m²</span>
          <span className="c">{eur(r.conExtras.total)}</span>
        </div>
        <div className="ayuda">
          El €/m² sale solo de lo que escala. Lo fijo se suma aparte, porque no depende del tamaño de la
          casa.
        </div>
      </div>

      <div className="blq">
        {conf ? (
          <div className="fila">
            <button className="btn peli" onClick={onBorrar}>Sí, borrar</button>
            <button className="btn sec" onClick={() => setConf(false)}>No</button>
          </div>
        ) : (
          <button className="btn peli" onClick={() => setConf(true)}>Borrar plantilla</button>
        )}
      </div>
    </>
  );
}
