#!/usr/bin/env python3
"""src/* -> docs/index.html, docs/sw.js, docs/manifest.webmanifest"""
import hashlib
import json
import re
from pathlib import Path
ROOT = Path(__file__).parent
SRC = ROOT / "src"
# Load order: a file may use the globals of the files above it. One inner list = one <script>.
SCRIPTS = [
    ["logic.js"],
    ["jahrmarkt.js", "woerter.js", "english.js"],
    ["texte.js"],
    ["knowledge.js"],
    ["sachkunde.js"],
    ["sachkunde2.js", "sachkunde3.js", "ethik.js"],
    ["musik.js"],
    ["klasse12.js", "k12_mathe.js", "k12_deutsch.js", "k12_sachkunde.js", "k12_ethik.js"],
    ["monsters.js"],
    ["icons.js"],
    ["eltern.js"],
    ["qr.js", "savecode.js"],
    ["turm.js", "turmart.js"],
    ["units.js"],
]
# The game itself: the parts of src/app/ in this order inside one function, so they share its state (meta, run, mode).
APP = ["core", "storage", "progress", "ui", "tasks", "title", "backup", "map", "battle", "nodes", "collection", "huette",
       "duell", "turm", "turm_screens", "garten", "elternbereich", "feedback", "boot"]
def read(name):
    return (SRC / name).read_text(encoding="utf-8")
def source(name):
    """A file as the page gets it: without the line that exports it to the Node tests."""
    js = re.sub(r"if \(typeof module !== 'undefined'\) module\.exports = \w+;\n", "", read(name))
    if name == "monsters.js":
        # Baked, svgo-optimised monster art (npm run svg -> art/monsters/svg/*.svg); monsters.js prefers it over drawing at runtime.
        baked = {f.stem: f.read_text(encoding="utf-8").strip() for f in sorted((ROOT / "art" / "monsters" / "svg").glob("*.svg"))}
        assert baked, "art/monsters/svg/ is empty: run npm run svg"
        js = "const MONBAKED = " + json.dumps(baked, ensure_ascii=False).replace("</", "<\\/") + ";\n" + js
    return js
assert sorted(f for g in SCRIPTS for f in g) == sorted(f.name for f in SRC.glob("*.js") if f.name != "sw.js"), "build.py SCRIPTS must list every file in src/"
assert sorted(f"{n}.js" for n in APP) == sorted(f.name for f in (SRC / "app").glob("*.js")), "build.py APP must list every file in src/app/"
css = read("style.css")
scripts = "\n".join("<script>\n" + "\n".join(source(f) for f in group) + "\n</script>" for group in SCRIPTS)
app = "(() => {\n" + "".join(read(f"app/{n}.js") for n in APP) + "})();\n"
manifest = read("manifest.webmanifest")
sw_src = read("sw.js")

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
<title>Lernquest – Mathe, Deutsch, Englisch, Musik, Ethik und Sachkunde</title>
<meta name="description" content="Roguelike-Lernspiel für Grundschüler (Klasse 1 bis 3): Mathe, Deutsch, Englisch, Musik, Ethik und Sachkunde. Funktioniert offline.">
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
{scripts}
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
