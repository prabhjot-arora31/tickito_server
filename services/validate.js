import APIError from "./ApiError.js";
import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Create and pass APIError to your global error handler
    return next(
      new APIError(
        "ValidationError",
        400,
        true,
        errors
          .array()
          .map((e) => e.msg)
          .join(", ")
      )
    );
  }

  next();
};
