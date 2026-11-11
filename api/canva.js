// Boko Poster Studio - Canva Connect integration.
// One shared Canva connection for the whole board (tokens kept in Vercel KV).
//
// Env vars (Vercel > Project > Settings > Environment Variables):
//   CANVA_CLIENT_ID, CANVA_CLIENT_SECRET   from canva.com/developers > Your integrations
//   CANVA_REDIRECT_URI (optional)          defaults to https://<host>/api/canva?action=callback
//   KV_REST_API_URL, KV_REST_API_TOKEN     already set for the board
//   BOARD_PASSCODE (optional)              same passcode as the board
//
// Canva integration scopes needed: design:meta:read, design:content:read
//
// Actions (GET /api/canva?action=...):
//   status                -> { configured, connected }
//   login                 -> redirects to Canva consent screen
//   callback              -> Canva redirects here; stores tokens, back to the board
//   disconnect            -> forgets the stored tokens
//   search&q=&cont=       -> { items:[{id,title,thumb,editUrl,viewUrl,pages}], cont }
//   design&id=            -> { id,title,thumb,editUrl,viewUrl,pages }
//   thumb&id=             -> 302 to a fresh thumbnail (usable as <img src>)
//   export&id=            -> { job }            starts a PNG export of every page
//   exportStatus&job=     -> { status, urls }   poll until status is success
//   file&u=               -> streams one exported PNG (same-origin, for zipping)
const crypto = require("crypto");

const URL_ = process.env.KV_REST_API_URL;
const TOK = process.env.KV_REST_API_TOKEN;
const PASS = process.env.BOARD_PASSCODE || "";
const CID = process.env.CANVA_CLIENT_ID || "";
const CSECRET = process.env.CANVA_CLIENT_SECRET || "";
const API = "https://api.canva.com/rest/v1";
const TOKEN_KEY = "boko_canva_tokens";
const SCOPES = "design:meta:read design:content:read";

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: "Bearer " + TOK, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const kvGet = async (k) => { const v = await redis(["GET", k]); return v ? JSON.parse(v) : null; };
const kvSet = (k, v, ttl) => redis(ttl ? ["SET", k, JSON.stringify(v), "EX", String(ttl)] : ["SET", k, JSON.stringify(v)]);
const kvDel = (k) => redis(["DEL", k]);

function redirectUri(req) {
  if (process.env.CANVA_REDIRECT_URI) return process.env.CANVA_REDIRECT_URI;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return "https://" + host + "/api/canva?action=callback";
}
const b64url = (buf) => buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function tokenRequest(params) {
  const r = await fetch(API + "/oauth/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(CID + ":" + CSECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error("canva_token_failed: " + (j.error_description || j.error || r.status));
  return { access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000 - 60000 };
}

async function accessToken() {
  const t = await kvGet(TOKEN_KEY);
  if (!t) return null;
  if (t.exp > Date.now()) return t.access;
  // Canva refresh tokens are single use: store the new pair straight away.
  const nt = await tokenRequest({ grant_type: "refresh_token", refresh_token: t.refresh });
  await kvSet(TOKEN_KEY, nt);
  return nt.access;
}

async function canva(path, opts) {
  const at = await accessToken();
  if (!at) { const e = new Error("not_connected"); e.code = 401; throw e; }
  const r = await fetch(API + path, Object.assign({}, opts, {
    headers: Object.assign({ Authorization: "Bearer " + at, "Content-Type": "application/json" }, (opts && opts.headers) || {}),
  }));
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error((j && (j.message || j.code)) || "canva_" + r.status); e.code = r.status; throw e; }
  return j;
}

const slim = (d) => ({
  id: d.id,
  title: d.title || "Untitled",
  thumb: d.thumbnail ? d.thumbnail.url : "",
  editUrl: d.urls ? d.urls.edit_url : "",
  viewUrl: d.urls ? d.urls.view_url : "",
  pages: d.page_count || 0,
});

