# One HTML file, built without a bundler

*Superseded by [0004](0004-es-modules-bundled-into-one-file.md): the one file stays, the globals and the load order went.*

Lernquest ships as a single `docs/index.html` that `tools/build.js` makes by putting the files of `src/` into `<script>`
tags in a fixed order; every file is one global (`MQ`, `MK`, `UNITS` …) and ends with a line that exports it to the
Node tests. We keep this instead of ES modules and a bundler: the page must run offline, from `file://` and for years
without a toolchain to maintain, and the tests can `require` a content file directly. The price is that load order is
part of the build (`SCRIPTS` in `tools/build.js`) and that a file reaches another through its global.
