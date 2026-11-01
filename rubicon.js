/* Extensión Rubicon para el editor de rúbricas de Moodle.
   Añade un botón para pegar una tabla Markdown. No guarda en el servidor.
   Cada encabezado de nivel debe terminar en puntos entre paréntesis: Bien (1).
   Para puntos distintos por criterio, empieza la celda por [2.5].
   Las filas existentes se sustituyen tras confirmar. */
(() => {
  'use strict';
  if (window.__rubiconMoodleExtension) return;
  window.__rubiconMoodleExtension = true;

  function getMoodleEditor() {
    const editor = window.M?.gradingform_rubriceditor;
    const name = editor?.name;
    const templates = editor?.templates?.[name];
    const root = document.getElementById(`rubric-${name}`);
    const table = document.getElementById(`${name}-criteria`);
    if (!root?.classList.contains('editable') || !table || !templates?.criterion || !templates?.level) return null;
    return { editor, name, templates, root, table };
  }

  function openImporter(context) {
  const { editor, name, templates, root, table } = context;
  if (document.getElementById('importar-rubrica-md')) return;
  const dialog = document.createElement('dialog');
  dialog.id = 'importar-rubrica-md';
  // Solo contenido fijo; la tabla pegada se trata como texto.
  dialog.innerHTML = `<h2>Importar rúbrica Markdown</h2>
    <p>Una fila por criterio. Encabezados: Insuficiente (0), Bien (1), Excelente (2).</p>
    <p>Para cambiar los puntos de una celda concreta: <code>[1.5] Descripción</code>.</p>
    <textarea rows="12" aria-label="Tabla Markdown"></textarea>
    <pre style="white-space:pre-wrap" role="status"></pre>
    <div class="rubicon-actions">
      <button type="button" class="btn btn-secondary" data-action="check">Comprobar</button>
      <button type="button" class="btn btn-primary" data-action="fill">Rellenar Moodle</button>
      <button type="button" class="btn btn-secondary" data-action="close">Cerrar</button>
    </div>`;
  const input = dialog.querySelector('textarea');
  input.placeholder = '| Criterio | Insuficiente (0) | Bien (1) | Excelente (2) |\n|---|---|---|---|\n| Contenido | Incompleto | Correcto | Completo |';
  const status = dialog.querySelector('[role=status]');
  function cells(line) {
    let s = line.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (/(?<!\\)\|$/.test(s)) s = s.slice(0, -1);
    const result = []; let current = '';
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '\\' && s[i + 1] === '|') { current += '|'; i++; }
      else if (s[i] === '|') { result.push(current.trim()); current = ''; }
      else current += s[i];
    }
    result.push(current.trim());
    return result;
  }
  function parse(text) {
    const lines = text.trim().replace(/^```(?:markdown|md)?\s*\n/i, '').replace(/\n```\s*$/, '').split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 3) throw Error('Pega la cabecera, la línea separadora y al menos un criterio.');
    const headers = cells(lines[0]);
    const sep = cells(lines[1]);
    if (headers.length < 3 || sep.length !== headers.length || !sep.every(s => /^:?-{3,}:?$/.test(s))) throw Error('Tabla Markdown inválida: comprueba la cabecera y la línea |---|---|…|.');
    const defaults = headers.slice(1).map(h => {
      const m = h.match(/\((-?\d+(?:[.,]\d+)?)\)\s*$/);
      if (!m) throw Error(`Faltan puntos en «${h}». Ejemplo: Excelente (2).`);
      return Number(m[1].replace(',', '.'));
    });
    const rows = lines.slice(2).map((line, i) => {
      const c = cells(line);
      if (c.length !== headers.length || !c[0]) throw Error(`Fila ${i + 1}: número de celdas incorrecto o criterio vacío.`);
      const levels = c.slice(1).map((value, j) => {
        const m = value.match(/^\[(-?\d+(?:[.,]\d+)?)\]\s*/);
        const score = m ? Number(m[1].replace(',', '.')) : defaults[j];
        const definition = (m ? value.slice(m[0].length) : value).replace(/<br\s*\/?\s*>/gi, '\n');
        if (!definition) throw Error(`Fila ${i + 1}, nivel ${j + 1}: descripción vacía.`);
        return { score, definition };
      });
      if (new Set(levels.map(l => l.score)).size !== levels.length) throw Error(`Fila ${i + 1}: hay puntuaciones repetidas.`);
      return { description: c[0], levels };
    });
    return rows;
  }
  function summary(rows) {
    return `${rows.length} criterios · ${rows[0].levels.length} niveles por criterio\nSuma de máximos: ${Number(rows.reduce((n, r) => n + Math.max(...r.levels.map(l => l.score)), 0).toFixed(8))} puntos.`;
  }
  function build(rows) {
    let next = Date.now();
    const fragment = document.createDocumentFragment();
    rows.forEach((row, i) => {
      const cid = `NEWID${next++}`;
      const levels = row.levels.map((level, j) => templates.level
        .replaceAll('{LEVEL-id}', `NEWID${next++}`)
        .replaceAll('{LEVEL-score}', String(level.score))
        .replaceAll('{LEVEL-index}', String(j + 1))).join('');
      const html = templates.criterion.replace('{LEVELS}', levels)
        .replaceAll('{CRITERION-id}', cid).replace(/\{[^{}]+\}/g, '');
      const staging = document.createElement('tbody');
      staging.innerHTML = html;
      const tr = staging.querySelector('tr.criterion');
      if (!tr) throw Error('La plantilla de Moodle no tiene la estructura esperada.');
      tr.querySelector('textarea[name$="[description]"]').value = row.description;
      tr.querySelector('input[name$="[sortorder]"]').value = String(i + 1);
      const levelNodes = tr.querySelectorAll('td.level');
      if (levelNodes.length !== row.levels.length) throw Error('No se han creado todos los niveles.');
      levelNodes.forEach((node, j) => {
        node.querySelector('textarea').value = row.levels[j].definition;
        node.querySelector('input[name$="[score]"]').value = String(row.levels[j].score);
      });
      fragment.append(tr);
    });
    return fragment;
  }
  dialog.addEventListener('click', e => {
    const action = e.target.dataset.action;
    if (action === 'close') { dialog.close(); return; }
    if (!['check', 'fill'].includes(action)) return;
    try {
      const rows = parse(input.value);
      status.textContent = summary(rows);
      if (action === 'check') return;
      const fragment = build(rows); // Validar todo antes de tocar el formulario.
      if (!confirm(`${summary(rows)}\n\nSe sustituirá el contenido actual de la rúbrica. No se guardará hasta que pulses Guardar en Moodle. ¿Continuar?`)) return;
      editor.disablealleditors();
      const parent = table.tBodies[0] || table;
      const old = [...parent.children].filter(el => el.matches('tr.criterion'));
      const restore = () => {
        parent.querySelectorAll(':scope > tr.criterion').forEach(el => el.remove());
        old.forEach(el => parent.append(el));
        editor.addhandlers(); editor.disablealleditors();
      };
      try {
        old.forEach(el => el.remove());
        parent.append(fragment);
        editor.assignclasses(`#rubric-${name} .criterion`);
        parent.querySelectorAll(':scope > tr.criterion').forEach(tr => editor.assignclasses(`#${tr.id} .level`));
        editor.addhandlers(); editor.disablealleditors();
      } catch (error) { restore(); throw error; }
      const undo = document.createElement('button');
      document.getElementById('rubicon-undo-import')?.remove();
      undo.id = 'rubicon-undo-import'; undo.className = 'btn btn-secondary';
      undo.type = 'button'; undo.textContent = 'Deshacer importación (antes de guardar)';
      undo.addEventListener('click', () => { restore(); undo.remove(); }, { once: true });
      root.prepend(undo);
      dialog.close();
      console.info('Rúbrica rellenada. Revisa los textos y puntos y guarda desde Moodle.');
    } catch (error) { status.textContent = `Error: ${error.message}`; }
  });
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog); dialog.showModal();
  }

  function installButton() {
    const context = getMoodleEditor();
    if (!context || document.getElementById('rubicon-open-importer')) return false;
    const button = document.createElement('button');
    button.id = 'rubicon-open-importer';
    button.type = 'button';
    button.className = 'btn btn-primary';
    button.textContent = 'Importar rúbrica Markdown';
    button.addEventListener('click', () => {
      const current = getMoodleEditor();
      if (current) openImporter(current);
      else alert('El editor de rúbricas ya no está disponible. Recarga la página e inténtalo de nuevo.');
    });
    context.root.before(button);
    return true;
  }

  if (!installButton()) {
    const observer = new MutationObserver(() => {
      if (installButton()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