module.exports = async (req, res) => {
  const q = Object.assign({}, req.query || {});
  // Canva appends ?code=&state= to a redirect URI that already has a query, so
  // "action" can arrive as "callback?code=...". Split it back out.
  if (typeof q.action === "string" && q.action.indexOf("?") >= 0) {
    const [a, rest] = q.action.split("?");
    q.action = a;
    for (const [k, v] of new URLSearchParams(rest)) if (!(k in q)) q[k] = v;
  }
  if (!q.action && q.code && q.state) q.action = "callback";
  const action = q.action || "status";
  const noStore = () => res.setHeader("Cache-Control", "no-store");

  if (!URL_ || !TOK) { noStore(); res.status(503).json({ error: "kv_not_configured" }); return; }

  // Canva's redirect cannot carry the board passcode; it is validated by the one-time state instead.
  if (action !== "callback") {
    const pass = req.headers["x-board-pass"] || q.p || "";
    if (PASS && pass !== PASS) { noStore(); res.status(401).json({ error: "bad_pass" }); return; }
  }

  try {
    if (action === "status") {
      noStore();
      const t = CID && CSECRET ? await kvGet(TOKEN_KEY) : null;
      res.status(200).json({ configured: !!(CID && CSECRET), connected: !!t });
      return;
    }

    if (!CID || !CSECRET) { noStore(); res.status(503).json({ error: "canva_not_configured" }); return; }

    if (action === "login") {
      const verifier = b64url(crypto.randomBytes(48));
      const challenge = b64url(crypto.createHash("sha256").update(verifier).digest());
      const state = b64url(crypto.randomBytes(24));
      await kvSet("boko_canva_state_" + state, { verifier }, 600);
      const u = "https://www.canva.com/api/oauth/authorize?" + new URLSearchParams({
        code_challenge: challenge, code_challenge_method: "s256", scope: SCOPES,
        response_type: "code", client_id: CID, state, redirect_uri: redirectUri(req),
      }).toString();
      noStore(); res.writeHead(302, { Location: u }); res.end();
      return;
    }

    if (action === "callback") {
      noStore();
      if (q.error) { res.writeHead(302, { Location: "/?canva=denied" }); res.end(); return; }
      const st = q.state ? await kvGet("boko_canva_state_" + q.state) : null;
      if (!st || !q.code) { res.writeHead(302, { Location: "/?canva=error" }); res.end(); return; }
      await kvDel("boko_canva_state_" + q.state);
      const t = await tokenRequest({
        grant_type: "authorization_code", code: q.code, code_verifier: st.verifier, redirect_uri: redirectUri(req),
      });
      await kvSet(TOKEN_KEY, t);
      res.writeHead(302, { Location: "/?canva=connected" }); res.end();
      return;
    }

    if (action === "disconnect") { noStore(); await kvDel(TOKEN_KEY); res.status(200).json({ ok: true }); return; }

    if (action === "search") {
      noStore();
      const p = new URLSearchParams({ limit: "30", sort_by: q.q ? "relevance" : "modified_descending" });
      if (q.q) p.set("query", q.q);
      if (q.cont) p.set("continuation", q.cont);
      const j = await canva("/designs?" + p.toString());
      res.status(200).json({ items: (j.items || []).map(slim), cont: j.continuation || null });
      return;
    }

    if (action === "design" || action === "thumb") {
      if (!/^D[A-Za-z0-9_-]{6,20}$/.test(q.id || "")) { noStore(); res.status(400).json({ error: "bad_id" }); return; }
      const j = await canva("/designs/" + encodeURIComponent(q.id));
      const d = slim(j.design || {});
      if (action === "thumb") {
        if (!d.thumb) { res.status(404).end(); return; }
        res.setHeader("Cache-Control", "private, max-age=900");
        res.writeHead(302, { Location: d.thumb }); res.end();
        return;
      }
      noStore(); res.status(200).json(d);
      return;
    }

    if (action === "export") {
      noStore();
      if (!/^D[A-Za-z0-9_-]{6,20}$/.test(q.id || "")) { res.status(400).json({ error: "bad_id" }); return; }
      const j = await canva("/exports", {
        method: "POST",
        body: JSON.stringify({ design_id: q.id, format: { type: "png", export_quality: "regular" } }),
      });
      res.status(200).json({ job: j.job && j.job.id, status: j.job && j.job.status, urls: (j.job && j.job.urls) || [] });
      return;
    }

    if (action === "exportStatus") {
      noStore();
      const j = await canva("/exports/" + encodeURIComponent(q.job || ""));
      const job = j.job || {};
      res.status(200).json({ status: job.status, urls: job.urls || [], error: job.error ? job.error.message : null });
      return;
    }

    if (action === "file") {
      // Only proxy Canva's own export hosts, so this cannot be used as an open proxy.
      let u;
      try { u = new URL(q.u || ""); } catch (e) { res.status(400).end(); return; }
      if (u.protocol !== "https:" || !/(^|\.)canva\.com$|(^|\.)amazonaws\.com$/.test(u.hostname)) { res.status(400).end(); return; }
      const r = await fetch(u.toString());
      if (!r.ok) { res.status(502).end(); return; }
      const buf = Buffer.from(await r.arrayBuffer());
      res.setHeader("Content-Type", r.headers.get("content-type") || "image/png");
      res.setHeader("Cache-Control", "private, max-age=3600");
      res.status(200).send(buf);
      return;
    }

    noStore(); res.status(400).json({ error: "unknown_action" });
  } catch (e) {
    noStore();
    const code = e.code === 401 || e.message === "not_connected" ? 401 : (e.code && e.code >= 400 && e.code < 600 ? e.code : 500);
    res.status(code).json({ error: String((e && e.message) || e) });
  }
};
