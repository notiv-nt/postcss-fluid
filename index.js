const postcss = require('postcss');

const pi = (o) => parseInt(o, 10);
const pf = (o) => parseFloat(o);

module.exports = postcss.plugin('postcss-transition', (opts) => (root) => {
  const $opts = Object.assign(
    {
      min: '320px',
      max: '1200px',
      functionName: 'fluid',
    },
    opts
  );
  const regex = new RegExp(`${$opts.functionName}\\(([^)]+)\\)`, 'gi');

  const mediaMin = [];
  const mediaMax = [];

  root.walkDecls((decl) => {
    if (decl.value.indexOf(`${$opts.functionName}(`) === -1) {
      return;
    }

    let min = decl.value.replace(regex, (_, values) => values.split(',').map((a) => a.trim())[0]);
    let max = decl.value.replace(regex, (_, values) => values.split(',').map((a) => a.trim())[1]);

    decl.value = decl.value.replace(regex, (_, values /*, index*/) => {
      const { minVal, maxVal } = parseValues(values);

      // TODO: Rem
      // return `calc(${minValue} + ${maxValueInt} * (1px + ((100vw - ${$opts.min}) / (${p($opts.max)} - ${p($opts.min)})) - 1px))`;
      // Px
      return `calc(${minVal} + ${pf(maxVal) - pf(minVal)} * (100vw - ${$opts.min}) / ${pi($opts.max) - pi($opts.min)})`;
    });

    mediaMin.push({
      selector: decl.parent.selector,
      prop: decl.prop,
      value: min,
    });

    mediaMax.push({
      selector: decl.parent.selector,
      prop: decl.prop,
      value: max,
    });
  });

  if (mediaMin.length) {
    addMediaRule(root, `(max-width: ${$opts.min})`, mediaMin);
  }

  if (mediaMax.length) {
    addMediaRule(root, `(min-width: ${$opts.max})`, mediaMax);
  }
});

function addMediaRule(root, params, children) {
  const m = postcss.atRule({ name: 'media', params });

  let selectors = {};

  for (let ch of children) {
    if (!selectors[ch.selector]) {
      selectors[ch.selector] = [{ prop: ch.prop, value: ch.value }];
    } else {
      selectors[ch.selector].push({ prop: ch.prop, value: ch.value });
    }
  }

  for (let selector in selectors) {
    const r = postcss.rule({ selector: selector });

    for (let i of selectors[selector]) {
      const v = postcss.decl({ prop: i.prop, value: i.value });
      r.append(v);
    }

    m.append(r);
  }

  root.append(m);
}

function parseValues(values) {
  const $values = values.split(',').map((a) => a.trim());

  return {
    minVal: $values[0],
    maxVal: $values[1],
  };
}
