#!/usr/bin/env python3
"""Builds the single-file game: src/* -> docs/index.html (served by GitHub Pages)."""
import hashlib
from pathlib import Path
ROOT = Path(__file__).parent
SRC = ROOT / "src"
def strip_exports(js, name):
    return js.replace(f"if (typeof module !== 'undefined') module.exports = {name};\n", "")
css = (SRC / "style.css").read_text(encoding="utf-8")
logic = strip_exports((SRC / "logic.js").read_text(encoding="utf-8"), "MQ")
know = strip_exports((SRC / "knowledge.js").read_text(encoding="utf-8"), "MK")
mon = strip_exports((SRC / "monsters.js").read_text(encoding="utf-8"), "MONART")
app = (SRC / "app.js").read_text(encoding="utf-8")
manifest = (SRC / "manifest.webmanifest").read_text(encoding="utf-8")
sw_src = (SRC / "sw.js").read_text(encoding="utf-8")
# build id = hash of everything the app ships; shared by page and service worker
h = hashlib.sha256()
for part in (css, logic, know, mon, app, manifest, sw_src):
    h.update(part.encode("utf-8"))
for f in sorted((ROOT / "docs" / "icons").glob("*")) + [ROOT / "docs" / "favicon.ico"]:
    if f.is_file():
        h.update(f.read_bytes())
build_id = h.hexdigest()[:12]
html = f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Lernquest – Mathe, Luther und Kartoffel</title>
<meta name="description" content="Roguelike-Lernspiel für Grundschüler: Mathe, Luther und Kartoffel. Funktioniert offline.">
<meta name="theme-color" content="#1C2541">
<meta name="color-scheme" content="dark">
<meta name="format-detection" content="telephone=no">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="icon" href="icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="application-name" content="Lernquest">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Lernquest">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="msapplication-TileColor" content="#1C2541">
<meta name="msapplication-TileImage" content="icons/icon-192.png">
<meta name="app-version" content="{build_id}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap">
<style>
{css}
</style>
</head>
<body>
<div id="app"></div>
<script>
{logic}
</script>
<script>
{know}
</script>
<script>
{mon}
</script>
<script>
{app}
</script>
<script>
/* Offline support + automatic updates (see src/sw.js) */
(function () {{
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const BUILD = '{build_id}';
  const loadedAt = Date.now();
  let pending = false;
  function refresh(v) {{
    // never loop: reload at most once per new version
    try {{ if (sessionStorage.getItem('lq-reloaded') === v) return; sessionStorage.setItem('lq-reloaded', v); }} catch (e) {{ }}
    location.reload();
  }}
  navigator.serviceWorker.addEventListener('message', (e) => {{
    const d = e.data;
    if (!d || d.type !== 'sw-activated' || d.version === BUILD) return;
    // newer version ready: apply now if the app was just opened or is in the
    // background; otherwise wait until it is put away (never mid-battle)
    if (document.hidden || Date.now() - loadedAt < 8000) refresh(d.version); else pending = d.version;
  }});
  document.addEventListener('visibilitychange', () => {{
    if (document.hidden) {{ if (pending) refresh(pending); return; }}
    // app brought back to the foreground: look for a new version
    navigator.serviceWorker.getRegistration().then((r) => r && r.update()).catch(() => {{}});
  }});
  addEventListener('load', () => navigator.serviceWorker.register('sw.js', {{ updateViaCache: 'none' }}).catch(() => {{}}));
}})();
</script>
</body>
</html>
"""
out = ROOT / "docs" / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"built {out} ({len(html):,} bytes)")

# PWA: manifest + service worker (cache version = hash of everything it caches)
(out.parent / "manifest.webmanifest").write_text(manifest, encoding="utf-8")
(out.parent / "sw.js").write_text(sw_src.replace("__VERSION__", build_id), encoding="utf-8")
print(f"built {out.parent / 'sw.js'} (version {build_id})")
