import { MODES, MODE_KEYS } from '../curriculum.ts';
import { KEY_RUN_FOR, type Meta, clear, isObj, load, normMeta, save } from '../save.ts';
import { SAVECODE } from '../savecode.ts';
import { html } from '../ui/html.ts';
import { type Run, state } from './state.ts';
import { loadRun, saveAll } from './storage.ts';
import { MONTHS, askPin, screenTitle, setupDone } from './title.ts';
import { loadTurm } from './turm.ts';
import { modal } from './ui.ts';

/* ---------- Save code: export, import, merge ---------- */
export const SITE = 'https://thezieger.github.io/rogue-adventures/';
// what a save code holds: the save and the running adventures by unit
export interface Backup {
  at: string;
  meta: Meta;
  runs: Record<string, Run>;
}
const b64 = (bin: string) => btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const viaStream = (bytes: BufferSource, stream: CompressionStream | DecompressionStream) =>
  new Response(new Response(bytes).body!.pipeThrough(stream));
const canZip = (S: unknown) =>
  typeof S === 'function' && typeof Response === 'function' && typeof TextEncoder === 'function';
// a won adventure (and later a purchase) since the last export, which was more than 30 days ago
export const backupDue = () =>
  !!state.meta.progressAt &&
  state.meta.progressAt > state.meta.backupAt &&
  !(Date.now() - Date.parse(state.meta.backupAt) < 30 * 864e5);
// short: for the QR code, without answer history and running adventures
export function saveData(short: boolean) {
  const m: Meta = JSON.parse(JSON.stringify(state.meta));
  const runs: Backup['runs'] = {};
  // unpractised task types are left out: loading fills them in again with empty stats
  for (const g of Object.values(m.stats))
    for (const [k, st] of Object.entries(g)) {
      if (!st.t) delete g[k];
      else if (short) st.hist = [];
    }
  if (short)
    delete (m as Partial<Meta>).weekly; // only this week's progress, the QR has no room for it
  else
    for (const g of MODE_KEYS.concat('turm')) {
      const r = load(KEY_RUN_FOR(g), null);
      if (r) runs[g] = r;
    }
  return { v: 1, at: new Date().toISOString(), meta: m, runs };
}
// LQ0: JSON, for browsers without compression; LQ1: deflated JSON from older versions; LQ2: deflated SAVECODE.shrink(data).
// Codes stay out there for years, so every one of them must keep loading.
// a save is plain JSON, which its interfaces (no index signature) cannot show
type Json = Parameters<typeof SAVECODE.shrink>[0];
export async function packSave(data: Backup) {
  if (canZip(window.CompressionStream))
    try {
      const buf = new Uint8Array(
        await viaStream(
          new TextEncoder().encode(JSON.stringify(SAVECODE.shrink(data as unknown as Json))),
          new CompressionStream('deflate-raw'),
        ).arrayBuffer(),
      );
      let bin = '';
      for (const b of buf) bin += String.fromCharCode(b);
      return 'LQ2.' + b64(bin);
    } catch (e) {
      /* browsers before 2023 know only gzip and deflate */
    }
  return 'LQ0.' + b64(unescape(encodeURIComponent(JSON.stringify(data))));
}
const unb64 = (s: string) => atob(s.replace(/-/g, '+').replace(/_/g, '/'));
// the same code for the QR code: „LQ2:“ and base 42, which the QR code packs tighter than base64
export const qrCode = (code: string) =>
  code.startsWith('LQ2.')
    ? 'LQ2:' + SAVECODE.to42(Uint8Array.from(unb64(code.slice(4)), (c) => c.charCodeAt(0)))
    : code;
