const express = require('express');
const app = express();
const path = require('path');

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Endpoint to serve configuration as a JavaScript file.
app.get('/config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  let sites = [];

  if (process.env.AUTHORIZED_SITES_JSON) {
    try {
      // Expecting a JSON array or an object with a "sites" property.
      const parsed = JSON.parse(process.env.AUTHORIZED_SITES_JSON);
      sites = Array.isArray(parsed) ? parsed : parsed.sites || [];
    } catch (e) {
      console.error("Error parsing AUTHORIZED_SITES_JSON:", e);
    }
  }
  
  // If sites is empty, fallback to reading the local JSON file.
  if (sites.length === 0) {
    try {
      const data = fs.readFileSync(path.join(__dirname, 'authorized-sites.json'), 'utf8');
      const parsed = JSON.parse(data);
      sites = parsed.sites || [];
    } catch (e) {
      console.error("Error reading authorized-sites.json:", e);
    }
  }

  // Send out JavaScript that sets the global variable.
  res.send(`window.AUTHORIZED_SITES = ${JSON.stringify(sites)};`);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
