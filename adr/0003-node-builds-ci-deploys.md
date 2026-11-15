# One toolchain builds, CI deploys

The build is `tools/build.js` (Node), and the files it makes (`docs/index.html`, `docs/sw.js`,
`docs/manifest.webmanifest`) are not committed: CI builds them on every push to `main`, tests them and deploys
`docs/` to GitHub Pages. Before, a Python script built them and they were committed, which asked contributors for
two toolchains, put a 4 MB generated file into most commits and needed a CI check that `docs/` matched `src/`.
`art/monsters/` stays committed because its hashes are what lets svgo skip unchanged monsters. The price is that
the repository alone no longer holds a runnable page: it takes `npm run build`, or the deployed site.
