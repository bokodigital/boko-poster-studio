#!/usr/bin/env python3
"""Boko Digital - Social Poster Builder. Injects POSTS + logo into the HTML app."""
import json, datetime, pathlib

BASE = pathlib.Path(__file__).resolve().parent
LOGO   = (BASE / "logo_datauri.txt").read_text().strip()
KWHITE = (BASE / "k_white_datauri.txt").read_text().strip()
KBLACK = (BASE / "k_black_datauri.txt").read_text().strip()
today = datetime.date.today()
WEEK_KEY = f"{today.isocalendar()[0]}-W{today.isocalendar()[1]:02d}"

POSTS = [
    {"id":"p1","template":"statement","ratio":"square",
     "headline":"ONE PARTNER FOR YOUR ENTIRE DIGITAL JOURNEY","accent":"DIGITAL",
     "cta":"BOOK A FREE CALL","eyebrow":"BOKO DIGITAL",
     "bullets":["Strategy","Design","Development","Marketing"],
     "caption":"Strategy, design, development, and performance marketing - integrated under one roof so every piece works together. That's how Boko clients outperform their goals.\n\nStrategize. Execute. Deliver.\nboko.com.au","status":"pending"},
    {"id":"p2","template":"stat","ratio":"square",
     "headline":"SEAMLESS DIGITAL SOLUTIONS","accent":"360",
     "cta":"SEE HOW","eyebrow":"FROM STRATEGY TO PERFORMANCE",
     "bullets":["Strategy","Design","Development","Marketing"],
     "caption":"Design, code, and marketing that move as one. No silos, no dropped handoffs - just one integrated team driving real, measurable results.\n\nboko.com.au","status":"pending"},
    {"id":"p3","template":"checklist","ratio":"square",
     "headline":"EVERYTHING YOUR BRAND NEEDS","accent":"EVERYTHING",
     "cta":"GET STARTED","eyebrow":"ONE INTEGRATED TEAM",
     "bullets":["Digital strategy","Design & branding","Web development","Performance marketing"],
     "caption":"Why juggle five vendors? Boko delivers your full digital stack as one connected system - aligned, accountable, and built to grow with you.\n\nboko.com.au","status":"pending"},
    {"id":"p4","template":"cta","ratio":"square",
     "headline":"READY TO OUTPERFORM YOUR GOALS?","accent":"OUTPERFORM",
     "cta":"BOOK A FREE CALL","eyebrow":"LET'S TALK",
     "bullets":["Strategy","Design","Development","Marketing"],
     "caption":"Tell us where you want to be. We'll map the strategy, build it, and drive the performance to get you there.\n\nStrategize. Execute. Deliver.\nboko.com.au","status":"pending"},
    {"id":"p5","template":"lime","ratio":"square",
     "headline":"STRATEGIZE. EXECUTE. DELIVER.","accent":"DELIVER.",
     "cta":"WORK WITH US","eyebrow":"BOKO DIGITAL",
     "bullets":["Strategy","Design","Development","Marketing"],
     "caption":"Three words. One promise. We manage the whole journey so your brand performs - every time.\n\nboko.com.au","status":"pending"},
]

HTML = open(BASE / "app_template.html").read()
out = (HTML.replace("__LOGO__", LOGO).replace("__KWHITE__", KWHITE).replace("__KBLACK__", KBLACK)
           .replace("__POSTS__", json.dumps(POSTS)).replace("__WEEK_KEY__", WEEK_KEY))
(BASE / "boko_poster_studio.html").write_text(out, encoding="utf-8")
print("Wrote boko_poster_studio.html (", len(out), "bytes ) week", WEEK_KEY)
