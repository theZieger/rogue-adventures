// html`…` escapes what it is given and keeps markup that is markup already.
import assert from 'node:assert';
import { html, raw } from '../src/ui/html.ts';

const name = '<b>"Tom" & Co</b>';
assert.equal(
  html`<p title="${name}">${name}</p>`.text,
  '<p title="&lt;b&gt;&quot;Tom&quot; &amp; Co&lt;/b&gt;">&lt;b&gt;&quot;Tom&quot; &amp; Co&lt;/b&gt;</p>',
);
assert.equal(
  html`<ul>${['a<', 'b'].map((item) => html`<li>${item}</li>`)}</ul>`.text,
  '<ul><li>a&lt;</li><li>b</li></ul>',
);
assert.equal(html`${raw('<i>x</i>')}${null}${undefined}${false}${0}`.text, '<i>x</i>0');
assert.equal(`${html`<p>${1 + 1}</p>`}`, '<p>2</p>');
console.log('html fails 0');
