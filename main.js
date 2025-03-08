document.addEventListener('DOMContentLoaded', function() {
  let authorizedSites = [];

  // Initialization: sort sites and create default screen
  function initializeAuthorizedSites(sites) {
    authorizedSites = sites;
    authorizedSites.sort((a, b) => {
      const nameA = a.replace(/^https:\/\//, '');
      const nameB = b.replace(/^https:\/\//, '');
      return nameA.localeCompare(nameB);
    });
    createScreens(1);
  }

  // Create screens and dropdown menus with unique IDs for anchors
  function createScreens(count) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';
    mainContent.classList.remove('grid-1', 'grid-2', 'grid-3', 'grid-4');
    mainContent.classList.add('grid-' + (count === 20 ? 4 : count));

    for (let i = 0; i < count; i++) {
      const screenDiv = document.createElement('div');
      screenDiv.className = 'screen';
      screenDiv.id = 'screen-' + i; // unique anchor for scrolling

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

  // Merge authorized sites from JSON and the environment variable
  function mergeAuthorizedSites() {
    // If the environment variable is empty, set it to the default value.
    if (!window.authorizedSitesFromEnv || window.authorizedSitesFromEnv.trim() === "") {
      window.authorizedSitesFromEnv = "https://hongkoala.com/";
    }
  
    return fetch('authorized-sites.json')
      .then(response => response.json())
      .then(jsonData => {
        let jsonSites = [];
        if (jsonData && Array.isArray(jsonData.sites)) {
          jsonSites = jsonData.sites;
        } else {
          console.error("authorized-sites.json does not contain a valid 'sites' array.");
        }
  
        let envSites = window.authorizedSitesFromEnv
          .split(',')
          .map(site => site.trim())
          .filter(site => site !== '');
  
        const mergedSites = Array.from(new Set([...jsonSites, ...envSites]));
  
        // Optionally update IndexedDB with mergedSites
        db.setAuthorizedSites(mergedSites)
          .catch(err => console.error("Error saving merged sites to IndexedDB:", err));
  
        return mergedSites;
      })
      .catch(err => {
        console.error("Error fetching authorized-sites.json:", err);
        let envSites = window.authorizedSitesFromEnv
          .split(',')
          .map(site => site.trim())
          .filter(site => site !== '');
        return envSites;
      });
  }
  
  mergeAuthorizedSites().then(mergedSites => {
    initializeAuthorizedSites(mergedSites);
  });
  
  // Attach event listeners to sidebar buttons for changing screen count
  document.querySelectorAll('.sidebar button').forEach(button => {
    button.addEventListener('click', function() {
      const numScreens = parseInt(this.getAttribute('data-screens'));
      createScreens(numScreens);
    });
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
  
  // Attach navigation button event listeners for mobile scrolling.
  // Here, we scroll the main container (#main-content) instead of the window.
  const scrollUpBtn = document.getElementById('scroll-up');
  const scrollDownBtn = document.getElementById('scroll-down');
  if (scrollUpBtn && scrollDownBtn) {
    scrollUpBtn.addEventListener('click', scrollToPreviousScreen);
    scrollDownBtn.addEventListener('click', scrollToNextScreen);
  }
});

// Scrolling functions: scroll the #main-content container by finding the next or previous screen
function scrollToNextScreen() {
  const mainContent = document.getElementById('main-content');
  const screens = mainContent.querySelectorAll('.screen');
  const currentScroll = mainContent.scrollTop;
  for (let screen of screens) {
    if (screen.offsetTop > currentScroll + 10) {
      mainContent.scrollTo({ top: screen.offsetTop, behavior: 'smooth' });
      break;
    }
  }
}
  
function scrollToPreviousScreen() {
  const mainContent = document.getElementById('main-content');
  const screens = mainContent.querySelectorAll('.screen');
  const currentScroll = mainContent.scrollTop;
  let lastScreen = null;
  for (let screen of screens) {
    if (screen.offsetTop < currentScroll - 10) {
      lastScreen = screen;
    } else {
      break;
    }
  }
  if (lastScreen) {
    mainContent.scrollTo({ top: lastScreen.offsetTop, behavior: 'smooth' });
  }
}
  
// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('Service Worker registered with scope:', registration.scope))
      .catch(error => console.error('Service Worker registration failed:', error));
  });
}
