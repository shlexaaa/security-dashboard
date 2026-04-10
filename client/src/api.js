export async function runScan(url) {
  const res = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || "Scan failed"), { status: res.status, data });
  return data;
}

export async function getHistory() {
  const res = await fetch("/api/history");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load history");
  return data;
}

export async function getHistoryItem(id) {
  const res = await fetch(`/api/history/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load scan");
  return data;
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete scan");
  return data;
}
