const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const { ensureDbInitialized } = require("./lib/db");

const authRoutes = require("./routes/auth");
const announcementsRoutes = require("./routes/announcements");
const prayersRoutes = require("./routes/prayers");
const scheduleRoutes = require("./routes/schedule");
const shopRoutes = require("./routes/shop");
const feedbackRoutes = require("./routes/feedback");
const quotesRoutes = require("./routes/quotes");
const healthRoutes = require("./routes/health");

const app = express();

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","),
    credentials: false
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/prayers", prayersRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/quotes", quotesRoutes);
app.use("/api", healthRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

ensureDbInitialized();
app.listen(PORT, () => {
  console.log(`IF B SR API running on http://localhost:${PORT}`);
});