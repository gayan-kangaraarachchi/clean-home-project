# Home Rhythm

A small daily habits and household chore planner. No build step, no dependencies: plain HTML, CSS and JavaScript modules. It installs to a phone's home screen as an app (PWA) and works offline.

## Features

- **Today**: chores due today, grouped by morning, afternoon and evening. Missed chores carry over with a "late" label.
- **Week**: the next 7 days of planned chores, plus a 45-day history with your streak.
- **Habits**: add, edit or delete chores. A chore can repeat every day, every N days after it was last done, on weekdays you pick, or once a month.
- Data is saved in the browser's `localStorage` on each device.

## Project structure

```
home-rhythm/
├── index.html             # Markup shell, meta tags, manifest and icon links
├── manifest.webmanifest   # PWA manifest (name, colors, home screen icons)
├── sw.js                  # Service worker: offline cache of the app shell
├── css/
│   └── styles.css         # Design tokens (light + dark) and all styles
├── js/
│   ├── app.js             # Entry point: boot, click handling, SW registration
│   ├── constants.js       # Areas, time slots, weekday labels, SVG icons
│   ├── dates.js           # Local-date helpers (YYYY-MM-DD keys)
│   ├── store.js           # State, localStorage persistence, mutations
│   ├── schedule.js        # Pure scheduling rules (due, late, next, planned)
│   ├── render.js          # Header and Today / Week / Habits views
│   └── sheet.js           # Add / edit habit form
└── icons/
    ├── icon.svg           # Source icon
    ├── icon-192.png       # Android / manifest
    ├── icon-512.png       # Android / manifest, splash screen
    ├── maskable-512.png   # Android adaptive icon (safe-zone padded)
    ├── apple-touch-icon.png  # iOS home screen (180×180)
    └── favicon-32.png     # Browser tab
```

## Run locally

ES modules and service workers need a web server (opening `index.html` as a file won't work):

```bash
cd home-rhythm
python3 -m http.server 8080
# or: npx serve .
```

Then open http://localhost:8080.

## Add to Git

```bash
cd home-rhythm
git init
git add .
git commit -m "Initial commit: Home Rhythm habits planner"
git branch -M main
git remote add origin https://github.com/<your-user>/home-rhythm.git
git push -u origin main
```

## Install on your phone

The home screen install needs the app served over **HTTPS**. GitHub Pages is the simplest option:

1. Push to GitHub (above), then go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
3. Open `https://<your-user>.github.io/home-rhythm/` on your phone.
4. **iPhone (Safari)**: tap Share → **Add to Home Screen**.
   **Android (Chrome)**: tap ⋮ → **Install app** (or **Add to Home screen**).

The app then opens full-screen from its own icon and works without a connection.

## Updating

When you change any file, bump `CACHE` in `sw.js` (e.g. `home-rhythm-v2`) so installed copies pick up the new version.

## Data format

Stored under the `localStorage` key `home-rhythm-v1`:

```json
{
  "v": 1,
  "chores": [
    { "id": "bath", "name": "Clean bathroom", "area": "bathroom", "slot": "morning",
      "sched": { "type": "weekly", "days": [0] }, "note": "", "created": "2026-11-08" }
  ],
  "done": { "2026-11-08": ["bath", "garbage"] }
}
```

`sched.type` is one of `daily`, `interval` (`every`: days), `weekly` (`days`: 0 = Sunday … 6 = Saturday) or `monthly` (`day`: 1–31).
