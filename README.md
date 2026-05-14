# Chye Yan Tong — Portfolio

A personal portfolio website with an "Apple Event meets Mr. Robot" aesthetic.

## Features

- **Terminal Intro**: Hacker-style boot sequence that transitions into a modern glassmorphism UI
- **Bento Grid Layout**: Apple-inspired project showcase with interactive hover effects
- **3D Tilt Effects**: Hero card responds to mouse movement
- **Glitch Animations**: Project titles have cyberpunk glitch effects on hover
- **Reveal Animations**: Content animates in as you scroll
- **Easter Egg**: Hidden terminal at bottom-right — type `whoami`, `run easter_egg.sh`, or `hamster` for a surprise

## Adding Project Images

Replace the placeholder images by adding your files to the root directory:

```
/Portfolio/
├── index.html
├── placeholder-mylayak.jpg    # MyLayak app screenshot
├── placeholder-ekyc.jpg        # eKYC demo screenshot
├── placeholder-luna.jpg        # LUNA app screenshot
├── placeholder-jetcycle.jpg    # JetCycle product photo
├── placeholder-sparkathon.jpg  # Sparkathon 2025 team photo
├── placeholder-godamlah.jpg    # Godamlah! 2.0 team photo
└── placeholder-blueprint.jpg   # Blueprint Hackathon photo
```

The images will automatically load when present. Otherwise, styled placeholders appear.

## Local Preview

Simply open `index.html` in your browser:

```bash
open index.html
```

Or use a local server:

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Deploy

### GitHub Pages

1. Push to a repository
2. Enable GitHub Pages in Settings → Pages
3. Select main branch as source

### Vercel/Netlify

Drag and drop the folder or connect your repo.

---

Built with Tailwind CSS + Vanilla JS for maximum performance.
