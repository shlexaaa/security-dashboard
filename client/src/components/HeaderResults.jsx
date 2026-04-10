const SORT_ORDER = { fail: 0, warn: 1, pass: 2 };

export default function HeaderResults({ checkResults, rawHeaders }) {
  const sorted = [...checkResults].sort(
    (a, b) => SORT_ORDER[a.status] - SORT_ORDER[b.status]
  );

  return (
    <div className="card">
      <div className="card-title">HTTP Security Headers</div>
      <div className="header-rows">
        {sorted.map((r) => (
          <div key={r.key} className={`header-row ${r.status}`}>
            <div className={`status-dot ${r.status}`} />
            <span className={`status-badge ${r.status}`}>
              {r.status.toUpperCase()}
            </span>
            <span className="header-name">{r.name}</span>
            <span className="header-desc">
              {r.status === "pass" && r.value
                ? r.value
                : r.status === "warn" && r.value
                ? `Found: ${r.value}`
                : r.description}
            </span>
            <span className="importance-pill">{r.importance}</span>
          </div>
        ))}
      </div>
      <details>
        <summary className="raw-headers-summary">Raw headers</summary>
        <pre className="raw-pre">{rawHeaders}</pre>
      </details>
    </div>
  );
}
