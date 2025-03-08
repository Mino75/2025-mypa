const DB_NAME = "MyAppDB";
const DB_VERSION = 1;
const STORE_NAME = "authorized-sites";

// Ouvre (ou crée) la base IndexedDB et l'object store
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => {
      console.error("Erreur lors de l'ouverture d'IndexedDB");
      reject(request.error);
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

// Enregistre la liste des sites autorisés dans l'object store
function setAuthorizedSites(sites) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.put({ id: 1, sites: sites });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  });
}

// Récupère la liste des sites autorisés depuis l'object store
function getAuthorizedSites() {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(1);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.sites);
        } else {
          resolve([]);
        }
      };
      request.onerror = () => reject(request.error);
    });
  });
}

// Exposer les fonctions pour qu'elles soient accessibles globalement
window.db = {
  openDB,
  setAuthorizedSites,
  getAuthorizedSites
};
