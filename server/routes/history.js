import { Router } from "express";
import { getDb } from "../lib/db.js";

export const historyRouter = Router();

// GET /api/history — list all scans (summary fields only), newest first
historyRouter.get("/", async (_req, res) => {
  try {
    const db = await getDb();
    const scans = [...db.data.scans]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(({ id, url, timestamp, score }) => ({ id, url, timestamp, score }));
    return res.json(scans);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load history", details: err.message });
  }
});

// GET /api/history/:id — full scan record
historyRouter.get("/:id", async (req, res) => {
  try {
    const db = await getDb();
    const scan = db.data.scans.find((s) => s.id === req.params.id);
    if (!scan) return res.status(404).json({ error: "Scan not found." });
    return res.json(scan);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load scan", details: err.message });
  }
});

// DELETE /api/history/:id
historyRouter.delete("/:id", async (req, res) => {
  try {
    const db = await getDb();
    const before = db.data.scans.length;
    db.data.scans = db.data.scans.filter((s) => s.id !== req.params.id);
    if (db.data.scans.length === before) {
      return res.status(404).json({ error: "Scan not found." });
    }
    await db.write();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete scan", details: err.message });
  }
});
