import { Router } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { HEADER_CHECKS, scoreHeaders } from "../lib/headerChecks.js";
import { buildClaudePrompt } from "../lib/promptBuilder.js";
import { getDb } from "../lib/db.js";

export const scanRouter = Router();

function parseHeaders(rawText) {
  const headers = {};
  const lines = rawText.split("\n");
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();
    if (key) headers[key] = value;
  }
  return headers;
}

scanRouter.post("/", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required." });
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return res.status(400).json({ error: "URL must start with http:// or https://" });
  }

  let hostname;
  try {
    hostname = new URL(url).hostname;
    if (!hostname) throw new Error("No hostname");
  } catch {
    return res.status(400).json({ error: "Invalid URL: could not parse hostname." });
  }

  // 7a — Fetch HTTP headers
  let rawHeaders, parsedHeaders, checkResults, score;
  try {
    const response = await axios.get(
      `https://api.hackertarget.com/httpheaders/?q=${encodeURIComponent(url)}`,
      { timeout: 10_000, responseType: "text" }
    );
    rawHeaders = response.data;
    parsedHeaders = parseHeaders(rawHeaders);

    checkResults = HEADER_CHECKS.map((hc) => {
      const value = parsedHeaders[hc.key] || null;
      const status = hc.check(value);
      return {
        name: hc.name,
        key: hc.key,
        importance: hc.importance,
        status,
        description: hc.description,
        remediation: hc.remediation,
        value
      };
    });

    score = scoreHeaders(parsedHeaders);
  } catch (err) {
    const details = err.response?.data || err.message || "Unknown error";
    return res.status(502).json({ error: "Could not fetch headers", details: String(details) });
  }

  // 7b — DNS lookup (non-fatal)
  let dnsRaw = null;
  try {
    const dnsRes = await axios.get(
      `https://api.hackertarget.com/dnslookup/?q=${encodeURIComponent(hostname)}`,
      { timeout: 10_000, responseType: "text" }
    );
    dnsRaw = dnsRes.data;
  } catch {
    // DNS failure is non-fatal — continue with null
  }

  // 7c — Build Claude prompt
  const claudePrompt = buildClaudePrompt(url, score, checkResults, dnsRaw);

  // 7d — Save to history
  const id = uuidv4();
  const record = {
    id,
    url,
    timestamp: new Date().toISOString(),
    score,
    checkResults,
    rawHeaders,
    parsedHeaders,
    dnsRaw,
    claudePrompt
  };

  try {
    const db = await getDb();
    db.data.scans.push(record);
    await db.write();
  } catch (err) {
    console.error("Failed to save scan to DB:", err.message);
  }

  // 7e — Response
  return res.json({
    id,
    url,
    score,
    checkResults,
    rawHeaders,
    parsedHeaders,
    dnsRaw,
    claudePrompt
  });
});
