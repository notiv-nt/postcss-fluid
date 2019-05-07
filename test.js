const postcss = require('postcss');
const plugin = require('./index');

function run(input, output, opts) {
  return postcss([plugin(opts)])
    .process(input, { from: undefined })
    .then((result) => {
      // console.log(result.css, output);
      expect(normalize(result.css)).toEqual(normalize(output));
      expect(result.warnings()).toHaveLength(0);
    });
}

function normalize(str) {
  return str.replace(/\n/gm, ' ').replace(/\s+/gm, ' ');
}

test('Resolve basic function', () => Promise.all([run(`
a {
  padding: fluid(10px, 20px)
}
`, `
a {
  padding: calc(10px + 10 * (100vw - 320px) / 880)
}
@media (max-width: 320px) {
  a { padding: 10px }
}
@media (min-width: 1200px) {
  a { padding: 20px }
}
`)]));

test('Change min', () => Promise.all([run(`
a {
  padding: fluid(10px, 20px)
}
`, `
a {
  padding: calc(10px + 10 * (100vw - 300px) / 900)
}
@media (max-width: 300px) {
  a { padding: 10px }
}
@media (min-width: 1200px) {
  a { padding: 20px }
}
`, { min: '300px', })]));

test('Change max', () => Promise.all([run(`
a {
  padding: fluid(10px, 20px)
}
`, `
a {
  padding: calc(10px + 10 * (100vw - 320px) / 680)
}
@media (max-width: 320px) {
  a { padding: 10px }
}
@media (min-width: 1000px) {
  a { padding: 20px }
}
`, { max: '1000px', })]));

test('Change function name', () => Promise.all([run(`
a {
  padding: responsive(10px, 20px)
}
`, `
a {
  padding: calc(10px + 10 * (100vw - 320px) / 880)
}
@media (max-width: 320px) {
  a { padding: 10px }
}
@media (min-width: 1200px) {
  a { padding: 20px }
}
`, { functionName: 'responsive' })]));

test('Resolve only exact function', () => Promise.all([run(`
a {
  padding: 1rem fluid(10px, 20px) 2rem
}
`, `
a {
  padding: 1rem calc(10px + 10 * (100vw - 320px) / 880) 2rem
}
@media (max-width: 320px) {
  a { padding: 1rem 10px 2rem }
}
@media (min-width: 1200px) {
  a { padding: 1rem 20px 2rem }
}
`)]));

test('Compact media', () => Promise.all([run(`
a {
  padding: 1rem fluid(10px, 20px) 2rem;
  font-size: fluid(16px, 30px);
}
`, `
a {
  padding: 1rem calc(10px + 10 * (100vw - 320px) / 880) 2rem;
  font-size: calc(16px + 14 * (100vw - 320px) / 880);
}
@media (max-width: 320px) {
  a {
    padding: 1rem 10px 2rem;
    font-size: 16px;
  }
}
@media (min-width: 1200px) {
  a {
    padding: 1rem 20px 2rem;
    font-size: 30px;
  }
}
`)]));

test('Do nothing if function was not found at all', () => Promise.all([run(`
a { color: red; }
`, `
a { color: red; }
`)]));
