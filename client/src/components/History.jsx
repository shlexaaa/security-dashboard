import { useState, useEffect } from "react";
import { getHistory, getHistoryItem, deleteHistoryItem } from "../api.js";
import ReportCard from "./ReportCard.jsx";
import ScoreGauge from "./ScoreGauge.jsx";
import HeaderResults from "./HeaderResults.jsx";
import DnsResults from "./DnsResults.jsx";
import ClaudePrompt from "./ClaudePrompt.jsx";

function Modal({ scan, onClose }) {
  // Close on backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-title">
          {scan.url} — {new Date(scan.timestamp).toLocaleString()}
        </div>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Security Score</div>
          <ScoreGauge score={scan.score} />
        </div>
        <HeaderResults
          checkResults={scan.checkResults}
          rawHeaders={scan.rawHeaders}
        />
        <DnsResults dnsRaw={scan.dnsRaw} />
        <ClaudePrompt claudePrompt={scan.claudePrompt} />
      </div>
    </div>
  );
}

export default function History({ onGoToScanner }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalScan, setModalScan] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      const data = await getHistory();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpen(id) {
    setModalLoading(true);
    setModalScan(null);
    try {
      const data = await getHistoryItem(id);
      setModalScan(data);
    } catch {
      // ignore
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteHistoryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div>
        <div className="card">
          <div className="card-title">Scan History</div>
        </div>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Scan History</div>
        {items.length === 0 ? (
          <div className="empty-state">
            <p>No scans yet.</p>
            <button className="btn btn-primary" onClick={onGoToScanner}>
              Run your first scan
            </button>
          </div>
        ) : (
          <div className="history-list">
            {items.map((item) => (
              <ReportCard
                key={item.id}
                {...item}
                onDelete={handleDelete}
                onOpen={handleOpen}
              />
            ))}
          </div>
        )}
      </div>

      {modalLoading && (
        <div className="modal-backdrop">
          <div className="spinner spinner-lg" style={{ marginTop: 80 }} />
        </div>
      )}

      {modalScan && (
        <Modal scan={modalScan} onClose={() => setModalScan(null)} />
      )}
    </div>
  );
}
