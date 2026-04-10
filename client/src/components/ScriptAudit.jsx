const RISK_ORDER = { high: 0, medium: 1, low: 2 };

const RISK_COLOR = {
  high: "var(--red)",
  medium: "var(--yellow)",
  low: "var(--green)",
};

const RISK_BG = {
  high: "var(--red-bg)",
  medium: "var(--yellow-bg)",
  low: "var(--green-bg)",
};

export default function ScriptAudit({ data }) {
  if (!data || data.error) {
    return (
      <div className="card">
        <div className="card-title">Third-Party Script Audit</div>
        <div className="cj-unavailable">
          Audit could not be completed{data?.error ? `: ${data.error}` : ""}
        </div>
      </div>
    );
  }

  const scripts = [...(data.externalScripts || [])].sort(
    (a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk]
  );
  const { riskSummary } = data;

  return (
    <div className="card">
      <div className="card-title">Third-Party Script Audit</div>

      <div className="sa-summary">
        <div className="sa-pill" style={{ color: "var(--red)", background: "var(--red-bg)", border: "1px solid rgba(248,113,113,0.25)" }}>
          {riskSummary.high} High risk
        </div>
        <div className="sa-pill" style={{ color: "var(--yellow)", background: "var(--yellow-bg)", border: "1px solid rgba(251,191,36,0.25)" }}>
          {riskSummary.medium} Medium risk
        </div>
        <div className="sa-pill" style={{ color: "var(--green)", background: "var(--green-bg)", border: "1px solid rgba(74,222,128,0.25)" }}>
          {riskSummary.low} Low risk
        </div>
      </div>

      {scripts.length === 0 ? (
        <div className="sa-empty">No external scripts detected.</div>
      ) : (
        <div className="sa-list">
          {scripts.map((s, i) => (
            <div key={i} className="sa-row">
              <div
                className="sa-dot"
                style={{ background: RISK_COLOR[s.risk] }}
              />
              <div className="sa-body">
                <div className="sa-top">
                  <span className="sa-hostname">{s.hostname}</span>
                  <span
                    className="sa-category"
                    style={{
                      color: RISK_COLOR[s.risk],
                      background: RISK_BG[s.risk],
                    }}
                  >
                    {s.category}
                  </span>
                  {s.insecure && (
                    <span className="sa-http-badge">HTTP</span>
                  )}
                </div>
                <div className="sa-src">{s.src}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
