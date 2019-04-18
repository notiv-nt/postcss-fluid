# [postcss-fluid](https://www.npmjs.com/package/postcss-fluid)

Fluid css value

## Usage:

```javascript
// Add plugin to postcss config
postcss([
  // (plugins) Sass, Nesting, Imports ...

  require('postcss-fluid')({
    // Defaults:
    min: '320px', // Min media size
    max: '1200px', // Max media size
    functionName: 'fluid', // function name, may be anything
  }),

  // (optimization) autoprefixer, postcss-clean, css-mqpacker ...
]);
```

```css
/* usage in css */
[selector] {
  ...
  [property]: *values* fluid([min], [max]) *values*;
  ...
}
```

### Examples

### Input
```css
body {
  padding: 1rem fluid(10px, 20px) 2rem;
  font-size: fluid(16px, 30px);
}
```

### Output

```css
body {
  padding: 1rem calc(10px + 10 * (100vw - 320px) / 880) 2rem;
  font-size: calc(16px + 14 * (100vw - 320px) / 880);
}

@media (max-width: 320px) {
  body {
    padding: 1rem 10px 2rem;
    font-size: 16px;
  }
}

@media (min-width: 1200px) {
  body {
    padding: 1rem 20px 2rem;
    font-size: 30px;
  }
}
```