// accepts the code or the whole link; rejects with a message for parents
export async function unpackSave(text: string): Promise<Backup> {
  const bad = new Error('Das ist kein vollständiger Lernquest-Code. Bitte den ganzen Code kopieren und einfügen.');
  const m = /^LQ([012])([.:])([\w$*./:-]+)$/.exec(
    String(text)
      .replace(/\s+/g, '')
      .replace(/^.*[#&]lade=/, ''),
  );
  if (!m || (m[2] === ':' && m[1] !== '2')) throw bad;
  if (m[1] !== '0' && !canZip(window.DecompressionStream))
    throw new Error(
      'Dieser Browser kann den Code nicht lesen. Bitte den Browser aktualisieren oder den Code auf einem anderen Gerät einfügen.',
    );
  let d;
  try {
    const bin = m[2] === '.' ? unb64(m[3]) : '';
    const bytes = m[2] === ':' ? SAVECODE.from42(m[3]) : Uint8Array.from(bin, (c) => c.charCodeAt(0));
    d = JSON.parse(
      m[1] === '0'
        ? decodeURIComponent(escape(bin))
        : await viaStream(bytes, new DecompressionStream('deflate-raw')).text(),
    );
    if (m[1] === '2') d = SAVECODE.grow(d);
  } catch (e) {
    throw bad;
  }
  if (!isObj(d) || d.v !== 1 || !isObj(d.meta)) throw bad;
  return { at: typeof d.at === 'string' ? d.at : '', meta: normMeta(d.meta), runs: isObj(d.runs) ? d.runs : {} };
}
const okKnow = (q: unknown) => isObj(q) && Number.isFinite(q.c) && Number.isFinite(q.t);
// dev = this device, inc = from the code (both normalised): nothing that was reached on either device gets lost
export function mergeMeta(dev: Meta, inc: Meta) {
  const m: Meta = JSON.parse(JSON.stringify(dev));
  for (const k of ['runs', 'wins', 'bestWorld', 'knowSeq', 'stamps', 'stampsTotal'])
    if (Number.isFinite(inc[k])) m[k] = Math.max(Number.isFinite(m[k]) ? m[k] : 0, inc[k]);
  for (const k of ['dex', 'owned', 'seenTut', 'evoUnlocked', 'stampCard', 'worn'])
    if (isObj(inc[k])) {
      if (!isObj(m[k])) m[k] = {};
      for (const [id, v] of Object.entries(inc[k]))
        m[k][id] = !(id in m[k]) ? v : k === 'stampCard' ? Math.max(m[k][id], v) : m[k][id];
    }
  for (const g of MODE_KEYS)
    for (const [k, st] of Object.entries(m.stats[g])) {
      st.c += inc.stats[g][k].c;
      st.t += inc.stats[g][k].t;
    }
  for (const [id, q] of Object.entries(inc.know)) {
    if (!okKnow(q)) continue;
    const d = m.know[id];
    m.know[id] = okKnow(d)
      ? Object.assign({}, (q.last || 0) > (d.last || 0) ? q : d, { c: d.c + q.c, t: d.t + q.t })
      : q;
  }
  if (inc.progressAt > m.progressAt) m.progressAt = inc.progressAt;
  for (const [g, n] of Object.entries(inc.started)) m.started[g] = Math.max(m.started[g] || 0, n);
  for (const [k, v] of Object.entries(inc.materials)) m.materials[k] = Math.max(m.materials[k] || 0, v);
  for (const [g, L] of Object.entries(inc.level)) {
    const d = (m.level[g] = Object.assign({}, m.level[g]));
    for (const [k, t] of Object.entries(L)) d[k] = Math.max(d[k] || 0, t);
  }
  m.garden.beds.forEach((b, i) => {
    if (!b.crop) m.garden.beds[i] = inc.garden.beds[i];
  });
  // the fuller pantry, not both: a code exported from this device would otherwise double what is in it
  if (inc.pantry.length > m.pantry.length) m.pantry = inc.pantry.slice();
  m.hut.rooms = Math.max(m.hut.rooms, inc.hut.rooms);
  m.hut.items = [...new Set(m.hut.items.concat(inc.hut.items))];
  const dw = m.weekly,
    iw = inc.weekly;
  if (iw.week > dw.week) m.weekly = JSON.parse(JSON.stringify(iw));
  else if (iw.week === dw.week) {
    dw.progress = Array.from({ length: Math.max(dw.progress.length, iw.progress.length) }, (_, i) =>
      Math.max(dw.progress[i] || 0, iw.progress[i] || 0),
    );
    dw.done = dw.done || iw.done;
    dw.beaten = [...new Set(dw.beaten.concat(iw.beaten))];
    for (const [k, v] of Object.entries(iw.tally)) {
      const d = dw.tally[k] || { c: 0, t: 0 };
      dw.tally[k] = { c: d.c + v.c, t: d.t + v.t };
    }
  }
  // a device without PIN was not set up yet, so it takes the settings from the code
  const dt = m.turm,
    it = inc.turm;
  for (const k of ['runs', 'wins', 'best']) dt[k] = Math.max(dt[k], it[k]);
  if (!Object.keys(dt.last).length) dt.last = it.last;
  if (!dev.pin && inc.pin) {
    for (const k of ['off', 'hidden', 'sound', 'speak', 'grade', 'pin', 'setup']) m[k] = inc[k];
    dt.subjects = it.subjects;
    dt.on = it.on;
  }
  return m;
}
export function applySave(s: Backup, how: 'merge' | 'replace') {
  state.meta = how === 'replace' ? s.meta : mergeMeta(state.meta, s.meta);
  for (const g of MODE_KEYS.concat('turm')) {
    const r = s.runs[g];
    if (how === 'replace') {
      if (isObj(r)) save(KEY_RUN_FOR(g), r);
      else clear(KEY_RUN_FOR(g));
    } else if (isObj(r) && !(g === 'turm' ? loadTurm() : loadRun(g))) save(KEY_RUN_FOR(g), r);
  }
  state.run = null;
  saveAll();
  if (!state.meta.setup.done && !state.meta.setup.skipped) setupDone('skipped'); // loading a save replaces the setup dialog
  screenTitle();
}
export function summaryHtml(s: Backup) {
  const open = MODE_KEYS.filter((g) => isObj(s.runs[g]))
    .map((g) => MODES[g].title)
    .concat(isObj(s.runs.turm) ? ['Turmwacht'] : []);
  const d = new Date(s.at);
  return html`<ul class="sumlist">${[
    Number.isFinite(s.meta.stamps) ? `🏷 ${s.meta.stamps} Stempel` : '',
    `${s.meta.wins} ${s.meta.wins === 1 ? 'Sieg' : 'Siege'}`,
    `${Object.keys(s.meta.dex).length} im Monsterbuch`,
    open.length ? `Laufende Abenteuer: ${open.join(', ')}` : 'Kein laufendes Abenteuer',
    isNaN(d as unknown as number) ? '' : `Gesichert am ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
  ]
    .filter(Boolean)
    .map((t) => html`<li>${t}</li>`)}</ul>`;
}
function askImport(s: Backup) {
  const go = (how: 'merge' | 'replace') => () => {
    ov.remove();
    askPin(() => applySave(s, how));
  };
  const ov = modal(
    html`<h2>Spielstand gefunden</h2>${summaryHtml(s)}<p>Zusammenlegen behält alles auf diesem Gerät und nimmt dazu, was im Code mehr ist. Ersetzen überschreibt alles auf diesem Gerät.</p><div class="stack"><button class="btn" id="imerge" data-action="merge">Zusammenlegen</button><button class="btn secondary" id="ireplace" data-action="replace">Ersetzen</button><button class="btn secondary" id="ino" data-action="no">Nicht laden</button></div>`,
    { merge: go('merge'), replace: go('replace'), no: () => ov.remove() },
  );
}
export function importFromLink() {
  const h = location.hash;
  if (!h.startsWith('#lade=')) return;
  try {
    history.replaceState(null, '', location.pathname + location.search);
  } catch (e) {
    /* file:// in some browsers */
  }
  unpackSave(h).then(askImport, (e) => {
    const ov = modal(
      html`<h2>Spielstand nicht geladen</h2><p>${e.message}</p><button class="btn" id="iok" data-action="ok">OK</button>`,
      { ok: () => ov.remove() },
    );
  });
}
