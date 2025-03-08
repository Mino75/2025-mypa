document.addEventListener('DOMContentLoaded', function() {
  let authorizedSites = [];

  // Function to initialize the authorized sites
  function initializeAuthorizedSites(sites) {
    authorizedSites = sites;
    // Sort sites alphabetically after removing the "https://"
    authorizedSites.sort((a, b) => {
      const nameA = a.replace(/^https:\/\//, '');
      const nameB = b.replace(/^https:\/\//, '');
      return nameA.localeCompare(nameB);
    });
    // Create the default layout (1 screen)
    createScreens(1);
  }

  // Check if the AUTHORIZED_SITES_JSON environment variable is provided
  const authorizedSitesJson = process.env.AUTHORIZED_SITES_JSON;
  if (authorizedSitesJson) {
    try {
      const data = JSON.parse(authorizedSitesJson);
      initializeAuthorizedSites(data.sites);
    } catch (err) {
      console.error('Error parsing AUTHORIZED_SITES_JSON:', err);
    }
  } else {
    // Load authorized sites from the JSON file.
    fetch('authorized-sites.json')
      .then(response => response.json())
      .then(data => {
        initializeAuthorizedSites(data.sites);
      })
      .catch(err => console.error('Error loading authorized sites:', err));
  }

  // Listen for clicks on the sidebar layout buttons.
  document.querySelectorAll('.sidebar button').forEach(button => {
    button.addEventListener('click', function() {
      const numScreens = parseInt(this.getAttribute('data-screens'));
      createScreens(numScreens);
    });
  });

  // Function to generate the screens in the main container.
  function createScreens(count) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = ''; // Clear any existing screens

    // Remove any previously set grid classes and add the new one.
    mainContent.classList.remove('grid-1', 'grid-2', 'grid-3', 'grid-4');
    // For 20 screens, we use 4 columns (resulting in 5 rows on desktop)
    mainContent.classList.add('grid-' + (count === 20 ? 4 : count));

    for (let i = 0; i < count; i++) {
      const screenDiv = document.createElement('div');
      screenDiv.className = 'screen';

      // Create the dropdown list.
      const select = document.createElement('select');
      const defaultOption = document.createElement('option');
      defaultOption.text = 'Select a site';
      defaultOption.value = '';
      select.appendChild(defaultOption);

      authorizedSites.forEach(url => {
        const option = document.createElement('option');
        option.value = url;
        // Display the URL without "https://"
        option.text = url.replace(/^https:\/\//, '').split('.')[0];
        select.appendChild(option);
      });

      // Create the iframe that will load the selected site.
      const iframe = document.createElement('iframe');

      // When a site is selected, update the iframe source.
      select.addEventListener('change', function() {
        iframe.src = this.value;
      });

      // Append the dropdown and the iframe to the screen container.
      screenDiv.appendChild(select);
      screenDiv.appendChild(iframe);
      mainContent.appendChild(screenDiv);
    }
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Clear cache functionality
document.addEventListener('DOMContentLoaded', function() {
  // Cache clearing button listener
  const clearCacheButton = document.getElementById('clear-cache-btn');
  if (clearCacheButton) {
    clearCacheButton.addEventListener('click', function() {
      if ('caches' in window) {
        caches.keys().then(function(cacheNames) {
          return Promise.all(
            cacheNames.map(function(cacheName) {
              return caches.delete(cacheName);
            })
          );
        }).then(function() {
          alert('Cache cleared successfully!');
        }).catch(function(err) {
          console.error('Error clearing cache:', err);
        });
      } else {
        alert('Cache API not supported in this browser.');
      }
    });
  }
});
