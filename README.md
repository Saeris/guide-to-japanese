# Guide to Japanese

This repository is a markdown and Astro port of [Tae Kim's Guide to Learning Japanese](https://guidetojapanese.org/learn/) designed to facilitate easy content editing and providing an enhanced, accessibility focused user experience.

## 🚀 Project Structure

```
.
├── public/
├── src/
│   ├── components/
│   ├── content/
│   │   ├── learn/
│   │   │   └── grammar/
│   │   └── config.ts
│   ├── layouts/
│   ├── pages/
│   │   ├── learn/
│   │   │   ├── [...slug].asro
│   │   │   └── grammar.astro
│   │   └── index.astro
│   ├── styles/
│   ├── utils/
│   ├── env.d.ts
│   └── ruby.d.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Astro looks for `.md` or `.mdx` files in the `src/content/learn/` directory. Each file is exposed as a route based on its sub-path name.

Each file in the `pages/` directory maps to a url path starting from the site origin: `https://jp.saeris.gg/`. For example, `https://jp.saeris.gg/learn/grammar` maps to `src/pages/learn/grammar.astro`, which renders the content of `src/content/learn/grammar/introduction.md`. For all other routes within the `src/content/learn/grammar/` directory, a special "catch-all" page `src/pages/learn/[...slug].astro` will render the remainder of those files.

Each page uses a layout from the `src/layouts/` directory, which in turn is a composition of individual regions which are defined as components in the `src/components/` directory. Depending on the needs of each, a page, layout, or component may define it's own `<style>` or `script>` tags to extend the specific styling or interactivity requirements of each. Otherwise, site-wide styles such as the shared theme are defined in the `src/styles/` directory.

Images can be added to an `images/` folder in the same directory as a page file and embedded in Markdown with a relative link.

Static assets, like favicons, fonts, etc, are placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `yarn install`         | Installs dependencies                            |
| `yarn dev`             | Starts local dev server at `localhost:3000`      |
| `yarn build`           | Build your production site to `./dist/`          |
| `yarn preview`         | Preview your build locally, before deploying     |
| `yarn astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `yarn astro -- --help` | Get help using the Astro CLI                     |
