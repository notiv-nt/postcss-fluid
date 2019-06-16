const postcss = require('postcss');
const plugin = require('./index');

function run(input, output, opts) {
  return postcss([plugin(opts)])
    .process(input, { from: undefined })
    .then((result) => {
      // console.log(result.css, output);
      // expect(result.css).toEqual(output);
      expect(normalize(result.css)).toEqual(normalize(output));
      expect(result.warnings()).toHaveLength(0);
    });
}

function normalize(str) {
  return str.replace(/\n/gm, ' ').replace(/\s+/gm, ' ');
}

test('Resolve basic function', () => {
  const input = `
    a {
      padding: fluid(10px, 20px)
    }
  `;

  const output = `
    a { }

    @media (min-width: 320px) and (max-width: 1200px) {
     a {
        padding: calc(10px + 10 * (100vw - 320px) / 880)
      }
    }
  `;

  return run(input, output);
});

test('Change min', () => {
  const input = `
    a {
      padding: fluid(10px, 20px)
    }
  `;

  const output = `
    a { }

    @media (min-width: 300px) and (max-width: 1200px) {
      a {
        padding: calc(10px + 10 * (100vw - 300px) / 900)
      }
    }
  `;

  return run(input, output, { min: '300px' });
});

test('Change max', () => {
  const input = `
    a {
      padding: fluid(10px, 20px)
    }
  `;

  const output = `
    a { }

    @media (min-width: 320px) and (max-width: 1000px) {
      a {
        padding: calc(10px + 10 * (100vw - 320px) / 680)
      }
    }
  `;

  return run(input, output, { max: '1000px' });
});

test('Change function name', () => {
  const input = `
    a {
      padding: responsive(10px, 20px)
    }
  `;

  const output = `
    a { }

    @media (min-width: 320px) and (max-width: 1200px) {
      a {
        padding: calc(10px + 10 * (100vw - 320px) / 880)
      }
    }
  `;

  return run(input, output, { functionName: 'responsive' });
});

test('Resolve only exact function', () => {
  const input = `
    a {
      padding: 1rem fluid(10px, 20px) 2rem
    }
  `;

  const output = `
    a { }

    @media (min-width: 320px) and (max-width: 1200px) {
      a {
        padding: 1rem calc(10px + 10 * (100vw - 320px) / 880) 2rem
      }
    }
  `;

  return run(input, output);
});

test('Compact media', () => {
  const input = `
    a {
      padding: 1rem fluid(10px, 20px) 2rem;
      font-size: fluid(16px, 30px);
      color: red;
    }

    body {
      padding: fluid(10px, 20px) 1rem;
    }
  `;

  const output = `
    a {
      color: red;
    }

    body { }

    @media (min-width: 320px) and (max-width: 1200px) {
      a {
        padding: 1rem calc(10px + 10 * (100vw - 320px) / 880) 2rem;
        font-size: calc(16px + 14 * (100vw - 320px) / 880);
      }

      body {
        padding: calc(10px + 10 * (100vw - 320px) / 880) 1rem;
      }
    }
  `;

  return run(input, output);
});

test('Do nothing if function was not found at all', () => {
  const input = `
    a { color: red; }
  `;

  const output = `
    a { color: red; }
  `;

  return run(input, output);
});
