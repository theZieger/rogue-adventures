# TypeScript everywhere, strict

Every file of `src/` except the service worker is TypeScript. Node runs the files as they are (it strips the
types), esbuild bundles them, and `tsc` only checks: strict, with nothing switched off. The types went in on top of
working JavaScript and were proven not to touch it: with the types erased, every file is byte for byte the
JavaScript it was before.

The two shapes the whole game turns on are written down in one place each: a unit (`Unit` in `src/curriculum.ts`)
and the running adventure (`Adventure` in `src/app/state.ts`). `state.run` holds an adventure, a Turmwacht run or
nothing; a screen belongs to one kind of run and only exists while it does, so it reads the slot as present and
with the fields of both kinds, and only writes are checked against the one kind. That is the one place where the
types promise more than they check, chosen over several hundred null checks that could never fail.

Three `any` remain, each explained where it lives: data that has just been read from storage and not yet repaired
(`Unchecked` in `src/save.ts`, `fixTurm` in `src/app/turm.ts`), and the generated task inside a Turmwacht monster
(`src/turm.ts` imports nothing by design). New code does not add to them.
