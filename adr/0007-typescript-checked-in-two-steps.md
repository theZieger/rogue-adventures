# TypeScript everywhere, strict

Every file of `src/` except the service worker is TypeScript. Node runs the files as they are (it strips the
types), esbuild bundles them, and `tsc` only checks: strict, with nothing switched off. The types went in on top of
working JavaScript and were proven not to touch it: with the types erased, every file is byte for byte the
JavaScript it was before.

A handful of `any` remain, each named and explained where it lives: data that has just been read from storage and
not yet repaired (`Unchecked` in `src/save.ts`, `fixTurm` in `src/app/turm.ts`), and the generated task inside a
Turmwacht monster. New code does not add to them.
