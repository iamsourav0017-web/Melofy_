import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory / server cache storage
  const serverInquiries: any[] = [];

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Melofy Music Studio Backend",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/inquiries", (_req, res) => {
    res.json({ inquiries: serverInquiries });
  });

  app.post("/api/inquiries", (req, res) => {
    const inquiry = {
      ...req.body,
      id: req.body.id || `inq-${Date.now()}`,
      receivedAt: new Date().toISOString()
    };
    serverInquiries.unshift(inquiry);
    console.log(`[MELOFY STUDIO] New story brief received from ${inquiry.name} (${inquiry.package}): ${inquiry.occasion}`);
    res.status(201).json({ success: true, inquiry });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MELOFY STUDIO] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
