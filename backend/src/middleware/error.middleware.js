import { logger } from "../utils/logger.js";

export const notFoundHandler = (req, res) => {
  logger.warn("route_not_found", {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
  });

  return res.status(404).json({
    message: "Route not found",
    requestId: req.id,
  });
};

export const errorHandler = (err, req, res, _next) => {
  console.error("\n❌ ============== BROWSER TRANSACTION CRASH ==============");
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.error(`💡 Request Body:`, JSON.stringify(req.body, null, 2));
  console.error(`🔥 Error Message: ${err.message}`);
  console.error(`🎛️ Stack Trace:\n`, err.stack);
  console.error("=========================================================\n");

  const statusCode = err.status || err.statusCode || 500;

  if (res.headersSent) {
    return;
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    trace: process.env.NODE_ENV === "development" || process.env.APP_ENV === "development" ? err.stack : undefined,
    requestId: req.id
  });
};