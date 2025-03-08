document.addEventListener('DOMContentLoaded', function() {
  let authorizedSites = [];

  // Initialize authorized sites, sort them, then create default screen.
  function initializeAuthorizedSites(sites) {
    authorizedSites = sites;
    authorizedSites.sort((a, b) => {
      const nameA = a.replace(/^https:\/\//, '');
      const nameB = b.replace(/^https:\/\//, '');
      return nameA.localeCompare(nameB);
    });
    createScreens(1);
  }

  // Create the screens in the main container.
  function createScreens(count) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';
    mainContent.classList.remove('grid-1', 'grid-2', 'grid-3', 'grid-4');
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
        option.text = url.replace(/^https:\/\//, '').split('.')[0];
        select.appendChild(option);
      });

      // Create the iframe that will load the selected site.
      const iframe = document.createElement('iframe');
      select.addEventListener('change', function() {
        iframe.src = this.value;
      });

      screenDiv.appendChild(select);
      screenDiv.appendChild(iframe);
      mainContent.appendChild(screenDiv);
    }
  }

  // Fetch the authorized sites from the static JSON file.
  fetch('authorized-sites.json')
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data.sites)) {
        initializeAuthorizedSites(data.sites);
      } else {
        console.error('authorized-sites.json does not contain a valid "sites" array.');
      }
    })
    .catch(err => console.error('Error loading authorized sites:', err));

  // Listen for clicks on the sidebar buttons to change the layout.
  document.querySelectorAll('.sidebar button').forEach(button => {
    button.addEventListener('click', function() {
      const numScreens = parseInt(this.getAttribute('data-screens'));
      createScreens(numScreens);
    });
  });
});

// Service Worker registration.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('Service Worker registered with scope:', registration.scope))
      .catch(error => console.error('Service Worker registration failed:', error));
  });
}

// Clear cache functionality.
document.addEventListener('DOMContentLoaded', function() {
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
});
