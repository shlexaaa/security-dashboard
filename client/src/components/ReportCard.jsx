import { useState, useEffect, useRef } from "react";

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function scoreColor(score) {
  if (score >= 75) return "var(--green)";
  if (score >= 45) return "var(--yellow)";
  return "var(--red)";
}

export default function ReportCard({ id, url, score, timestamp, onDelete, onOpen }) {
  const [confirmState, setConfirmState] = useState("idle"); // idle | confirm
  const confirmTimer = useRef(null);

  function handleDelete(e) {
    e.stopPropagation();
    if (confirmState === "idle") {
      setConfirmState("confirm");
      confirmTimer.current = setTimeout(() => setConfirmState("idle"), 3000);
    } else {
      clearTimeout(confirmTimer.current);
      onDelete(id);
    }
  }

  useEffect(() => () => clearTimeout(confirmTimer.current), []);

  return (
    <div className="report-card" onClick={() => onOpen(id)}>
      <div className="report-card-score" style={{ color: scoreColor(score) }}>
        {score}
      </div>
      <div className="report-card-body">
        <div className="report-card-url">{url}</div>
        <div className="report-card-time">{relativeTime(timestamp)}</div>
      </div>
      <button
        className={`report-card-delete ${confirmState === "confirm" ? "confirm" : ""}`}
        onClick={handleDelete}
        title={confirmState === "confirm" ? "Click again to confirm" : "Delete"}
      >
        {confirmState === "confirm" ? "Sure?" : "×"}
      </button>
    </div>
  );
}
