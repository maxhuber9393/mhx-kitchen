import multer from "multer";
import Tesseract from "tesseract.js";

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  upload.single("image")(req, res, async (err) => {
    if (err || !req.file) {
      return res.status(400).json({
        success: false,
        error: "Kein Bild erhalten",
      });
    }

    try {
      const result = await Tesseract.recognize(
        req.file.buffer,
        "deu+ita"
      );

      res.json({
        success: true,
        text: result.data.text,
      });
    } catch (e) {
      console.error(e);

      res.status(500).json({
        success: false,
        error: "OCR fehlgeschlagen",
      });
    }
  });
}

export default handler;