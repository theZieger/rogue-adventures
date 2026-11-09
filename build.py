#!/usr/bin/env python3
"""src/* -> docs/index.html, docs/sw.js, docs/manifest.webmanifest"""
import hashlib
import json
import re
from pathlib import Path
ROOT = Path(__file__).parent
SRC = ROOT / "src"
def strip_exports(js, name):
    return js.replace(f"if (typeof module !== 'undefined') module.exports = {name};\n", "")
css = (SRC / "style.css").read_text(encoding="utf-8")
logic = strip_exports((SRC / "logic.js").read_text(encoding="utf-8"), "MQ")
know = strip_exports((SRC / "knowledge.js").read_text(encoding="utf-8"), "MK")
mon = strip_exports((SRC / "monsters.js").read_text(encoding="utf-8"), "MONART")
# Baked, svgo-optimised monster art (npm run svg -> art/monsters/svg/*.svg); monsters.js prefers it over drawing at runtime.
baked = {f.stem: f.read_text(encoding="utf-8").strip() for f in sorted((ROOT / "art" / "monsters" / "svg").glob("*.svg"))}
assert baked, "art/monsters/svg/ is empty: run npm run svg"
mon = "const MONBAKED = " + json.dumps(baked, ensure_ascii=False).replace("</", "<\\/") + ";\n" + mon
app = (SRC / "app.js").read_text(encoding="utf-8")
manifest = (SRC / "manifest.webmanifest").read_text(encoding="utf-8")
sw_src = (SRC / "sw.js").read_text(encoding="utf-8")

# -> [{"date": "2026-11-07", "groups": [{"title": "Neu", "items": ["..."]}]}]
GROUPS = ["Neu", "Verbessert", "Behoben"]
def parse_changelog(text):
    """Strict: everything after the first date heading must be a date, a known group or a "- " line."""
    entries = []
    for n, line in enumerate(text.splitlines(), 1):
        if m := re.fullmatch(r"## (\d{4}-\d{2}-\d{2})\s*", line):
            entries.append({"date": m.group(1), "groups": []})
        elif not entries or not line.strip():
            continue
        elif m := re.fullmatch(r"### (.+?)\s*", line):
            assert m.group(1) in GROUPS, f"CHANGELOG.md:{n}: group must be one of {GROUPS}, got {m.group(1)!r}"
            entries[-1]["groups"].append({"title": m.group(1), "items": []})
        elif (m := re.fullmatch(r"- (.+?)\s*", line)) and entries[-1]["groups"]:
            entries[-1]["groups"][-1]["items"].append(m.group(1))
        else:
            raise AssertionError(f"CHANGELOG.md:{n}: unexpected line (one '- ' line per point, no line breaks): {line!r}")
    for e in entries:
        titles = [g["title"] for g in e["groups"]]
        assert titles == [t for t in GROUPS if t in titles], f"CHANGELOG.md {e['date']}: groups must be in the order {GROUPS}"
        assert all(g["items"] for g in e["groups"]), f"CHANGELOG.md {e['date']}: empty group"
    dates = [e["date"] for e in entries]
    assert dates == sorted(dates, reverse=True), "CHANGELOG.md: dates must be newest first"
    assert len(set(dates)) == len(dates), "CHANGELOG.md: each date only once"
    return entries
changelog = parse_changelog((ROOT / "CHANGELOG.md").read_text(encoding="utf-8"))
changelog_js = json.dumps(changelog, ensure_ascii=False).replace("</", "<\\/")

# iOS launch screens from tools/make_icons.js
splash_tags = []
for f in sorted((ROOT / "docs" / "splash").glob("splash-*.png")):
    m = re.fullmatch(r"splash-(\d+)x(\d+)@(\d)-(portrait|landscape)\.png", f.name)
    if m:
        w, hh, r, o = m.groups()
        splash_tags.append(f'<link rel="apple-touch-startup-image" href="splash/{f.name}" '
                           f'media="(device-width: {w}px) and (device-height: {hh}px) and '
                           f'(-webkit-device-pixel-ratio: {r}) and (orientation: {o})">')
splash = "\n".join(splash_tags)
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
<meta name="app-version" content="__BUILD__">
{splash}
<link rel="preload" href="fonts/andika-700-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/patrickhand-latin.woff2" as="font" type="font/woff2" crossorigin>
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
const CHANGELOG = {changelog_js};
</script>
<script>
{app}
</script>
<script>
(function () {{
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const BUILD = '__BUILD__';
  const loadedAt = Date.now();
  let pending = false;
  function refresh(v) {{
    try {{ if (sessionStorage.getItem('lq-reloaded') === v) return; sessionStorage.setItem('lq-reloaded', v); }} catch (e) {{ }}
    location.reload();
  }}
  navigator.serviceWorker.addEventListener('message', (e) => {{
    const d = e.data;
    if (!d || d.type !== 'sw-activated' || d.version === BUILD) return;
    // update now only if just opened or in background, never mid-battle
    if (document.hidden || Date.now() - loadedAt < 8000) refresh(d.version); else pending = d.version;
  }});
  document.addEventListener('visibilitychange', () => {{
    if (document.hidden) {{ if (pending) refresh(pending); return; }}
    navigator.serviceWorker.getRegistration().then((r) => r && r.update()).catch(() => {{}});
  }});
  addEventListener('load', () => navigator.serviceWorker.register('sw.js', {{ updateViaCache: 'none' }}).catch(() => {{}}));
}})();
</script>
</body>
</html>
"""
# build id = hash of everything shipped; page and worker compare it to detect updates
h = hashlib.sha256()
for part in (html, manifest, sw_src):
    h.update(part.encode("utf-8"))
for f in sorted((ROOT / "docs").glob("icons/*")) + sorted((ROOT / "docs").glob("splash/*")) + sorted((ROOT / "docs").glob("fonts/*")) + sorted((ROOT / "docs").glob("sounds/*")) + [ROOT / "docs" / "favicon.ico"]:
    if f.is_file():
        h.update(f.read_bytes())
build_id = h.hexdigest()[:12]
html = html.replace("__BUILD__", build_id)
out = ROOT / "docs" / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"built {out} ({len(html):,} bytes)")

(out.parent / "manifest.webmanifest").write_text(manifest, encoding="utf-8")
(out.parent / "sw.js").write_text(sw_src.replace("__VERSION__", build_id), encoding="utf-8")
print(f"built {out.parent / 'sw.js'} (version {build_id})")
