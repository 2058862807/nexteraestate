import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";

import { registerRoutes } from "./routes"; // Make sure this file exists
import { setupVite, log } from "./vite";   // Optional, dev only

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware to capture JSON body and log
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom middleware to capture and log responses
app.use((req, res, next) => {
  const start = Date.now();
  let capturedResponse: any;

  const originalJson = res.json.bind(res);
  res.json = (...args: any[]) => {
    capturedResponse = args[0];
    return originalJson(...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (capturedResponse) {
        logLine += ` - ${JSON.stringify(capturedResponse).slice(0, 200)}`;
      }
      console.log(logLine);
    }
  });

  next();
});

(async () => {
  // Register backend API routes
  await registerRoutes(app);

  // Error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Serve frontend
  if (process.env.NODE_ENV === "production") {
    console.log("[SERVER] Production mode – serving static files");

    const distPath = path.join(__dirname, "../../client/dist");
    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log("[SERVER] Development mode – using Vite middleware");
    await setupVite(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, "0.0.0.0", () => {
    console.log(`[SERVER] Listening on port ${port}`);
  });
})();


