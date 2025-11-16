// middlewares/errorHandler.js
import APIError from "../services/ApiError.js";

const isProd = process.env.NODE_ENV === "production";

const errorHandler = (err, req, res, next) => {
  console.log("isProd:", isProd);
  if (!err) return next();

  // If it's already our APIError, keep it. Otherwise, wrap it but preserve info.
  let apiErr;
  if (err instanceof APIError) {
    apiErr = err;
  } else {
    // Wrap unknown errors. Mark isOperational false by default.
    apiErr = new APIError(
      err.name == "PrismaClientInitializationError"
        ? "Database Connection Error"
        : err.name || "InternalError",
      err.httpCode || 500,
      false,
      err.message || String(err)
    );

    // Preserve original error for debugging (keeps original stack)
    apiErr.originalError = err;
    if (err.stack) {
      // Option: append original stack or replace stack with original stack
      apiErr.stack = `${apiErr.stack}\nCaused by: ${err.stack}`;
    }
  }

  // Log full error (stack) — you keep trace on server side
  console.error(apiErr);

  // Build response payload, but avoid leaking stack in production
  const payload = {
    success: false,
    name: apiErr.name,
    message: apiErr.description || apiErr.message,
    isOperational: apiErr.isOperational,
  };

  if (!isProd) {
    // include stack for dev (so you can see where class originated)
    payload.stack = apiErr.stack;
    // optionally include originalError details:
    if (apiErr.originalError && apiErr.originalError.stack) {
      payload.originalStack = apiErr.originalError.stack;
    }
  }

  return res.status(apiErr.httpCode || 500).json(payload);
};

export default errorHandler;
