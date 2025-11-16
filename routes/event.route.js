import express from "express";
const eventRoute = express.Router();
import asyncHandler from "express-async-handler";
import { body } from "express-validator";
import { validate } from "../services/validate.js";
import {
  addEvent,
  getEventDetail,
  getEvents,
  searchEvent,
} from "../controllers/event.controller.js";
import multer from "multer";
import protectedRoute from "../middleware/protected_route.js";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max per file
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|mp4|mov|mkv/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else
      cb(
        new Error("Unsupported file type (Allowed file types are: image/video)")
      );
  },
});
const eventAddRules = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Event title must be 3 characters long"),
  body("description").notEmpty().withMessage("Description is required"),
];

eventRoute
  .get("/get-events", protectedRoute, asyncHandler(getEvents))
  .get(
    "/get-event-detail/:eventId",
    protectedRoute,
    asyncHandler(getEventDetail)
  )
  .post(
    "/add",
    upload.fields([
      { name: "poster", maxCount: 1 },
      { name: "images", maxCount: 5 }, // max 5 images
      { name: "videos", maxCount: 2 }, // max 2 videos
    ]),
    eventAddRules,
    validate,
    asyncHandler(addEvent)
  )
  .get("/search/:s", asyncHandler(searchEvent));
export default eventRoute;
