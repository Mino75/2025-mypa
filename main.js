document.addEventListener('DOMContentLoaded', function() {
  let authorizedSites = [];

  // Initialization: sort the sites and create the default screen
  function initializeAuthorizedSites(sites) {
    authorizedSites = sites;
    authorizedSites.sort((a, b) => {
      const nameA = a.replace(/^https:\/\//, '');
      const nameB = b.replace(/^https:\/\//, '');
      return nameA.localeCompare(nameB);
    });
    createScreens(1);
  }

  // Create screens and dropdown menus
  function createScreens(count) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';
    mainContent.classList.remove('grid-1', 'grid-2', 'grid-3', 'grid-4');
    mainContent.classList.add('grid-' + (count === 20 ? 4 : count));

    for (let i = 0; i < count; i++) {
      const screenDiv = document.createElement('div');
      screenDiv.className = 'screen';

      // Create dropdown list
      const select = document.createElement('select');
      const defaultOption = document.createElement('option');
      defaultOption.text = 'Select a site';
      defaultOption.value = '';
      select.appendChild(defaultOption);

      authorizedSites.forEach(url => {
        const option = document.createElement('option');
        option.value = url;
        option.text = url.replace(/^https:\/\//, '').split('.')[0];
        select.appendChild(option);
      });

      // Create iframe to load the selected site
      const iframe = document.createElement('iframe');
      select.addEventListener('change', function() {
        iframe.src = this.value;
      });

      screenDiv.appendChild(select);
      screenDiv.appendChild(iframe);
      mainContent.appendChild(screenDiv);
    }
  }

  // Merge authorized sites from authorized-sites.json and the environment variable
  function mergeAuthorizedSites() {
    // If the environment variable is empty, set it to the default value.
    if (!window.authorizedSitesFromEnv || window.authorizedSitesFromEnv.trim() === "") {
      window.authorizedSitesFromEnv = "https://hongkoala.com/";
    }
  
    // Fetch the content from authorized-sites.json
    return fetch('authorized-sites.json')
      .then(response => response.json())
      .then(jsonData => {
        // Extract sites from the JSON data
        let jsonSites = [];
        if (jsonData && Array.isArray(jsonData.sites)) {
          jsonSites = jsonData.sites;
        } else {
          console.error("authorized-sites.json does not contain a valid 'sites' array.");
        }
  
        // Process the environment variable (now filled with default if it was empty)
        let envSites = window.authorizedSitesFromEnv
          .split(',')
          .map(site => site.trim())
          .filter(site => site !== '');
  
        // Merge both arrays and remove duplicates
        const mergedSites = Array.from(new Set([...jsonSites, ...envSites]));
  
        // Update IndexedDB with the merged list (optional)
        db.setAuthorizedSites(mergedSites)
          .catch(err => console.error("Error saving merged sites to IndexedDB:", err));
  
        return mergedSites;
      })
      .catch(err => {
        console.error("Error fetching authorized-sites.json:", err);
        // If fetching JSON fails, fall back to processing the environment variable (already set to default if empty)
        let envSites = window.authorizedSitesFromEnv
          .split(',')
          .map(site => site.trim())
          .filter(site => site !== '');
        return envSites;
      });
  }
  

  // Merge sites and initialize authorized sites
  mergeAuthorizedSites().then(mergedSites => {
    initializeAuthorizedSites(mergedSites);
  });

  // Clear Cache functionality
  const clearCacheButton = document.getElementById('clear-cache-btn');
  if (clearCacheButton) {
    clearCacheButton.addEventListener('click', function() {
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }).then(() => {
          alert('Cache cleared successfully!');
        }).catch(err => console.error('Error clearing cache:', err));
      } else {
        alert('Cache API not supported in this browser.');
      }
    });
  }
});  // <-- This closes the DOMContentLoaded event listener

// Register Service Worker (outside the DOMContentLoaded if preferred)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('Service Worker registered with scope:', registration.scope))
      .catch(error => console.error('Service Worker registration failed:', error));
  });
}
