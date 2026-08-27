# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static CV/résumé site for Radouane Baudelot. No build step, no dependencies, no `node_modules`. Deployed on Cloudflare Pages at `https://radouane.pages.dev`.

## Running locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080
# or http://localhost:8080?theme=light for the light theme
```

## Architecture

The site is a single-page app assembled entirely in the browser at runtime:

1. **`cv.md`** — single source of truth. Split into two parts by a YAML frontmatter block (`---`):
   - **YAML header**: structured data (`name`, `title`, `location`, `linkedin`, `competences`, `profil`, …)
   - **Markdown body**: work experience and education sections
2. **`contact.json`** (gitignored) — sensitive fields (`email`, `phone`) loaded at runtime and merged into the YAML data. If absent, the CV renders without them, silently. Copy `contact.example.json` to create it locally.
3. **`main.js`** — fetches `cv.md` (or `cv/<ID>.md`, see below) and `contact.json` in parallel, parses YAML frontmatter with `js-yaml` (CDN), renders Markdown body with `marked` (CDN), then builds the full HTML and injects it into `<div id="cv">`. Also handles theme switching via URL param `?theme=dark|light`.
4. **Multi-CV support** — `?cv=<ID>` in the URL loads `cv/<ID>.md` instead of the default `cv.md`. The id must match `^[A-Za-z0-9]{4,12}$` (validated in `main.js`'s `getCVId()`); an absent or invalid id silently falls back to `cv.md`, same pattern as `getTheme()`. `contact.json` is always shared regardless of which CV is loaded. Use `scripts/new-cv.sh [source-file]` to generate a new variant with a random id and print its URL. To change which CV is the default, copy the desired variant's content into `cv.md`.
5. **`index.html`** — shell only: loads CDN scripts, links CSS files, contains `<div id="cv">`.
6. **CSS files**: `style.css` (layout), `theme-dark.css` / `theme-light.css` (color tokens), `print.css` (PDF export).
7. **`_headers`** — Cloudflare Pages headers: `cv.md`, `cv/*`, and `contact.json` served with `Content-Type: text/plain` / `application/json` and `Access-Control-Allow-Origin: *` (public API access), all `noindex`.

## Content vs. presentation

All content changes go in `cv.md` (or the relevant `cv/<ID>.md` variant) only. Layout/theme changes go in the CSS files. Logic changes go in `main.js`.

## Deployment

Cloudflare Pages auto-deploys on push to `main`. The build command generates `contact.json` from env vars:
```
echo '{"email":"'$EMAIL'","phone":"'$PHONE'"}' > contact.json
```
`EMAIL` and `PHONE` are set as environment variables in the Cloudflare Pages dashboard.
