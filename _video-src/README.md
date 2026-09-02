# Product video source

`videos/blackcat-product-video.mp4` (1080p30, silent, ~45s) is rendered from these files:

- `shoot-video-stills.mjs` — captures 4K dark-mode stills of a seeded demo account (`stills/`). Analytics is shot on the "All Time" range so the trend charts show a full year, not two points.
- `seed-bookings.js` — seeds Booking rows from the demo reservations CSV so the occupancy calendar is populated.
- `stage.html` — the animated stage: browser frame, zoom/pan camera over each still, caption panel, title and end cards. Deterministic `seek(t)`.
- `render.mjs` — renders every frame with Playwright and encodes with ffmpeg (`node render.mjs full`; `node render.mjs preview <t...>` for key frames).

All screenshots are sample data and the video carries a persistent "Sample data" label. Every caption is a verified product claim.
