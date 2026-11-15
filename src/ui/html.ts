// html`<p>${text}</p>` builds markup and escapes everything it is given, so text from a save, a word list or a
// child's input can never become markup by accident. What is markup already goes in as another html`…` or raw().
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

export class Markup {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
  toString() {
    return this.text;
  }
}

export const raw = (markup: string) => new Markup(markup);

function insert(value: unknown): string {
  if (value instanceof Markup) return value.text;
  if (Array.isArray(value)) return value.map(insert).join('');
  if (value == null || value === false) return '';
  return String(value).replace(/[&<>"]/g, (sign) => ESCAPES[sign]);
}

export function html(strings: TemplateStringsArray, ...values: unknown[]) {
  return new Markup(strings.reduce((markup, string, i) => markup + insert(values[i - 1]) + string));
}
