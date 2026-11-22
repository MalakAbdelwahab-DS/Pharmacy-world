# Pharmacy World website (Next.js)

Static export (`output: "export"`) so it can be hosted on GitHub Pages.

- Pages live under `src/app/[lang]/` and are built for `/en` and `/ar` (Arabic is right-to-left).
- All interface text is in `src/lib/i18n.ts`, one glossary for both languages.
- Design tokens (colours, radius, shadow) are in `src/app/globals.css`, matching the Figma design system.
- The API address comes from `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).

```bash
npm install
npm run dev      # http://localhost:3000/en
```
