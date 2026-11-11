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

## Canva integration
Any post card can use a Canva design instead of the built-in template. Open a card, then in
the **Canva design** box either paste a Canva link (`canva.com/design/...`) or click
**Browse my Canva** and pick a design. The board thumbnail, the card preview (every page) and
**Download** (PNG, or a ZIP of all pages for carousels) then come straight from Canva, so there is
no download/upload/Drive step. **Edit in Canva** opens the design; **Refresh from Canva** pulls
the latest version after edits.

One Canva account is connected for the whole board (tokens are stored in Vercel KV).

### One-time setup
1. canva.com/developers > Your integrations > Create an integration (Public: off).
2. Scopes: `design:meta:read` and `design:content:read`.
3. Authorized redirect URL: `https://boko-poster-studio.vercel.app/api/canva?action=callback`
4. Copy the Client ID and generate a Client secret.
5. Vercel > boko-poster-studio > Settings > Environment Variables: add `CANVA_CLIENT_ID` and
   `CANVA_CLIENT_SECRET` (optional `CANVA_REDIRECT_URI` if the domain changes), then redeploy.
6. On the board, open any card > Browse my Canva > approve access in Canva.

Server code: `api/canva.js`. Designs must belong to (or be shared with) the connected Canva account.
