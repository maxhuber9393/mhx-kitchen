require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  dest: "uploads/",
});

app.get("/", (req, res) => {
  res.send("Server läuft");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Kein Bild erhalten",
    });
  }

  try {
    const result = await Tesseract.recognize(req.file.path, "deu+ita");

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      text: result.data.text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "OCR fehlgeschlagen",
    });
  }
});

app.listen(3001, () => {
  console.log("Server läuft auf http://localhost:3001");
});