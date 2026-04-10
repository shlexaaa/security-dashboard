export default function ClickjackResult({ data }) {
  const unavailable = !data || data.error;

  return (
    <div className="card">
      <div className="card-title">Clickjacking Test</div>

      {unavailable ? (
        <div className="cj-unavailable">
          Test could not be completed{data?.error ? `: ${data.error}` : ""}
        </div>
      ) : (
        <>
          <div className={`cj-banner ${data.vulnerable ? "cj-vulnerable" : "cj-protected"}`}>
            {data.vulnerable
              ? "VULNERABLE — No framing protection detected"
              : data.vulnerable === false
              ? "PROTECTED — Framing is restricted"
              : "UNKNOWN — Could not determine framing policy"}
          </div>

          <div className="cj-details">
            <div className="cj-row">
              <span className="cj-label">X-Frame-Options</span>
              <span className={`cj-value ${data.xFrameOptions ? "" : "cj-notset"}`}>
                {data.xFrameOptions || "not set"}
              </span>
            </div>
            <div className="cj-row">
              <span className="cj-label">CSP frame-ancestors</span>
              <span className={`cj-value ${data.frameAncestors ? "" : "cj-notset"}`}>
                {data.frameAncestors || "not set"}
              </span>
            </div>
          </div>

          <div className="cj-reason">{data.reason}</div>
        </>
      )}
    </div>
  );
}
