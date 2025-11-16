import APIError from "../services/ApiError.js";

const errorHandler = (err, req, res, next) => {
  if (!err) return next();

  let apiErr;

  if (err instanceof APIError) {
    apiErr = err;
  } else {
    apiErr = new APIError(
      err.name || "InternalError",
      err.httpCode || 500,
      false,
      err.message || "Something went wrong"
    );

    apiErr.internalStack = err.stack; // for logging only
  }

  // Always log full stack on server
  console.error(apiErr);

  // Always send safe error to client
  const payload = {
    success: false,
    name: apiErr.name,
    message: apiErr.description,
  };

  // Only in development: expose stack
  if (process.env.NODE_ENV === "development") {
    payload.stack = apiErr.internalStack || apiErr.stack;
  }

  return res.status(apiErr.httpCode || 500).json(payload);
};

export default errorHandler;
