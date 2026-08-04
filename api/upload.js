import multer from "multer";
import OpenAI from "openai";

const upload = multer({
  storage: multer.memoryStorage(),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
    });
  }

  upload.single("image")(req, res, async (err) => {
    if (err || !req.file) {
      return res.status(400).json({
        success: false,
        error: "Kein Bild erhalten",
      });
    }

    try {
      const base64 = req.file.buffer.toString("base64");

      const response = await openai.responses.create({
        model: "gpt-5-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Lies den gesamten Text aus diesem Bild. Antworte nur mit dem erkannten Text.",
              },
              {
                type: "input_image",
                image_url: `data:${req.file.mimetype};base64,${base64}`,
              },
            ],
          },
        ],
      });

      res.json({
        success: true,
        text: response.output_text,
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