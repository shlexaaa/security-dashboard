export const HEADER_CHECKS = [
  {
    name: "Strict-Transport-Security",
    key: "strict-transport-security",
    importance: "high",
    check: (value) => {
      if (!value) return "fail";
      if (value.includes("max-age")) return "pass";
      return "warn";
    },
    description: "Forces browsers to use HTTPS for future requests, preventing downgrade attacks.",
    remediation: "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload"
  },
  {
    name: "Content-Security-Policy",
    key: "content-security-policy",
    importance: "high",
    check: (value) => (value ? "pass" : "fail"),
    description: "Restricts which resources the browser can load, mitigating XSS and injection attacks.",
    remediation: "Define a CSP header that whitelists only trusted sources for scripts, styles, and other resources."
  },
  {
    name: "X-Frame-Options",
    key: "x-frame-options",
    importance: "medium",
    check: (value) => {
      if (!value) return "fail";
      const upper = value.trim().toUpperCase();
      if (upper === "DENY" || upper === "SAMEORIGIN") return "pass";
      return "warn";
    },
    description: "Prevents the page from being embedded in iframes, protecting against clickjacking.",
    remediation: "Add: X-Frame-Options: DENY or X-Frame-Options: SAMEORIGIN"
  },
  {
    name: "X-Content-Type-Options",
    key: "x-content-type-options",
    importance: "medium",
    check: (value) => {
      if (!value) return "fail";
      if (value.trim().toLowerCase() === "nosniff") return "pass";
      return "warn";
    },
    description: "Prevents browsers from MIME-sniffing a response away from the declared content-type.",
    remediation: "Add: X-Content-Type-Options: nosniff"
  },
  {
    name: "Referrer-Policy",
    key: "referrer-policy",
    importance: "low",
    check: (value) => (value ? "pass" : "fail"),
    description: "Controls how much referrer information is sent with requests, protecting user privacy.",
    remediation: "Add: Referrer-Policy: strict-origin-when-cross-origin"
  },
  {
    name: "Permissions-Policy",
    key: "permissions-policy",
    importance: "low",
    check: (value) => (value ? "pass" : "fail"),
    description: "Controls access to browser features (camera, microphone, geolocation) for the page.",
    remediation: "Add: Permissions-Policy: camera=(), microphone=(), geolocation=()"
  },
  {
    name: "Cross-Origin-Opener-Policy",
    key: "cross-origin-opener-policy",
    importance: "low",
    check: (value) => (value ? "pass" : "fail"),
    description: "Isolates browsing context to prevent cross-origin attacks via window references.",
    remediation: "Add: Cross-Origin-Opener-Policy: same-origin"
  },
  {
    name: "Cross-Origin-Resource-Policy",
    key: "cross-origin-resource-policy",
    importance: "low",
    check: (value) => (value ? "pass" : "fail"),
    description: "Prevents other origins from reading the response, blocking cross-origin data leaks.",
    remediation: "Add: Cross-Origin-Resource-Policy: same-origin"
  },
  {
    name: "X-XSS-Protection",
    key: "x-xss-protection",
    importance: "info",
    check: (value) => (value ? "pass" : "fail"),
    description: "Legacy XSS filter in older browsers. Modern browsers use CSP instead.",
    remediation: "Add: X-XSS-Protection: 1; mode=block (legacy browsers only; prioritize CSP)"
  },
  {
    name: "Server",
    key: "server",
    importance: "info",
    check: (value) => (value ? "warn" : "pass"),
    description: "Exposes server software and version, which aids attackers in targeting known vulnerabilities.",
    remediation: "Remove or redact the Server header to avoid disclosing server technology details."
  },
  {
    name: "X-Powered-By",
    key: "x-powered-by",
    importance: "info",
    check: (value) => (value ? "warn" : "pass"),
    description: "Discloses the server-side framework (e.g. Express, PHP), aiding targeted attacks.",
    remediation: "Remove the X-Powered-By header. In Express: app.disable('x-powered-by')"
  }
];

export function scoreHeaders(parsedHeaders) {
  const weights = { high: 10, medium: 6, low: 3 };

  let earned = 0;
  let total = 0;

  for (const check of HEADER_CHECKS) {
    if (check.importance === "info") continue;
    const weight = weights[check.importance];
    total += weight;
    const value = parsedHeaders[check.key] || null;
    const status = check.check(value);
    if (status === "pass") earned += weight;
  }

  if (total === 0) return 0;
  return Math.round((earned / total) * 100);
}
