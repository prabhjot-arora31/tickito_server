import { PrismaClient } from "@prisma/client";
import { uploadImage, uploadVideo } from "../services/cloudinaryService.js";
import APIResponse from "../services/ApiResponse.js";

const prisma = new PrismaClient();
export const addEvent = async (req, res) => {
  const { title, description } = req.body;

  try {
    const images = [];
    const videos = [];
    let posterUrl = null;

    // Upload poster
    if (req.files?.poster?.[0]) {
      const result = await uploadImage(
        `data:${
          req.files.poster[0].mimetype
        };base64,${req.files.poster[0].buffer.toString("base64")}`,
        "events/posters"
      );
      if (result.success) posterUrl = result.url;
    }

    // Upload images
    if (req.files?.images) {
      for (const file of req.files.images) {
        const result = await uploadImage(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          "events/images"
        );
        if (result.success)
          images.push({ url: result.url, publicId: result.publicId });
      }
    }

    // Upload videos
    if (req.files?.videos) {
      for (const file of req.files.videos) {
        const result = await uploadVideo(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          "events/videos"
        );
        if (result.success)
          videos.push({ url: result.url, publicId: result.publicId });
      }
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        poster: posterUrl,
        images: images.map((img) => img.url),
        videos: videos.map((vid) => vid.url),
      },
    });

    new APIResponse(true, "Event added successfully", event, 201).send(res);
  } catch (error) {
    console.error(error);
    new APIResponse(false, "Failed to add event", error, 500).send(res);
  }
};

export const searchEvent = async (req, res) => {
  const { s } = req.params;
  console.log("s is:", s);
  const events = await prisma.event.findMany({
    where: {
      title: {
        contains: s,
        mode: "insensitive",
      },
    },
  });
  return new APIResponse(true, "Events fetched", events, 200).send(res);
};

export const getEvents = async (req, res) => {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      poster: true,
    },
  });
  return new APIResponse(true, "Events fetched successfully", events, 200).send(
    res
  );
};

export const getEventDetail = async (req, res) => {
  const { eventId } = req.params;
  const event = await prisma.event.findUnique({
    where: {
      id: Number(eventId),
    },
  });
  return new APIResponse(
    true,
    "Event detail fetched successfully",
    event,
    200
  ).send(res);
};
