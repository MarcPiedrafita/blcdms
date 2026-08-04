# La obra

Presupuesto de la reforma de la casa. React + Vite, sin servidor. Los datos se guardan en el navegador.

## Qué hay dentro

**Dinero.** Lo ahorrado frente al objetivo, en una rueda que dice dos cosas a la vez: el anillo grueso es de qué se compone el objetivo, una variante del amarillo por partida, y el arco fino de dentro es cuánto llevas ahorrado. El avance va en tinta y no en amarillo para que se lea como otra medida y no como una quinta partida. Si fuerzas el objetivo por encima de lo calculado, ese margen sale como un trozo gris: sin él la rueda sumaría una cifra y el centro otra. El objetivo se calcula solo: lo que pones tú por la casa + impuestos (%) + total de partidas imprescindibles, y sobre esa suma un colchón para imprevistos (%).

Con el campo de entrada vacío se entiende que pagas la casa entera de tu bolsillo. Si lo rellenas, hay hipoteca y de la casa solo se ahorra ese porcentaje. **Los impuestos siguen calculándose sobre el precio entero**, no sobre la entrada: el banco presta contra el valor de la casa, pero el ITP, la notaría y el registro salen de tu bolsillo el día de la firma. Escalarlos con la entrada es el error que deja a la gente corta de dinero justo en ese momento. La diferencia no es cosmética: con 55.000 € de casa, 10% de impuestos, 15% de colchón y 1.240 € de obra, a contado el objetivo son 71.001 € y con un 20% de entrada son 20.401 €. El colchón va sobre todo y no solo sobre la obra: calculado solo sobre la obra salía 0 € mientras el presupuesto estuviera vacío, que es justo cuando más margen hace falta. Se puede forzar a mano dejando el campo del objetivo relleno; para volver al cálculo, se vacía. A partir de las aportaciones registradas saca el ritmo mensual y cuánto queda, en años y meses y con la fecha aproximada de llegada.

**Obra.** Categorías que creas tú (Cocina, Patio, Tejado…). Dentro, elementos. Cada elemento tiene fase (imprescindible / extra), estado (idea, decidido, comprado, hecho) y líneas de material: concepto, cantidad, unidad y precio por unidad. Tienda y enlace son opcionales y están plegados.

**Máquinas.** Días de uso, precio por día y precio de compra. Calcula cuál sale más barato y a partir de cuántos días cambia la respuesta, y suma la opción elegida al presupuesto. Se puede forzar alquilar o comprar.

**Ideas.** Notas libres con etiqueta casa o patio. Sin precios. Botón para convertir una idea en elemento del presupuesto; el texto pasa a las notas del elemento.

**Trámites.** El papeleo, que también frena una obra. Cada apunte es de un tipo —**trámite** (se pide y se espera), **documento** (se guarda y se enseña) o **pago** (tiene fecha límite y recargo)— con nombre, descripción, lo que cuesta y, lo que de verdad importa, cuánta antelación necesita: con mucha, justo antes, o ninguna.

Lo que cuesta un trámite cuenta entero como imprescindible y sube el objetivo de ahorro, igual que una partida de obra: sin la licencia no hay obra y sin la cédula no entras a vivir, así que no hay versión «extra» de esto. Lo ya marcado como hecho sigue sumando a propósito — la app no lleva el gasto real, así que lo pagado no se descuenta de tus ahorros; si además se cayera del objetivo, el objetivo bajaría mientras el ahorro se queda igual y parecerías más cerca de lo que estás. La lista se ordena sola por esa urgencia y lo marcado como hecho baja al fondo sin borrarse, que sirve de registro. La cabecera cuenta lo pendiente y cuánto de ello hay que pedir con tiempo.

**Copia.** Exportar e importar un `.json`. Empieza explicando qué es y por qué hace falta, porque «Copia» a secas no dice nada: los datos viven solo en el móvil y el fichero es lo único que hay entre ellos y perderlos. Avisa en rojo si hace más de treinta días de la última copia. En el móvil sale el menú de compartir, para guardarla en Archivos o mandársela a quien sea.

Nada tiene botón de guardar: cada cambio se escribe solo. Las fichas de obra, máquinas e ideas llevan al final un botón para encadenar la siguiente sin volver a la lista.

Solo las partidas marcadas como imprescindibles cuentan para el objetivo de ahorro. Los extras se suman aparte.

Todo lo que se borra deja siete segundos para deshacerlo. Cualquier otro cambio cierra esa ventana, así que deshacer solo puede revertir lo último y nunca se lleva por delante una edición posterior.

## Aspecto

Oscuro siempre, no lo que diga el teléfono. Grafito, con amarillo de alta visibilidad como única señal: botón principal, partidas imprescindibles y pestaña activa. Nada más va en amarillo.

La rueda del objetivo usa cuatro variantes de ese amarillo, de honda a clara en el mismo orden en que se listan las partidas. La escala va en ese sentido y no al revés porque el precio de la casa se come tres cuartos del anillo: con el tono más claro encima, esa masa deslumbra y el amarillo vivo acaba en las porciones diminutas. Honda abajo, el bulto queda tranquilo y lo que se ilumina es el colchón, que es precisamente el dinero que todavía es aire.

Los iconos están dibujados a mano sobre una retícula de 24 en `Iconos.jsx`, no traídos de una librería: así pesan cero y siguen la misma geometría recta del resto. Nada de emojis —un emoji lo pinta el sistema operativo, así que cambia de forma y de color en cada teléfono y trae su propia paleta de fábrica, justo lo contrario de una app que usa un solo color como señal—. Todos van a `currentColor`, así que nunca se salen de la paleta, y el de la pestaña activa se va a amarillo como la banda de arriba.

