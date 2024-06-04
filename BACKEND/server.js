const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const os = require("os");
const cors = require("cors"); // Import cors package

const app = express();
const port = 3000;

const upload = multer({ dest: "uploads/" });

const pythonCommand = os.platform() === "win32" ? "python" : "python3";

app.use(cors()); // Use the cors middleware

app.post("/upload", upload.single("image"), (req, res) => {
  const file = req.file;
  const id = uuidv4();
  const fileExtension = path.extname(file.originalname);
  const inputFilePath = `uploads/${id}${fileExtension}`;
  const outputFilePath = `outputs/${id}.png`;

  fs.rename(file.path, inputFilePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error renaming file");
    }

    exec(
      `${pythonCommand} remove_bg.py ${inputFilePath} ${outputFilePath}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).send("Error processing image");
        }

        res.json({ id });
      }
    );
  });
});

app.get("/status/:id", (req, res) => {
  const id = req.params.id;
  const outputFilePath = path.resolve(`outputs/${id}.png`);

  fs.access(outputFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.json({ status: "processing" });
    }

    res.json({ status: "completed" });
  });
});

app.get("/image/:id", (req, res) => {
  const id = req.params.id;
  const outputFilePath = path.resolve(`outputs/${id}.png`);
  // const inputFilePath = path.resolve(`uploads/${id}${fileExtension}`);
  res.sendFile(outputFilePath);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
