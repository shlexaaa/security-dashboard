import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../../data/db.json");

let dbInstance = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await JSONFilePreset(dbPath, { scans: [] });
  }
  return dbInstance;
}
