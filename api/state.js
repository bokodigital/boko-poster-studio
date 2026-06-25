// Boko Content Board - shared state via Vercel KV (Upstash Redis REST).
// Env (set by the Vercel KV / Upstash integration): KV_REST_API_URL, KV_REST_API_TOKEN
// Optional: BOARD_PASSCODE (shared passcode). If unset, no passcode is enforged.
const URL_ = process.env.KV_REST_API_URL;
const TOK  = process.env.KV_REST_API_TOKEN;
const PASS = process.env.BOARD_PASSCODE || "";
const KEY  = "boko_board";

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

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!URL_ || !TOK) { res.status(503).json({ error: "kv_not_configured" }); return; }

  const pass = req.headers["x-board-pass"] || "";
  if (PASS && pass !== PASS) { res.status(401).json({ error: "bad_pass" }); return; }

  try {
    if (req.method === "GET") {
      const v = await redis(["GET", KEY]);
      res.status(200).json({ state: v ? JSON.parse(v) : null });
    } else if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
      const state = body && body.state;
      if (!Array.isArray(state)) { res.status(400).json({ error: "bad_state" }); return; }
      await redis(["SET", KEY, JSON.stringify(state)]);
      res.status(200).json({ ok: true });
    } else {
      res.status(405).json({ error: "method" });
    }
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
