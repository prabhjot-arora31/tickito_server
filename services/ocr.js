import Tesseract from "tesseract.js";

export const extractTextFromId = async (imageBuffer) => {
  const {
    data: { text },
  } = await Tesseract.recognize(imageBuffer, "eng");
  return text;
};
