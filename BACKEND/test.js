const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/remove-bg", upload.single("image"), (req, res) => {
  const inputFilePath = req.file.path;
  const outputFilePath = `${inputFilePath}-no-bg.png`;

  exec(
    `python remove_bg.py ${inputFilePath} ${outputFilePath}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        if (!res.headersSent) {
          return res.status(500).send("Error processing image4");
        }
      }

      // Check if Python script returned "true"
      if (stdout.trim() === "true") {
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
      } else {
        if (!res.headersSent) {
          return res.status(500).send("Error processing image3");
        }
      }
    }
  );
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
