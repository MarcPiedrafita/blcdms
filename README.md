# La obra

Presupuesto de la reforma de la casa. React + Vite, sin servidor. Los datos se guardan en el navegador.

## Qué hay dentro

**Dinero.** Lo ahorrado frente al objetivo. El objetivo se calcula solo: precio de la casa + impuestos (%) + total de partidas imprescindibles, y sobre esa suma un colchón para imprevistos (%). El colchón va sobre todo y no solo sobre la obra: calculado solo sobre la obra salía 0 € mientras el presupuesto estuviera vacío, que es justo cuando más margen hace falta. Se puede forzar a mano dejando el campo del objetivo relleno; para volver al cálculo, se vacía. A partir de las aportaciones registradas saca el ritmo mensual y cuánto queda, en años y meses y con la fecha aproximada de llegada.

**Obra.** Categorías que creas tú (Cocina, Patio, Tejado…). Dentro, elementos. Cada elemento tiene fase (imprescindible / extra), estado (idea, decidido, comprado, hecho) y líneas de material: concepto, cantidad, unidad y precio por unidad. Tienda y enlace son opcionales y están plegados.

**Máquinas.** Días de uso, precio por día y precio de compra. Calcula cuál sale más barato y a partir de cuántos días cambia la respuesta, y suma la opción elegida al presupuesto. Se puede forzar alquilar o comprar.

**Ideas.** Notas libres con etiqueta casa o patio. Sin precios. Botón para convertir una idea en elemento del presupuesto; el texto pasa a las notas del elemento.

**Copia.** Exportar e importar un `.json`. Empieza explicando qué es y por qué hace falta, porque «Copia» a secas no dice nada: los datos viven solo en el móvil y el fichero es lo único que hay entre ellos y perderlos. Avisa en rojo si hace más de treinta días de la última copia. En el móvil sale el menú de compartir, para guardarla en Archivos o mandársela a quien sea.

Nada tiene botón de guardar: cada cambio se escribe solo. Las fichas de obra, máquinas e ideas llevan al final un botón para encadenar la siguiente sin volver a la lista.

Solo las partidas marcadas como imprescindibles cuentan para el objetivo de ahorro. Los extras se suman aparte.

Todo lo que se borra deja siete segundos para deshacerlo. Cualquier otro cambio cierra esa ventana, así que deshacer solo puede revertir lo último y nunca se lleva por delante una edición posterior.

## Aspecto

Oscuro siempre, no lo que diga el teléfono. Grafito, con amarillo de alta visibilidad como única señal: botón principal, partidas imprescindibles, avance del ahorro y pestaña activa. Nada más va en amarillo.

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

## Instalarlo en el móvil

- Android (Chrome): menú ⋮ → *Añadir a pantalla de inicio*.
- iPhone (Safari): compartir → *Añadir a pantalla de inicio*. Tiene que ser Safari.

## Estructura del código

```
src/lib.js           datos, almacenamiento y todos los cálculos
src/lib.test.js      tests de los cálculos
src/App.jsx          pestañas y deshacer
src/Dinero.jsx       ahorros y objetivo
src/Presupuesto.jsx  categorías, elementos y líneas
src/Maquinaria.jsx   alquilar o comprar
src/Ideas.jsx        notas
src/Copia.jsx        exportar e importar
src/styles.css       estilos
public/fonts/        tipografías
public/sw.js         caché para funcionar sin internet
```

Toda la lógica de cifras está en `lib.js` y está cubierta por tests. Si mañana esto pasa a Supabase, lo único que cambia son las funciones `leer` y `escribir` de ese fichero.
