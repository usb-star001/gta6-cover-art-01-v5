# Leonida Nights Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/usb-star001/gta6-cover-art-01-v5/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/usb-star001/gta6-cover-art-01-v5/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A photo-to-poster studio in the style of GTA 6 cover art. Drop in your own
photos (or load the demo cast), caption the poster, pick a layout and a colour
grade, and export it as a PNG in the three common post sizes.

## How it works

1. **Add photos** — eight cast slots. Click a slot to upload, drag a file onto
   a slot, or paste an image. "Try samples" loads the demo cast: eight
   original flat cartoon portraits drawn in code (Vic the Boss, Marcus the
   Driver, Diego the Mechanic, Carlos the Captain, Roxy the Rider, Nina the
   Fixer, Jade the Lookout, Lucia the Insider).
2. **Caption** — edit the title, subtitle, ribbon, review quote, billing and
   release line. Four layouts (Cast Mosaic, Diagonal Strips, Six Grid,
   Vertical Stack) and five colour grades (Sunset Gold, Neon Night, Tropic
   Teal, Ultraviolet, Retro Print). Each panel can be panned, zoomed, flipped
   and swapped; undo and redo are included.
3. **Export PNG** — one click exports all three sizes: 1080 x 1080, 1080 x 1350
   and 1920 x 1080.

The poster itself is a two-band cast mosaic by default: four portraits across
the top, four across the bottom, a striped-gradient 3D block title
(NEON VERDICT) with a neon script subtitle, a tagline ribbon, a five-star
review bar, a gold BEST CAST seal, billing and a barcode.

## Run it

```sh
node serve.ts --port 8080
```

Then open http://localhost:8080 in a desktop browser. The app is plain static
files under `app/` — it works offline, with no network requests, and your
photos never leave your machine.

## Entered in

[make.fun — gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01)
