# Yan Tong — An Unusual Archive

A single-page portfolio built as an editorial archive with a tarot-inspired hero, responsive typography and lightweight interactions. Plain HTML, CSS and JavaScript; no build step.

## Local preview

```bash
python3 -m http.server 8765
```

Open http://localhost:8765/.

## Interaction

- A custom wand cursor leaves an ink-and-brass particle trail on desktop. Clicking casts sparks.
- Moving over the cover reveals hidden ink. The three tarot cards respond to the pointer.
- Each card is a button: click, tap or press Enter to turn it and reveal a note. Press Escape to turn it back.
- Project files expand on click. On desktop, hovering over a project with existing media shows a floating preview.
- Reduced-motion preferences turn off decorative motion.

## Content and images

The site content follows `CHYEYANTONGLATEST.pdf`; all résumé links point to that file. Existing project media are reused.

`avatar-wizard-v1.png` is an illustrated, magic-hat portrait based on the local `profile.jpg`. It appears as a small author stamp on desktop and mobile.

CareerX-Ray, Qubee and AdventureX use the supplied `career-xray.png`, `qubee.png` and `adventurex.png` images. All three also appear in the desktop hover preview.

Main files: `index.html`, `style.css`, `app.js`.
