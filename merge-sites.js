// merge-sites.js
const fs = require('fs');
const path = require('path');

// Path to the existing JSON file
const filePath = path.join(__dirname, 'authorized-sites.json');

// Read the existing JSON file
let baseConfig = { sites: [] };
try {
  const data = fs.readFileSync(filePath, 'utf8');
  baseConfig = JSON.parse(data);
} catch (error) {
  console.error('Error reading authorized-sites.json:', error);
  process.exit(1);
}

// Retrieve additional sites from the environment variable
let additionalSites = [];
if (process.env.ADDITIONAL_SITES) {
  try {
    // Expecting a JSON array or comma-separated string.
    // If it's a JSON array:
    additionalSites = JSON.parse(process.env.ADDITIONAL_SITES);
    
    // Alternatively, if it's a comma-separated string, uncomment the following line:
    // additionalSites = process.env.ADDITIONAL_SITES.split(',');
  } catch (error) {
    console.error('Error parsing ADDITIONAL_SITES:', error);
    process.exit(1);
  }
}

// Merge the two arrays (remove duplicates)
const mergedSites = Array.from(new Set([...baseConfig.sites, ...additionalSites]));

// Update the configuration object
baseConfig.sites = mergedSites;

// Write the updated configuration back to the file
try {
  fs.writeFileSync(filePath, JSON.stringify(baseConfig, null, 2), 'utf8');
  console.log('authorized-sites.json updated successfully.');
} catch (error) {
  console.error('Error writing authorized-sites.json:', error);
  process.exit(1);
}
