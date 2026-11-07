#!/usr/bin/env python3
"""Builds the single-file game: src/* -> docs/index.html (served by GitHub Pages)."""
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
html = f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Lernquest – Mathe, Luther und Kartoffel</title>
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
</body>
</html>
"""
out = ROOT / "docs" / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"built {out} ({len(html):,} bytes)")
