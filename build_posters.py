#!/usr/bin/env python3
"""Boko Digital - Content Command Center build.
Composes the Asana-style board (index) by injecting the poster render engine
(extracted from app_template.html) + brand assets + POSTS into dashboard_template.html."""
import json, datetime, pathlib, re

BASE = pathlib.Path(__file__).resolve().parent
LOGO   = (BASE / "logo_datauri.txt").read_text().strip()
LOGOLIGHT = (BASE / "logo_light_datauri.txt").read_text().strip()
KWHITE = (BASE / "k_white_datauri.txt").read_text().strip()
KBLACK = (BASE / "k_black_datauri.txt").read_text().strip()
KLIME  = (BASE / "k_lime_datauri.txt").read_text().strip()
AVATAR = (BASE / "avatar_maria_datauri.txt").read_text().strip()

# Extract the render engine (wrapLines..renderPoster) from the studio template
_src = (BASE / "app_template.html").read_text()
_a = _src.find("function wrapLines(ctx"); _b = _src.find("function dayName(")
ENGINE = _src[_a:_b].strip()

today = datetime.date.today()
WEEK_KEY = f"{today.isocalendar()[0]}-W{today.isocalendar()[1]:02d}"

# ---- 5 competitor-grounded posts (from Boko 2026 AI Automation Strategy) ----
POSTS = [
 {"id":"p1","date":"2026-06-30","type":"post","platform":"Instagram","status":"review","title":"Stop paying humans for robot work",
  "pillar":"How-To · Cost of manual work","template":"statement","ratio":"square",
  "headline":"STOP PAYING HUMANS TO DO ROBOT WORK","accent":"ROBOT","cta":"DM US AUTOMATE",
  "eyebrow":"BOKO DIGITAL","bullets":["WISMO replies","Email flows","Product copy","Weekly reports"],
  "caption":"Customer replies. Product descriptions. Weekly reports. Inventory updates. If a human on your team still does these in 2026, you're paying salary for robot work.\n\nThe fix isn't more staff - it's the right 3 automations.\n\nDM us AUTOMATE for the list of tasks AU retailers should hand to AI first.\n#AIAutomation #ShopifyAU #AustralianBusiness","changeNote":""},

 {"id":"p2","date":"2026-07-01","type":"post","platform":"Instagram","status":"drafting","title":"74% raising AI spend / ad leak",
  "pillar":"Data · Your data is smarter","template":"stat","ratio":"square",
  "headline":"OF ANZ RETAILERS ARE RAISING AI SPEND","accent":"74%","cta":"DM US ADS",
  "eyebrow":"ANZ RETAIL · 2026","bullets":["Server-side tracking","Conversions API","Daily AI ad audit"],
  "caption":"Your CPAs keep climbing and you can't see why. iOS and Chrome privacy changes broke the pixel - Meta and Google are flying blind on your data.\n\n74% of ANZ retailers are raising AI spend in 2026. The smart ones point it at the leak: server-side tracking + AI reading the account every day.\n\nDM us ADS for our AI ad-audit prompt.\n#AIAutomation #ROAS #ShopifyAU","changeNote":""},

 {"id":"p3","date":"2026-07-03","type":"post","platform":"LinkedIn","status":"approved","title":"We build it. You own it. (positioning)",
  "pillar":"Hot take · Positioning vs competitors","template":"lime","ratio":"square",
  "headline":"WE BUILD IT. YOU OWN IT.","accent":"OWN","cta":"DM US BUILD",
  "eyebrow":"BOKO DIGITAL","bullets":["No lock-in","No retainer trap","Your team runs it"],
  "caption":"Every AI agency in Australia falls into two camps: they manage it for you forever (you never own it), or they build it and vanish.\n\nWe do neither. We build the systems, then hand them over - your team runs them without us.\n\nThat's the difference between renting AI and owning it.\n\nDM us BUILD to see what a hand-over looks like.\n#AIAutomation #AustralianBusiness #Retail","changeNote":""},

 {"id":"p4","date":"2026-06-29","type":"post","platform":"Instagram","status":"review","title":"Automate these 4 first (Shopify)",
  "pillar":"How-To · Automate the repetitive","template":"checklist","ratio":"square",
  "headline":"AUTOMATE THESE 4 FIRST","accent":"4","cta":"DM US SHOPIFY",
  "eyebrow":"SHOPIFY RETAILERS","bullets":["WISMO customer replies","Klaviyo email & SMS","Product descriptions","Weekly sales reports"],
  "caption":"Your Shopify store can now run its own admin. AI plugs straight into the Shopify API - orders, products, inventory, customers.\n\nStart with the 4 tasks eating your week:\n- WISMO 'where's my order' replies\n- Klaviyo email + SMS flows\n- Product descriptions\n- Weekly sales reporting\n\nAutomate the repetitive. Spend your hours on the creative.\n\nDM us SHOPIFY for the automation map.\n#ShopifyAU #AIAutomation #Ecommerce","changeNote":""},

 {"id":"p5","date":"2026-07-07","type":"post","platform":"LinkedIn","status":"idea","title":"You don't need a $50K AI project",
  "pillar":"Framework · The AI-powered business","template":"cta","ratio":"square",
  "headline":"YOU DON'T NEED A $50K AI PROJECT","accent":"$50K","cta":"DM US PLAN",
  "eyebrow":"AU RETAIL, $1M-$5M","bullets":["3 automations","4 weeks","You own it"],
  "caption":"The big agencies quote $15K-$50K for 'enterprise AI'. For a $1-5M retailer, that's a no.\n\nYou don't need enterprise. You need the right 3 automations live in 4 weeks - customer service, email, and reporting.\n\nThat's the whole on-ramp.\n\nDM us PLAN for the 4-week automation roadmap.\n#AIAutomation #AustralianRetail #SmallBusiness","changeNote":""},
 {"id":"p6","type":"post","platform":"LinkedIn","status":"review","date":"2026-07-02","title":"Founder post - Automation for retailers",
  "pillar":"Founder insight - Automation","template":"founder","ratio":"square","avatar":AVATAR,
  "headline":"Automation isn't just for big retailers.","accent":"","cta":"@boko.digital.solutions",
  "eyebrow":"Maria Jose Mendieta","bullets":[],
  "caption":"When I started Boko, every founder told me the same thing - 'AI sounds great, but not for a business my size.'\n\nIt is. The right three automations - customer replies, email flows, weekly reporting - take weeks, not a year. And you own them.\n\nThat's what we build: systems your team runs without us.\n\nAutomation isn't the future of retail. It's this quarter.","changeNote":""},
]

import json as _json
POSTS += _json.load(open(BASE / "macroplan.json", encoding="utf-8"))
HTML = (BASE / "dashboard_template.html").read_text()
out = (HTML.replace("__ENGINE__", ENGINE)
           .replace("__LOGO__", LOGO).replace("__LOGOLIGHT__", LOGOLIGHT).replace("__KWHITE__", KWHITE)
           .replace("__KBLACK__", KBLACK).replace("__KLIME__", KLIME)
           .replace("__POSTS__", json.dumps(POSTS)).replace("__WEEK_KEY__", WEEK_KEY))
(BASE / "boko_poster_studio.html").write_text(out, encoding="utf-8")
print("Wrote boko_poster_studio.html (", len(out), "bytes ) week", WEEK_KEY, "| engine", len(ENGINE), "chars")
