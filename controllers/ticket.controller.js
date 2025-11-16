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

export const getIsBooked = async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.params;
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
  return new APIResponse(true, "Booking status fetched", ticket, 200).send(res);
};
