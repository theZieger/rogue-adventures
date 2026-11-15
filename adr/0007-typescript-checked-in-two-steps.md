# TypeScript everywhere, strictness in two steps

Every file of `src/` except the service worker is TypeScript. Node runs the files as they are (it strips the
types), esbuild bundles them, and `tsc` only checks. `tsc` runs strict with one exception, `noImplicitAny`: a
parameter without a type is still allowed, because the content and screen files were typed from working JavaScript
and annotating thousands of parameters by hand would have added noise before it added safety. What is fully typed
today is the save (`Meta` in `src/save.ts`), the curriculum, the save code, the QR code and the shape of the
shared state. Known gaps, each named where it lives: the running adventure (`Run` in `src/app/state.ts`) and the
unit files' fields (`Untyped` in `src/curriculum.ts`) are `any`, and `$()` promises an element that a screen has just
rendered. The next step is to switch `noImplicitAny` on, file by file.
