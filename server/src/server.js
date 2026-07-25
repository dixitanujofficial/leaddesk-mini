import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import "dotenv/config";
import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const requiredVariables = ["MONGO_URI", "JWT_SECRET"];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length) {
  throw new Error(
    `Missing required environment variable(s): ${missingVariables.join(", ")}`,
  );
}

const app = express();
const allowedOrigins = new Set(
  ["http://localhost:5173", ...(process.env.CLIENT_URL || "").split(",")]
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header include server health checks and non-browser tools.
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      const corsError = new Error("This origin is not allowed by CORS");
      corsError.statusCode = 403;
      return callback(corsError);
    },
  }),
);
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`API listening on port ${port}`));
  })
  .catch((error) => {
    console.error("Unable to connect to MongoDB:", error.message);
    process.exit(1);
  });
