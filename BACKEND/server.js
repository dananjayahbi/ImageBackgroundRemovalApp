const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

const upload = multer({ dest: "uploads/" });

app.post("/remove-bg", upload.single("image"), (req, res) => {
  const inputFilePath = req.file.path;
  const outputFilePath = `outputs/${req.file.filename}-output.png`;

  exec(
    `python remove_bg.py ${inputFilePath} ${outputFilePath}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        if (!res.headersSent) {
          return res.status(500).send("Error processing image4");
        }
      } else {
        res.sendFile(path.resolve(outputFilePath), (err) => {
          if (err) {
            console.error(`File send error: ${err}`);
            if (err.code !== "ECONNABORTED" && !res.headersSent) {
              return res.status(500).send("Error sending image");
            }
          } else {
            // Clean up files only if there was no error sending the file
            try {
              fs.unlinkSync(inputFilePath);
              fs.unlinkSync(outputFilePath);
            } catch (unlinkErr) {
              console.error(`File deletion error: ${unlinkErr}`);
            }
          }
        });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
