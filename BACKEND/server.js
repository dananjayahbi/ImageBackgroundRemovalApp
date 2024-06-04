const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

// Ensure the "outputs" directory exists
if (!fs.existsSync("outputs")) {
  fs.mkdirSync("outputs");
}

// Serve static files from the "outputs" directory
app.use('/outputs', express.static('outputs'));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage: storage });

const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`exec error: ${error}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

app.post("/remove-bg", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const inputFilePath = req.file.path;
  const outputFilePath = `outputs/${req.file.filename}-output.png`;

  console.log(`Processing file: ${inputFilePath}`);

  try {
    await execPromise(`python remove_bg.py ${inputFilePath} ${outputFilePath}`);

    fs.access(outputFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File not found: ${outputFilePath}`);
        return res.status(500).send("Error processing image");
      }

      console.log(`Successfully processed file: ${outputFilePath}`);
      res.json({ imageUrl: `http://localhost:${port}/outputs/${path.basename(outputFilePath)}` });

      // Clean up files
      fs.unlink(inputFilePath, (err) => {
        if (err) console.error(`Error deleting input file: ${err}`);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing image");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
