# Rubicon

Extensión de navegador para importar rúbricas escritas como tablas Markdown en el editor de rúbricas de Moodle. Rubicon rellena el formulario, pero **nunca lo
guarda automáticamente**: podrás revisar el resultado antes de pulsar el botón de guardado de Moodle.

## Instalar en Chrome, Edge, Brave u otro navegador Chromium

1. Descarga o clona este repositorio y déjalo en una carpeta permanente.
2. Abre la página de extensiones del navegador:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
3. Activa **Modo de desarrollador**.
4. Pulsa **Cargar descomprimida** y selecciona la carpeta de este repositorio (la que contiene `manifest.json`).


## Usar Rubicon

1. En Moodle, abre una actividad y entra en la configuración de su rúbrica.
2. Abre **Editar la definición del formulario actual** y espera a que aparezca
   el editor. Encima de la rúbrica verás **Importar rúbrica Markdown**.
3. Pulsa el botón, pega tu tabla y usa **Comprobar** para validarla.
4. Pulsa **Rellenar Moodle** y confirma la sustitución de las filas actuales.
5. Revisa criterios, descripciones y puntos. Si algo no está bien, usa
   **Deshacer importación (antes de guardar)**.
6. Guarda la rúbrica con el botón normal de Moodle cuando estés conforme.

## Formato Markdown

La primera columna contiene el criterio. Cada encabezado de nivel debe acabar
con su puntuación entre paréntesis:

```md
| Criterio | Insuficiente (0) | Bien (1) | Excelente (2) |
|---|---|---|---|
| Contenido | Incompleto | Correcto | Completo y bien argumentado |
| Presentación | Difícil de seguir | Clara | Muy clara y cuidada |
```

La puntuación del encabezado se aplica a todas las filas. Para asignar una
puntuación diferente a una celda concreta, comienza su texto con `[puntos]`:

```md
| Fuentes | No se citan | Se citan parcialmente | [2.5] Citas completas y correctas |
```

Se aceptan decimales con punto o coma, puntuaciones negativas y `<br>` para
crear saltos de línea dentro de una celda. Si necesitas escribir una barra
vertical dentro del texto, escápala como `\|`.

## Privacidad y seguridad

La extensión no envía datos a ningún servidor, no hace peticiones de red y no
guarda el texto pegado. Se carga en páginas HTTP/HTTPS porque cada instalación
de Moodle puede usar un dominio distinto, pero solo muestra su botón cuando
detecta el editor editable de rúbricas de Moodle.

## Compatibilidad

La extensión usa Manifest V3 y está pensada para navegadores basados en
Chromium. Su funcionamiento depende de la estructura interna del editor de
rúbricas de Moodle; si una versión futura de Moodle la cambia, puede ser
necesario adaptar `rubicon.js`.
