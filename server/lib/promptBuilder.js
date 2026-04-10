export function buildClaudePrompt(url, score, checkResults, dnsRaw, clickjackTest, scriptAudit) {
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

  // Clickjacking section
  let clickjackSection = `${divider}\nCLICKJACKING TEST:\n`;
  if (!clickjackTest || clickjackTest.error) {
    clickjackSection += `Test could not be completed${clickjackTest?.error ? `: ${clickjackTest.error}` : ""}\n${divider}`;
  } else {
    const vulnerable = clickjackTest.vulnerable === true ? "YES" : clickjackTest.vulnerable === false ? "NO" : "UNKNOWN";
    clickjackSection +=
      `Vulnerable: ${vulnerable}\n` +
      `Reason: ${clickjackTest.reason}\n` +
      `X-Frame-Options: ${clickjackTest.xFrameOptions || "not set"}\n` +
      `CSP frame-ancestors: ${clickjackTest.frameAncestors || "not set"}\n` +
      divider;
  }

  // Script audit section
  let scriptSection = "";
  if (!scriptAudit || scriptAudit.error) {
    scriptSection = `${divider}\nTHIRD-PARTY SCRIPTS:\nAudit could not be completed${scriptAudit?.error ? `: ${scriptAudit.error}` : ""}\n${divider}`;
  } else {
    const ext = scriptAudit.externalScripts || [];
    scriptSection = `${divider}\nTHIRD-PARTY SCRIPTS (${ext.length} external scripts found):\n`;
    if (ext.length === 0) {
      scriptSection += "No external scripts detected.\n";
    } else {
      scriptSection += ext
        .map((s) => {
          const insecureTag = s.insecure ? " (loaded over HTTP!)" : "";
          return `[${s.risk.toUpperCase()} RISK] ${s.hostname} — ${s.category}${insecureTag}`;
        })
        .join("\n");
      scriptSection += "\n";
    }
    scriptSection += divider;
  }

  return `I scanned ${url} with a security header scanner. Here are the full results.
Please give me a prioritized security analysis: what are the most critical issues, what is the likely attack surface based on these findings, and what should I fix first?

${divider}
SCAN TARGET: ${url}
SECURITY SCORE: ${score}/100
${divider}

HEADER CHECK RESULTS:
${headerLines}

${dnsSection}
${clickjackSection}
${scriptSection}
`;
}
