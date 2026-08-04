# La obra

Presupuesto de la reforma de la casa. React + Vite, sin servidor. Los datos se guardan en el navegador.

## Qué hay dentro

**Dinero.** Lo ahorrado frente al objetivo. El objetivo se calcula solo: precio de la casa + impuestos (%) + total de partidas imprescindibles + colchón para imprevistos (%). Se puede forzar a mano dejando el campo del objetivo relleno; para volver al cálculo, se vacía. Ritmo mensual y meses que faltan a partir de las aportaciones registradas.

**Obra.** Categorías que creas tú (Cocina, Patio, Tejado…). Dentro, elementos. Cada elemento tiene fase (imprescindible / extra), estado (idea, decidido, comprado, hecho) y líneas de material: concepto, cantidad, unidad y precio por unidad. Tienda y enlace son opcionales y están plegados.

**Máquinas.** Días de uso, precio por día y precio de compra. Calcula cuál sale más barato, a partir de cuántos días compensa comprar, y suma la opción elegida al presupuesto. Se puede forzar alquilar o comprar.

**Ideas.** Notas libres con etiqueta casa o patio. Sin precios. Botón para convertir una idea en elemento del presupuesto; el texto pasa a las notas del elemento.

**Copia.** Exportar e importar un `.json`. Avisa en rojo si hace más de treinta días de la última copia.

Solo las partidas marcadas como imprescindibles cuentan para el objetivo de ahorro. Los extras se suman aparte.

## Subirlo

1. Repositorio nuevo en GitHub:

   ```bash
   cd obra
   git init && git add . && git commit -m "primera versión"
   git branch -M main
   git remote add origin git@github.com:TU_USUARIO/obra.git
   git push -u origin main
   ```

2. En Vercel: **Add New → Project → Import**. Detecta Vite solo. **Deploy**.

## Instalarlo en el móvil

- Android (Chrome): menú ⋮ → *Añadir a pantalla de inicio*.
- iPhone (Safari): compartir → *Añadir a pantalla de inicio*. Tiene que ser Safari.

## En local

```bash
npm install
npm run dev
```

## Estructura del código

```
src/lib.js           datos, almacenamiento y todos los cálculos
src/App.jsx          pestañas
src/Dinero.jsx       ahorros y objetivo
src/Presupuesto.jsx  categorías, elementos y líneas
src/Maquinaria.jsx   alquilar o comprar
src/Ideas.jsx        notas
src/Copia.jsx        exportar e importar
src/styles.css       estilos
```

Toda la lógica de cifras está en `lib.js`. Si mañana esto pasa a Supabase, lo único que cambia son las funciones `leer` y `escribir` de ese fichero.
