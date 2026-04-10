const RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "CNAME", "NS", "SOA", "PTR", "SRV"];

function highlightDns(text) {
  if (!text) return [];
  return text.split("\n").map((line, i) => {
    let highlighted = line;
    // Replace record type tokens (whole-word) with a span
    for (const type of RECORD_TYPES) {
      highlighted = highlighted.replace(
        new RegExp(`\\b(${type})\\b`, "g"),
        `<span class="dns-record-type">$1</span>`
      );
    }
    return (
      <div
        key={i}
        dangerouslySetInnerHTML={{ __html: highlighted || "\u00A0" }}
      />
    );
  });
}

export default function DnsResults({ dnsRaw }) {
  if (!dnsRaw) {
    return (
      <div className="card">
        <div className="card-title">DNS Records</div>
        <pre className="dns-pre" style={{ color: "var(--text-dim)" }}>
          DNS lookup unavailable
        </pre>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">DNS Records</div>
      <pre className="dns-pre">{highlightDns(dnsRaw)}</pre>
    </div>
  );
}
