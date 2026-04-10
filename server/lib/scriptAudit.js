import axios from "axios";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const CATEGORY_RULES = [
  { patterns: ["google-analytics.com", "googletagmanager.com"], category: "Analytics", risk: "medium" },
  { patterns: ["facebook.net", "facebook.com", "connect.facebook"], category: "Social", risk: "medium" },
  { patterns: ["twitter.com", "platform.twitter"], category: "Social", risk: "medium" },
  { patterns: ["hotjar.com", "mouseflow.com", "fullstory.com"], category: "Analytics", risk: "medium" },
  { patterns: ["intercom.io", "crisp.chat", "tawk.to", "livechat"], category: "Chat widget", risk: "medium" },
  { patterns: ["stripe.com", "paypal.com", "klarna.com"], category: "Payment", risk: "low" },
  { patterns: ["jquery", "cdnjs", "jsdelivr", "unpkg", "cdn."], category: "CDN", risk: "low" },
  { patterns: ["wix.com", "wixstatic.com", "parastorage.com"], category: "Platform", risk: "low" },
];

function classifyScript(hostname) {
  const lower = hostname.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => lower.includes(p))) {
      return { category: rule.category, risk: rule.risk };
    }
  }
  return { category: "Unknown", risk: "high" };
}

function extractScripts(html) {
  const results = [];
  // Match <script src="..." or <script src='...'
  const re = /<script[^>]+src\s*=\s*(['"])(.*?)\1/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    results.push(match[2].trim());
  }
  return results;
}

export async function auditScripts(url) {
  let html;
  try {
    const res = await axios.get(url, {
      timeout: 15_000,
      headers: { "User-Agent": UA },
      validateStatus: (s) => s < 500,
      maxRedirects: 5,
      responseType: "text",
    });
    html = res.data;
  } catch (err) {
    return {
      error: err.code === "ECONNABORTED" ? "Request timed out" : "Site blocked the request",
    };
  }

  const allSrcs = extractScripts(html);
  const externalScripts = [];

  for (const src of allSrcs) {
    let isExternal = false;
    let insecure = false;
    let hostname = "";

    if (src.startsWith("//")) {
      isExternal = true;
      insecure = false; // protocol-relative — inherits page protocol
      try { hostname = new URL("https:" + src).hostname; } catch { continue; }
    } else if (src.startsWith("https://")) {
      isExternal = true;
      insecure = false;
      try { hostname = new URL(src).hostname; } catch { continue; }
    } else if (src.startsWith("http://")) {
      isExternal = true;
      insecure = true;
      try { hostname = new URL(src).hostname; } catch { continue; }
    } else {
      continue; // relative URL — internal
    }

    if (!isExternal) continue;

    // Skip same-origin scripts (matching the scanned host)
    const targetHost = new URL(url).hostname;
    if (hostname === targetHost || hostname.endsWith("." + targetHost)) continue;

    const { category, risk: baseRisk } = classifyScript(hostname);
    const risk = insecure ? "high" : baseRisk;

    externalScripts.push({ src, hostname, category, risk, insecure });
  }

  // Sort: high → medium → low
  const riskOrder = { high: 0, medium: 1, low: 2 };
  externalScripts.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);

  const riskSummary = { high: 0, medium: 0, low: 0 };
  for (const s of externalScripts) riskSummary[s.risk]++;

  return {
    totalScripts: allSrcs.length,
    externalScripts,
    riskSummary,
    rawHtml: null,
  };
}
