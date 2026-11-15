/* ---------- Feedback ---------- */
// The only external request. If sending fails, the prefilled form opens in a new tab.
const FEEDBACK = {
  form: 'https://docs.google.com/forms/d/e/1FAIpQLSdJcDUJ8kqJWKyu5Y1UFrFHS0kRMuELfxjrACJxYK8k-QXDbw',
  entry: 'entry.1794178349',
};
function screenFeedback(back) {
  depth++;
  back = typeof back === 'function' ? back : screenTitle;
  render(`<div class="screen">${topbar('Idee oder Fehler melden')}<div class="scroll"><div class="card"><p style="margin-top:0">Hast du eine Idee, einen Wunsch oder einen Fehler gefunden? Schreib es hier auf!</p>
      <div class="toggles" role="group" aria-label="Was ist es?">${['💡 Idee', '🐞 Fehler', '❤️ Lob'].map((t, i) => `<button class="toggle ${i ? '' : 'on'}" data-kind="${t}" aria-pressed="${!i}">${t}</button>`).join('')}</div>
      <label for="fbtext" class="sr-only">Deine Nachricht</label><textarea id="fbtext" rows="6" maxlength="2000" placeholder="Zum Beispiel: Ich wünsche mir Aufgaben zum Einmaleins mit 7 …"></textarea>
      <p class="muted" style="color:var(--ink-soft);font-size:15px">Bitte keine Namen, Adressen oder Telefonnummern hineinschreiben.</p><p id="fbmsg" role="status" aria-live="polite" class="fbmsg"></p></div></div>
      <div class="bottom"><div class="stack"><button class="btn" id="fbsend">Absenden</button><button class="btn ghost" id="back">Zurück</button></div></div></div>`);
  let kind = '💡 Idee';
  let sending = false;
  app.querySelectorAll('[data-kind]').forEach((b) => {
    b.onclick = () => {
      kind = b.dataset.kind;
      app.querySelectorAll('[data-kind]').forEach((x) => {
        x.classList.toggle('on', x === b);
        x.setAttribute('aria-pressed', x === b);
      });
    };
  });
  const text = () => $('#fbtext').value.trim();
  const body = () =>
    `${kind}: ${text()}\n\n(Lernquest, Version ${(document.querySelector('meta[name=app-version]') || {}).content || '?'})`;
  const formLink = () => `${FEEDBACK.form}/viewform?usp=pp_url&${FEEDBACK.entry}=${encodeURIComponent(body())}`;
  $('#back').onclick = () => back();
  $('#fbsend').onclick = async () => {
    if (sending) return;
    if (!text()) {
      $('#fbtext').focus();
      $('#fbmsg').textContent = 'Bitte zuerst etwas hineinschreiben 🙂';
      return;
    }
    sending = true;
    $('#fbsend').disabled = true;
    $('#fbsend').textContent = 'Wird gesendet …';
    try {
      if (navigator.onLine === false) throw new Error('offline');
      // no-cors: the response can't be read, but the request arrives
      await fetch(`${FEEDBACK.form}/formResponse`, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({ [FEEDBACK.entry]: body() }),
      });
      render(
        `<div class="screen">${topbar('Danke')}<div class="scroll"><div class="card center"><div style="font-size:56px" aria-hidden="true">💌</div><h2>Danke für deine Nachricht!</h2><p>Sie ist angekommen. Vielleicht steht deine Idee bald unter „Was ist neu?“.</p></div></div><div class="bottom"><button class="btn" id="back">Zurück</button></div></div>`,
      );
      $('#back').onclick = () => back();
    } catch (e) {
      sending = false;
      $('#fbsend').disabled = false;
      $('#fbsend').textContent = 'Nochmal versuchen';
      $('#fbmsg').innerHTML =
        `Das hat nicht geklappt – bist du mit dem Internet verbunden? Dein Text bleibt hier stehen. <a href="${esc(formLink())}" target="_blank" rel="noopener">Oder im Formular senden ↗</a>`;
    }
  };
}
