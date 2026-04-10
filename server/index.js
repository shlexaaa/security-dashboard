import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { scanRouter } from "./routes/scan.js";
import { historyRouter } from "./routes/history.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  message: { error: "Too many requests, please slow down." }
});
app.use("/api/", limiter);

app.use("/api/scan", scanRouter);
app.use("/api/history", historyRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (_, res) =>
    res.sendFile(path.join(__dirname, "../client/dist/index.html"))
  );
}

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
