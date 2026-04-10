import { useState } from "react";
import Scanner from "./components/Scanner.jsx";
import History from "./components/History.jsx";

export default function App() {
  const [tab, setTab] = useState("scanner");

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-brand">
          <span className="nav-brand-icon">⬡</span>
          SecurityScan
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${tab === "scanner" ? "active" : ""}`}
            onClick={() => setTab("scanner")}
          >
            Scanner
          </button>
          <button
            className={`nav-tab ${tab === "history" ? "active" : ""}`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </div>
      </nav>
      <main className="main">
        {tab === "scanner" ? (
          <Scanner />
        ) : (
          <History onGoToScanner={() => setTab("scanner")} />
        )}
      </main>
    </div>
  );
}
