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
  const statusCode =
    Number.isInteger(err?.statusCode) && err.statusCode >= 400
      ? err.statusCode
      : 500;

  logger.error("request_failed", {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error: err?.message || "Unknown error",
    stack: process.env.APP_ENV === "development" ? err?.stack : undefined,
  });

  if (res.headersSent) {
    return;
  }

  return res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message,
    requestId: req.id,
  });
};