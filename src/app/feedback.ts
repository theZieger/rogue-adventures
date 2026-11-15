import { html, raw } from '../ui/html.ts';
import { $, app } from './core.ts';
import { state } from './state.ts';
import { screenTitle } from './title.ts';
import { screen, topbar } from './ui.ts';

/* ---------- Feedback ---------- */
// The only external request. If sending fails, the prefilled form opens in a new tab.
const FEEDBACK = {
  form: 'https://docs.google.com/forms/d/e/1FAIpQLSdJcDUJ8kqJWKyu5Y1UFrFHS0kRMuELfxjrACJxYK8k-QXDbw',
  entry: 'entry.1794178349',
};
const thanks = () =>
  html`<div class="screen">${raw(topbar('Danke'))}<div class="scroll"><div class="card center"><div style="font-size:var(--text-48)" aria-hidden="true">💌</div><h2>Danke für deine Nachricht!</h2><p>Sie ist angekommen. Vielleicht steht deine Idee bald unter „Was ist neu?“.</p></div></div><div class="bottom"><button class="btn" id="back" data-action="back">Zurück</button></div></div>`;

const KINDS = ['💡 Idee', '🐞 Fehler', '❤️ Lob'];

export function screenFeedback(back: () => void) {
  state.depth++;
  back = typeof back === 'function' ? back : screenTitle;
  let kind = KINDS[0];
  let sending = false;
  const text = () => $<HTMLTextAreaElement>('#fbtext').value.trim();
  const version = () => document.querySelector<HTMLMetaElement>('meta[name=app-version]')?.content || '?';
  const body = () => `${kind}: ${text()}\n\n(Lernquest, Version ${version()})`;
  const formLink = () => `${FEEDBACK.form}/viewform?usp=pp_url&${FEEDBACK.entry}=${encodeURIComponent(body())}`;

  function choose(button: HTMLElement) {
    kind = button.dataset.kind!;
    for (const other of app.querySelectorAll<HTMLElement>('[data-kind]')) {
      other.classList.toggle('on', other === button);
      other.setAttribute('aria-pressed', String(other === button));
    }
  }

  async function send() {
    if (sending) return;
    if (!text()) {
      $('#fbtext').focus();
      $('#fbmsg').textContent = 'Bitte zuerst etwas hineinschreiben 🙂';
      return;
    }
    sending = true;
    $<HTMLButtonElement>('#fbsend').disabled = true;
    $('#fbsend').textContent = 'Wird gesendet …';
    try {
      if (navigator.onLine === false) throw new Error('offline');
      // no-cors: the response can't be read, but the request arrives
      await fetch(`${FEEDBACK.form}/formResponse`, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({ [FEEDBACK.entry]: body() }),
      });
      screen(thanks(), { back });
    } catch (e) {
      sending = false;
      $<HTMLButtonElement>('#fbsend').disabled = false;
      $('#fbsend').textContent = 'Nochmal versuchen';
      $('#fbmsg').innerHTML =
        html`Das hat nicht geklappt – bist du mit dem Internet verbunden? Dein Text bleibt hier stehen. <a href="${formLink()}" target="_blank" rel="noopener">Oder im Formular senden ↗</a>`.text;
    }
  }

  screen(
    html`<div class="screen">${raw(topbar('Idee oder Fehler melden'))}<div class="scroll"><div class="card"><p style="margin-top:0">Hast du eine Idee, einen Wunsch oder einen Fehler gefunden? Schreib es hier auf!</p>
      <div class="toggles" role="group" aria-label="Was ist es?">${KINDS.map((name, i) => html`<button class="chip ${i ? '' : 'on'}" data-action="choose" data-kind="${name}" aria-pressed="${String(!i)}">${name}</button>`)}</div>
      <label for="fbtext" class="sr-only">Deine Nachricht</label><textarea id="fbtext" rows="6" maxlength="2000" placeholder="Zum Beispiel: Ich wünsche mir Aufgaben zum Einmaleins mit 7 …"></textarea>
      <p class="muted" style="color:var(--ink-soft);font-size:var(--text-16)">Bitte keine Namen, Adressen oder Telefonnummern hineinschreiben.</p><p id="fbmsg" role="status" aria-live="polite" class="fbmsg"></p></div></div>
      <div class="bottom"><div class="stack"><button class="btn" id="fbsend" data-action="send">Absenden</button><button class="btn ghost" id="back" data-action="back">Zurück</button></div></div></div>`,
    { choose, send, back },
  );
}
