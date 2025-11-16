import QRCode from "qrcode";

export const generateQrCode = async (ticket) => {
  // Can encode ticketId or any info you want in the QR
  const qrData = `ticket:${ticket.id}-userId:${ticket.userId}-eventId:${ticket.eventId}`;
  const qrCodeUrl = await QRCode.toDataURL(qrData); // returns base64 image
  return qrCodeUrl;
};
