# Boko Digital — Weekly Poster Studio

On-brand social poster generator for Boko Digital. Static single-page app — posters
render on an HTML canvas at 1080×1080 and 1080×1920 in the brand palette (Electric
Lime `#BFFC00`, Black, White) and Poppins, with the Boko **K** mark.

## Templates
`statement` · `stat` · `cta` · `card` · `lime` · `checklist` · `quote` · `grid` · `index` · `split`

## Features
- Per-post editing (headline, accent word/number, CTA, eyebrow, bullets, caption)
- Template switcher + 1:1 / Story toggle
- Approve / Request changes with notes, status counters, week calendar
- Download PNG (full resolution) · Copy caption
- Edits persist per ISO week in browser localStorage

## Deploy
Static site — no build step. On Vercel: **Framework Preset = Other**, root = repo root.
`index.html` is served directly.

## Regenerate weekly content
`build_posters.py` injects the week's `POSTS` + logo data URLs into `app_template.html`.
