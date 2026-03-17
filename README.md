# heronlyj.github.io

Static site for GitHub Pages.

## Structure

- `site-src/` — VitePress source content
- repository root — published static output for GitHub Pages

## Commands

```bash
npm install
npm run docs:build
npm run publish:pages
```

`publish:pages` will:

1. build VitePress from `site-src/`
2. sync the generated static files into the repository root
3. preserve source files under `site-src/`
4. regenerate `.nojekyll`
