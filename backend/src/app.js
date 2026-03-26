import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import applicationRoutes from "./routes/applicationRoutes.js";
import { dbConfig } from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    mode: dbConfig.useMockData ? "mock" : "dynamodb",
    table: dbConfig.tableName
  });
});

app.use("/", applicationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

export default app;
