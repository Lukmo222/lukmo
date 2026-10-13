# Luka Treven – Portfolio (SL / EN)

Static, dependency-free bilingual portfolio. Ready for **GitHub Pages**.

## Structure
```
index.html        page markup (text comes from data-i18n keys)
css/style.css     styles
js/i18n.js        ALL text in Slovenian + English – edit content here
js/main.js        language switch, animations, PCB background
assets/           favicon, profile photo (profile.jpg)
```

## Add your photo
Save a square photo as `assets/profile.jpg`. If missing, the "LT" monogram is shown.

## Language
- Toggle SL / EN in the nav (choice is remembered).
- Direct links: `?lang=sl` or `?lang=en`.
- First visit: auto-detects browser language (Slovenian → SL, otherwise EN).

## Preview locally
Just double-click `index.html` – no build step or server needed.

## Deploy to GitHub Pages
1. Create a repo (e.g. `lukatreven.github.io` for a root URL, or any name).
2. Push these files to the `main` branch.
3. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)`.
4. Site will be live at `https://<username>.github.io/<repo>/`.
