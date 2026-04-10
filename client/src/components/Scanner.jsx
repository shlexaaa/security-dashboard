import { useState } from "react";
import { runScan } from "../api.js";
import ScoreGauge from "./ScoreGauge.jsx";
import HeaderResults from "./HeaderResults.jsx";
import DnsResults from "./DnsResults.jsx";
import ClaudePrompt from "./ClaudePrompt.jsx";

const STEPS = [
  "Fetching headers and DNS...",
  "Building report..."
];

export default function Scanner() {
  const [url, setUrl] = useState("");
  const [inputError, setInputError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function validate(value) {
    if (!value) return "Please enter a URL.";
    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      return "URL must start with http:// or https://";
    }
    return "";
  }

  async function handleScan(e) {
    e.preventDefault();
    const err = validate(url.trim());
    if (err) {
      setInputError(err);
      return;
    }
    setInputError("");
    setError(null);
    setResult(null);
    setScanning(true);
    setStep(0);

    try {
      setStep(1);
      const data = await runScan(url.trim());
      setStep(2);
      // Small delay so the user sees step 2
      await new Promise((r) => setTimeout(r, 300));
      setResult(data);
    } catch (err) {
      if (err.status === 429) {
        setError("Too many scans. Please wait a moment.");
      } else if (!err.status) {
        setError("Could not reach the server. Is it running?");
      } else {
        setError(err.data?.error || err.message || "Scan failed.");
      }
    } finally {
      setScanning(false);
      setStep(0);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Scan a Website</div>
        <form onSubmit={handleScan} noValidate>
          <div className="scanner-form">
            <input
              type="url"
              className={`url-input ${inputError ? "error" : ""}`}
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (inputError) setInputError("");
              }}
              disabled={scanning}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={scanning}
            >
              {scanning ? <span className="spinner" /> : null}
              {scanning ? "Scanning" : "Scan"}
            </button>
          </div>
          {inputError && <div className="input-error">{inputError}</div>}
        </form>

        {scanning && step > 0 && (
          <div className="step-progress">
            {STEPS.map((label, i) => (
              <div
                key={i}
                className={step === i + 1 ? "step-active" : ""}
                style={{ opacity: step > i + 1 ? 0.4 : 1 }}
              >
                [{i + 1}/{STEPS.length}] {label}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button
            className="error-banner-close"
            onClick={() => setError(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {result && (
        <div className="results-stack">
          <div className="card">
            <div className="card-title">Security Score — {result.url}</div>
            <ScoreGauge score={result.score} />
          </div>
          <HeaderResults
            checkResults={result.checkResults}
            rawHeaders={result.rawHeaders}
          />
          <DnsResults dnsRaw={result.dnsRaw} />
          <ClaudePrompt claudePrompt={result.claudePrompt} />
        </div>
      )}
    </div>
  );
}
