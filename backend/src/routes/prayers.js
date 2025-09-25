const { Router } = require("express");
const { getAll, saveAll, validDay } = require("../lib/db");
const { verifyToken } = require("../lib/auth");

const router = Router();

router.get("/", (req, res) => {
  const db = getAll();
  res.json(db.prayers);
});

router.put("/", verifyToken, (req, res) => {
  const body = req.body || {};
  const db = getAll();
  const next = { ...db.prayers };
  for (const [k, v] of Object.entries(body)) {
    if (validDay(k)) next[k] = String(v || "").trim();
  }
  db.prayers = next;
  saveAll(db);
  res.json(db.prayers);
});

module.exports = router;