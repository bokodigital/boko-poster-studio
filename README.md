# Boko Digital — Content Command Center

Asana-style content board for Boko Digital. Replaces the content spreadsheet:
plan, edit, and approve social content on a kanban board (Idea → Drafting →
Needs review → Approved → Scheduled → Published). Social posts render on an HTML
canvas in the brand palette (Electric Lime `#BFFC00`, Black, White) and Poppins,
with the Boko **K** mark. Extensible to videos and blogs.

## This week's posts
Five competitor-grounded posts drawn from the Boko 2026 AI Automation Strategy
(competitor analysis + content pillars + AU voice): manual-work cost, rising ad
costs / AI ad audit, "we build it, you own it" positioning, Shopify automation
checklist, and the "$50K isn't needed" 4-week on-ramp.

## Board features
- Kanban columns by status; drag cards between columns
- Per-card **Approve** / **Request changes** (with notes)
- Card editor: template, 1:1/Story, headline, accent, CTA, eyebrow, bullets, caption, platform, status
- Download PNG (full res) · Copy caption
- Platform filter, status counters; state saved in browser localStorage

## Templates
`statement` · `stat` · `cta` · `card` · `lime` · `checklist` · `quote` · `grid` · `index` · `split`

## Build
Static site, no build step. `build_posters.py` injects the render engine
(from `app_template.html`) + brand assets + this week's POSTS into
`dashboard_template.html` → `index.html`. On Vercel: Framework Preset = Other.
