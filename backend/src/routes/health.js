const { Router } = require("express");

const router = Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, service: "ifbsr-backend", time: Date.now() });
});

module.exports = router;