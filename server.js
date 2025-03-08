const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

// Serve index.html with injected environment variable
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Server Error');
    }
    console.log("Raw HTML content:", data); // Debug: log raw file content

    const authorizedSites = (process.env.AUTHORIZED_SITES && process.env.AUTHORIZED_SITES.trim() !== "")
      ? process.env.AUTHORIZED_SITES
      : "https://xingzheng.kahiether.com/";
    const result = data.replace(/\$\{AUTHORIZED_SITES\}/g, authorizedSites);
    console.log("Injected HTML:", result); // Debug: log result after replacement
    res.send(result);
  });
});


// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


