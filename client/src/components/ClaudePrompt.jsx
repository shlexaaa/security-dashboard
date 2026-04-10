import { useState } from "react";

export default function ClaudePrompt({ claudePrompt }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(claudePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the textarea text
      const ta = document.getElementById("claude-prompt-textarea");
      if (ta) {
        ta.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }

  return (
    <div className="card">
      <div className="claude-header">
        <div className="claude-header-text">
          <h3>Analyze with Claude (free)</h3>
          <p>
            Copy this prompt and paste it into claude.ai to get a full AI
            security analysis.
          </p>
        </div>
        <a
          href="https://claude.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="claude-open-btn"
        >
          Open claude.ai →
        </a>
      </div>

      <textarea
        id="claude-prompt-textarea"
        className="prompt-textarea"
        readOnly
        value={claudePrompt}
        spellCheck={false}
      />

      <div className="copy-btn-wrap">
        <button
          className={`copy-btn ${copied ? "copied" : ""}`}
          onClick={handleCopy}
        >
          {copied ? "Copied ✓" : "Copy prompt"}
        </button>
      </div>
    </div>
  );
}
