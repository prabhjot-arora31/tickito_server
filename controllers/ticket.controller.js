import { PrismaClient } from "@prisma/client";
import { extractTextFromId } from "../services/ocr.js";
import { generateQrCode } from "../services/qrcode.js";
import { uploadImage } from "../services/cloudinaryService.js";
import APIResponse from "../services/ApiResponse.js";

const prisma = new PrismaClient();

export const bookTicket = async (req, res) => {
  const userId = req.user.id;
  const { eventId, total } = req.body;
  const eventExists = await prisma.event.findUnique({
    where: { id: Number(eventId) },
  });

  if (!eventExists) {
    return new APIResponse(false, "Event does not exists", null, 400).send(res);
  }
  const idCardFile = req.file; // single file upload
  console.log("idCardFile:", idCardFile);

  if (!idCardFile)
    return new APIResponse(false, "ID Card required", null, 400).send(res);

  // 2. Extract text via OCR
  const extractedText = await extractTextFromId(idCardFile.buffer);
  console.log("extractetText:", extractedText);

  // 3. Validate text
  if (!/raisoni/i.test(extractedText)) {
    return new APIResponse(
      false,
      "ID Card does not belong to Raisoni",
      null,
      400
    ).send(res);
  }

  // Optional: check expiry
  const expiryDate = new Date("2026-02-24");
  const today = new Date();
  if (today > expiryDate)
    return new APIResponse(false, "ID Expired", null, 400).send(res);
  // 4. Create ticket first to get ID
  // Upload ID card to cloud
  const uploadedIdCard = await uploadImage(
    `data:${idCardFile.mimetype};base64,${idCardFile.buffer.toString(
      "base64"
    )}`,
    "tickets/idcards"
  );
  const ticket = await prisma.ticket.create({
    data: {
      userId,
      eventId: Number(eventId),
      idCardUrl: uploadedIdCard.url,
      total: Number(total),
    },
  });
  const qrCode = await generateQrCode(ticket);
  if (!qrCode)
    return new APIResponse(false, "qrCode is invalid", null, 400).send(res);

  // 6. Update ticket with QR code and mark verified
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { qrCode, verified: true },
  });

  //   res.status(201).json({ success: true, ticket: updatedTicket });
  return new APIResponse(true, "Ticket booked successfully", ticket, 201).send(
    res
  );
};

export const getTicket = async (req, res) => {
  const userId = req.user.id;
  const ticket = await prisma.ticket.findFirst({
    where: {
      userId: Number(userId),
    },
  });
  return new APIResponse(true, "Ticket fetched successfully", ticket, 200).send(
    res
  );
};

// Controller: getTicketById.js

export const getTicketById = async (req, res) => {
  const userId = req.user.id; // Assuming user is authenticated and has an ID
  const { ticketId } = req.params; // Ticket ID from the URL parameter
  console.log(`both: ${ticketId} ${userId}`);
  try {
    // Fetch the ticket by ID and user ID (to ensure the ticket belongs to the user)
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: Number(ticketId),
        userId: Number(userId),
      },
      include: {
        event: true, // Optionally include event details
      },
    });

    // If ticket is found
    if (ticket) {
      return new APIResponse(
        true,
        "Ticket details fetched successfully",
        ticket,
        200
      ).send(res);
    } else {
      return new APIResponse(false, "Ticket not found", {}, 404).send(res);
    }
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return new APIResponse(false, "Failed to fetch ticket", {}, 500).send(res);
  }
};

// Controller to get all tickets for the logged-in user
export const getAllTickets = async (req, res) => {
  const userId = req.user.id; // Get user ID from the JWT token or session

  try {
    // Fetch all tickets associated with the user
    const tickets = await prisma.ticket.findMany({
      where: {
        userId: Number(userId),
      },
      include: {
        event: true, // Optionally include event details, if needed
      },
    });

    // Check if tickets are found
    if (tickets.length === 0) {
      return new APIResponse(false, "No tickets found", [], 200).send(res);
    }

    // Send the tickets data as response
    return new APIResponse(
      true,
      "Tickets fetched successfully",
      tickets,
      200
    ).send(res);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return new APIResponse(false, "Failed to fetch tickets", [], 500).send(res);
  }
};

export const getIsBooked = async (req, res) => {
  const userId = req.user.id;
  console.log("inside is-booked:", userId);
  const { eventId } = req.params;
  console.log("inside is-booked event:", eventId);
  const ticket = await prisma.ticket.findFirst({
    where: {
      AND: [
        {
          userId: Number(userId),
        },
        {
          eventId: Number(eventId),
        },
      ],
    },
  });
  console.log("ticket is:", ticket);
  return new APIResponse(true, "Booking status fetched", ticket, 200).send(res);
};
