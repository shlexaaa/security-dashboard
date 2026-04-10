export function buildClaudePrompt(url, score, checkResults, dnsRaw) {
  const sortOrder = { fail: 0, warn: 1, pass: 2 };
  const sorted = [...checkResults].sort(
    (a, b) => sortOrder[a.status] - sortOrder[b.status]
  );

  const headerLines = sorted
    .map((r) => {
      const tag = r.status.toUpperCase();
      const val = r.value ? ` — found: "${r.value}"` : ` — ${r.description}`;
      return `[${tag}] ${r.name} (${r.importance})${val}`;
    })
    .join("\n");

  const divider = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

  const dnsSection = dnsRaw
    ? `${divider}\nDNS RECORDS:\n${dnsRaw.trim()}\n${divider}`
    : `${divider}\nDNS RECORDS:\n(DNS lookup failed or unavailable)\n${divider}`;

  return `I scanned ${url} with a security header scanner. Here are the full results.
Please give me a prioritized security analysis: what are the most critical issues, what is the likely attack surface based on these findings, and what should I fix first?

${divider}
SCAN TARGET: ${url}
SECURITY SCORE: ${score}/100
${divider}

HEADER CHECK RESULTS:
${headerLines}

${dnsSection}
`;
}
