# Actualizar y cargar Rubicon en el navegador

## Preparar una nueva versión

1. Haz los cambios necesarios en `rubicon.js`, `rubicon.css`, la documentación
   o el resto de archivos.
2. Incrementa `version` en `manifest.json`. Usa tres números, por ejemplo
   `1.1.0`.
3. Comprueba que `manifest.json` sea válido y que JavaScript no tenga errores:

   ```sh
   node -e "JSON.parse(require('fs').readFileSync('manifest.json'))"
   node --check rubicon.js
   ```

4. Prueba la extensión descomprimida antes de distribuirla.

## Cargar o recargar la versión de desarrollo

1. Abre `chrome://extensions`, `edge://extensions` o
   `brave://extensions`.
2. Activa **Modo de desarrollador**.
3. Si Rubicon todavía no está instalado, pulsa **Cargar descomprimida** y
   selecciona la carpeta que contiene `manifest.json`.
4. Si ya está instalado, localiza Rubicon y pulsa **Recargar**.
5. Recarga también la página de Moodle. Los scripts que ya estaban abiertos no
   se actualizan hasta recargar la página.
6. Abre el editor de una rúbrica, importa una tabla, comprueba el resultado y
   verifica la opción **Deshacer importación** antes de guardar en Moodle.

## Generar el archivo ZIP

Ejecuta el siguiente comando desde la raíz del repositorio:

```sh
zip -r rubicon-1.1.0.zip manifest.json rubicon.js rubicon.css README.md \
  RUBRICA_EJEMPLO.md PROMPT_RUBRICA.md ACTUALIZAR_EXTENSION.md img
```

Cambia `1.1.0` por la versión indicada en `manifest.json`. El ZIP sirve para
distribuir la extensión, pero los navegadores Chromium normalmente requieren
descomprimirlo antes de usar **Cargar descomprimida**.

## Instalar el ZIP recibido

1. Descomprime el ZIP en una ubicación permanente.
2. Abre la página de extensiones y activa **Modo de desarrollador**.
3. Pulsa **Cargar descomprimida** y selecciona la carpeta que contiene
   `manifest.json`.

Para instalar una actualización distribuida de esta forma, sustituye los
archivos de la carpeta anterior por los nuevos, pulsa **Recargar** en la página
de extensiones y recarga Moodle.