Tres tipografías, servidas desde `public/fonts` para que la app abra sin cobertura: **Bricolage Grotesque** para los rótulos y las cifras grandes, **Instrument Sans** para el texto y **IBM Plex Mono** para todo lo que es medida —unidades, cantidades, fechas e importes en columna—.

## En local

```bash
npm install
npm run dev
```

```bash
npm test        # los cálculos de lib.js
npm run build
```

## Subirlo

Cada push a `main` publica en Vercel. La primera vez hay que enlazar el repositorio: **Add New → Project → Import**, detecta Vite solo, **Deploy**.

`vercel.json` lleva la configuración de build y dos cabeceras de caché que importan. `sw.js` y el manifiesto se revalidan siempre: si se cachean, un despliegue nuevo no llega nunca porque el navegador sigue sirviendo el service worker viejo. Las tipografías, que no cambian de nombre, se guardan un año. (El fichero valida contra el esquema de Vercel y no admite claves de más, así que no se le pueden meter comentarios.)

En cada push y en cada pull request, GitHub Actions pasa los tests y compila (`.github/workflows/ci.yml`).

## Sincronizar entre aparatos (opcional)

Sin configurar nada, la app es local: cada aparato tiene sus datos y no se hablan. Con Supabase enlazado, entras con tu correo en el móvil y en el ordenador y los dos ven lo mismo.

Es opcional de verdad: si faltan las dos variables de entorno, no se carga ni la librería de Supabase y la app se comporta exactamente igual que antes.

**Local primero.** Escribir sigue siendo instantáneo y contra el propio aparato, así que la app funciona sin cobertura —que es la mitad de las veces que se abre estando en la obra—. Subir es un efecto secundario: ocurre dos segundos después del último cambio, al recuperar la conexión y al volver a la app. Lo pendiente espera.

**Qué hay que hacer:**

1. Crear un proyecto en [supabase.com](https://supabase.com). El plan gratuito sobra.
2. **SQL Editor** → pegar `supabase/schema.sql` entero → *Run*. Crea la tabla, el trigger de la marca de tiempo y la política que impide que nadie lea los datos de otro.
3. **Authentication → Providers**: dejar *Email* activado y **desactivar «Confirm email»** si quieres entrar con el enlace a la primera.
4. **Authentication → URL Configuration**: añadir `https://blcdms.vercel.app` a *Site URL* y a *Redirect URLs*. Sin esto el enlace del correo no vuelve a la app.
5. **Project Settings → API Keys**: copiar el *Project URL* y la **`Publishable key`** (`sb_publishable_…`). En proyectos antiguos esa misma clave aparece como **`anon` `public`**; sirven las dos.
6. En Vercel, **Settings → Environment Variables**, añadir las dos y volver a desplegar:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

> **La `Secret key` (`sb_secret_…`, antes `service_role`) no va aquí ni en ninguna otra variable de este proyecto.**
>
> Todo lo que empieza por `VITE_` se incrusta en el JavaScript que descarga el navegador: es público, se lee abriendo las herramientas de desarrollo. La clave publicable está pensada para eso. La secreta **se salta la seguridad por filas**, así que en el navegador dejaría la base de datos entera abierta a cualquiera que visite la web, y la política del paso 2 no la frenaría.
>
> Si alguna vez llega a desplegarse, hay que darla por quemada: bórrala de las variables, rótala en **Settings → API Keys** y vuelve a desplegar.

Lo que protege los datos no es el secreto de la clave publicable, es la política de la base de datos del paso 2. Sin ese paso, cualquiera podría leerlo todo.

**Si editas en dos sitios a la vez.** Cada aparato guarda cuándo cambió algo por última vez y con qué marca del servidor cuadró. Si los dos lados han cambiado desde entonces, la app no elige: para, lo dice, y te enseña las dos fechas para que decidas. Lo que descartes se pierde, así que la copia en `.json` sigue teniendo sentido aunque esto esté puesto.

## Instalarlo en el móvil

- Android (Chrome): menú ⋮ → *Añadir a pantalla de inicio*.
- iPhone (Safari): compartir → *Añadir a pantalla de inicio*. Tiene que ser Safari.

## Estructura del código

```
src/lib.js              datos, almacenamiento y todos los cálculos
src/lib.test.js         tests de los cálculos
src/sync.js             estado de sincronización y qué hacer con él
src/sync.test.js        tests de esa decisión
src/nube.js             Supabase: sesión, bajar y subir
src/useNube.js          cuándo sincronizar, cosido a React
src/App.jsx             pestañas y deshacer
src/Dinero.jsx          ahorros y objetivo
src/Rueda.jsx           la rueda: composición del objetivo y avance
src/Presupuesto.jsx     categorías, elementos y líneas
src/Maquinaria.jsx      alquilar o comprar
src/Ideas.jsx           notas
src/Tramites.jsx        papeleo, con tipo y urgencia
src/Iconos.jsx          los iconos, dibujados a mano
src/Copia.jsx           exportar e importar
src/Sincronizacion.jsx  entrar, estado y conflictos
src/styles.css          estilos
supabase/schema.sql     tabla, trigger y permisos
public/fonts/           tipografías
public/sw.js            caché para funcionar sin internet
```

Toda la lógica de cifras está en `lib.js` y está cubierta por tests. La decisión de qué hacer al sincronizar está en `sync.js`, aparte de la red y también cubierta: es donde se pierden datos si te equivocas, así que no depende de tener un servidor delante para probarla.
