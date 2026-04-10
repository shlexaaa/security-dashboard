import axios from "axios";

function extractFrameAncestors(csp) {
  if (!csp) return null;
  const directives = csp.split(";").map((d) => d.trim());
  for (const dir of directives) {
    if (dir.toLowerCase().startsWith("frame-ancestors")) {
      return dir.slice("frame-ancestors".length).trim();
    }
  }
  return null;
}

function isRestrictiveFrameAncestors(value) {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  // 'none' or 'self' are restrictive; wildcard '*' is not
  return v === "'none'" || v === "'self'" || v.includes("'none'") || v.includes("'self'");
}

export async function testClickjacking(url) {
  let headers = {};

  // Try HEAD first, fall back to GET
  try {
    const res = await axios.head(url, {
      timeout: 10_000,
      validateStatus: () => true,
      maxRedirects: 5,
    });
    headers = res.headers;
  } catch {
    try {
      const res = await axios.get(url, {
        timeout: 10_000,
        validateStatus: () => true,
        maxRedirects: 5,
        // Don't download the body
        responseType: "stream",
      });
      headers = res.headers;
      res.data.destroy();
    } catch (err) {
      return {
        vulnerable: null,
        error: err.code === "ECONNABORTED" ? "Request timed out" : "Site blocked the request",
        xFrameOptions: null,
        frameAncestors: null,
      };
    }
  }

  const xfo = headers["x-frame-options"] || null;
  const csp = headers["content-security-policy"] || null;
  const frameAncestors = extractFrameAncestors(csp);

  // Check x-frame-options
  if (xfo) {
    const upper = xfo.trim().toUpperCase();
    if (upper === "DENY" || upper === "SAMEORIGIN") {
      return {
        vulnerable: false,
        reason: `X-Frame-Options is set to "${xfo}" — framing is blocked.`,
        xFrameOptions: xfo,
        frameAncestors,
      };
    }
  }

  // Check CSP frame-ancestors
  if (frameAncestors && isRestrictiveFrameAncestors(frameAncestors)) {
    return {
      vulnerable: false,
      reason: `CSP frame-ancestors directive restricts framing to: ${frameAncestors}`,
      xFrameOptions: xfo,
      frameAncestors,
    };
  }

  // Neither protection found
  return {
    vulnerable: true,
    reason:
      "No X-Frame-Options header or restrictive CSP frame-ancestors directive detected. The page may be embeddable in an iframe on any domain.",
    xFrameOptions: xfo,
    frameAncestors: frameAncestors || null,
  };
}
