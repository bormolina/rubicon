# Prompt para convertir una rúbrica al formato de Rubicon

Cuando el modelo ya conozca la rúbrica y estés conforme con su contenido,
envíale este mensaje:

```text
La rúbrica que acabamos de preparar ya está aprobada. Devuélvemela ahora en el
formato Markdown vertical de Rubicon.

Usa exactamente estas cuatro columnas y en este orden:

| Criterio | Nivel | Puntos | Descripción |
|---|---|---:|---|

Escribe una fila por cada nivel. Repite el nombre del criterio en todas sus
filas. Cada criterio puede tener su propio número de niveles. En Puntos escribe
solo un número; usa punto para los decimales. En Descripción incluye únicamente
el descriptor observable de ese nivel, sin repetir el nombre del criterio ni
el nombre del nivel.

No cambies, resumas ni completes el contenido aprobado. No añadas introducción,
explicaciones, notas ni una conclusión. Devuelve únicamente la tabla Markdown,
sin envolverla en un bloque de código.
```

Rubicon también acepta dejar vacía la celda `Criterio` después de la primera
fila de cada criterio, pero pedir que se repita hace que la respuesta sea más
robusta y fácil de revisar o reordenar.
