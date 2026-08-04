/* ---------- Supabase: la parte que toca la red ----------
 *
 *  Todo esto es opcional. Sin las dos variables de entorno la app se queda
 *  exactamente como estaba: los datos en el móvil y nada más. Así el mismo
 *  código funciona con nube y sin ella, y enlazar Supabase no es un cambio
 *  irreversible.
 */

const URL = import.meta.env.VITE_SUPABASE_URL;
const CLAVE = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hayNube = () => Boolean(URL && CLAVE);

let cliente = null;

/* Supabase pesa más que toda la app junta. Se carga aparte y solo si hace
   falta: sin nube configurada no se descarga nunca, y con ella llega después
   de que la app ya se vea. */
async function supa() {
  if (!hayNube()) return null;
  if (!cliente) {
    cliente = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(URL, CLAVE, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // El enlace del correo vuelve con la sesión en la URL.
          detectSessionInUrl: true,
        },
      })
    );
  }
  return cliente;
}

export async function sesionActual() {
  const c = await supa();
  if (!c) return null;
  const { data } = await c.auth.getSession();
  return data?.session ?? null;
}

export function alCambiarSesion(cb) {
  let sub = null;
  let muerto = false;
  supa().then((c) => {
    if (!c || muerto) return;
    const { data } = c.auth.onAuthStateChange((_evento, sesion) => cb(sesion ?? null));
    sub = data?.subscription;
    if (muerto) sub?.unsubscribe();
  });
  return () => {
    muerto = true;
    sub?.unsubscribe();
  };
}

export async function enviarEnlace(correo) {
  const c = await supa();
  if (!c) throw new Error("Sin nube configurada");
  const { error } = await c.auth.signInWithOtp({
    email: correo,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function salir() {
  const c = await supa();
  if (c) await c.auth.signOut();
}

/** Lo que hay en el servidor. `null` si allí todavía no hay nada. */
export async function bajar() {
  const c = await supa();
  if (!c) return null;
  const { data, error } = await c.from("obra").select("datos, actualizado").maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { datos: data.datos, marca: data.actualizado };
}

/** Sube y devuelve la marca que ha puesto el servidor.
 *
 *  La marca la pone el servidor con un trigger, no el móvil: dos aparatos con
 *  la hora descuadrada darían marcas incoherentes. */
export async function subir(datos) {
  const c = await supa();
  if (!c) throw new Error("Sin nube configurada");
  const { data: s } = await c.auth.getSession();
  const usuario = s?.session?.user?.id;
  if (!usuario) throw new Error("Sin sesión");

  const { data, error } = await c
    .from("obra")
    .upsert({ usuario, datos }, { onConflict: "usuario" })
    .select("actualizado")
    .single();
  if (error) throw error;
  return data.actualizado;
}
