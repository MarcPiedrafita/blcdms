# La obra

Presupuesto de la reforma de la casa. React + Vite, sin servidor. Los datos se guardan en el navegador.

## Qué hay dentro

**Dinero.** Lo ahorrado frente al objetivo. El objetivo se calcula solo: precio de la casa + impuestos (%) + total de partidas imprescindibles + colchón para imprevistos (%). Se puede forzar a mano dejando el campo del objetivo relleno; para volver al cálculo, se vacía. A partir de las aportaciones registradas saca el ritmo mensual y cuánto queda, en años y meses y con la fecha aproximada de llegada.

**Obra.** Categorías que creas tú (Cocina, Patio, Tejado…). Dentro, elementos. Cada elemento tiene fase (imprescindible / extra), estado (idea, decidido, comprado, hecho) y líneas de material: concepto, cantidad, unidad y precio por unidad. Tienda y enlace son opcionales y están plegados.

**Máquinas.** Días de uso, precio por día y precio de compra. Calcula cuál sale más barato y a partir de cuántos días cambia la respuesta, y suma la opción elegida al presupuesto. Se puede forzar alquilar o comprar.

**Ideas.** Notas libres con etiqueta casa o patio. Sin precios. Botón para convertir una idea en elemento del presupuesto; el texto pasa a las notas del elemento.

**Copia.** Exportar e importar un `.json`. Avisa en rojo si hace más de treinta días de la última copia. En el móvil sale el menú de compartir, para guardarla en Archivos o mandársela a quien sea.

Solo las partidas marcadas como imprescindibles cuentan para el objetivo de ahorro. Los extras se suman aparte.

Todo lo que se borra deja siete segundos para deshacerlo. Cualquier otro cambio cierra esa ventana, así que deshacer solo puede revertir lo último y nunca se lleva por delante una edición posterior.

## Aspecto

Grafito sobre cal, con amarillo de alta visibilidad como única señal: botón principal, partidas imprescindibles, avance del ahorro y pestaña activa. Nada más va en amarillo.

Tres tipografías, servidas desde `public/fonts` para que la app abra sin cobertura: **Bricolage Grotesque** para los rótulos y las cifras grandes, **Instrument Sans** para el texto y **IBM Plex Mono** para todo lo que es medida —unidades, cantidades, fechas e importes en columna—. Sigue el tema claro u oscuro del teléfono.

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

Cada push a `main` publica en Vercel. La primera vez hay que enlazar el repositorio: **Add New → Project → Import**, detecta Vite solo, **Deploy**. `vercel.json` ya lleva la configuración de build y las cabeceras de caché.

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
