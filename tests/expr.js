// Works out „20 − (8 + 5) · 2“ the way a child is taught: brackets first, then · and :, then + and −, from left to
// right. Returns the result and every intermediate value, so a test can ask that none is negative or a fraction.
// Used by tests/test_generators.js (against the generator's answers) and by the playtest bot.
export function evalExpr(text) {
  const tokens = text.match(/\d+|[()+−·:]/g);
  const steps = [];
  let at = 0;
  const atom = () => {
    if (tokens[at] === '(') {
      at++;
      const v = sum();
      if (tokens[at++] !== ')') throw new Error('missing ) in ' + text);
      return v;
    }
    return +tokens[at++];
  };
  const chain = (next, ops) => () => {
    let v = next();
    while (tokens[at] in ops) {
      v = ops[tokens[at++]](v, next());
      steps.push(v);
    }
    return v;
  };
  const product = chain(atom, { '·': (a, b) => a * b, ':': (a, b) => a / b });
  const sum = chain(product, { '+': (a, b) => a + b, '−': (a, b) => a - b });
  const value = sum();
  if (at !== tokens.length) throw new Error('cannot read ' + text);
  return { value, steps };
}
