/**
 * @file IndexedDB wrapper for managing pins.
 * Provides functions to add, update, delete, and fetch pins.
 * This is the model layer of the application.
 */

/* IndexedDB configuration */
const DB_NAME = 'pinboard_db';
const DB_VERSION = 1;
const DB_STORE_NAME = 'pins';

// IndexedDB database instance
let db;

/** 
 * Open the IndexedDB database and initialize object stores if needed.
 * @returns {Promise<IDBDatabase>}
 */
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Handle the case where the database is blocked (e.g., by another open connection)
    request.onblocked = () => {
      console.warn('Database open request is blocked. Please close other tabs with this site open.');
    };

    // Handle successful database open
    request.onsuccess = (event) => {
      db = event.target.result;
      // Generic error handler for all errors targeted at this database's requests!
      // (Error events bubble up to the database level from requests made against the database's object stores.)
      db.onerror = (event) => {
        console.error('Database error:', event.target.error?.message);
      }
      // Handle database version change (e.g., when a new version is available)
      db.onversionchange = () => {
        db.close();
        alert('A new version of the database is available. Please reload the page to update.');
      };
      resolve(db);
    };

    // Handle database open errors
    request.onerror = (event) => {
      console.error('Error opening database:', event.target.error?.message);
      reject(event);
    };

    // Handle database upgrades (e.g., creating object stores and indexes)
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
        const store = db.createObjectStore(DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        createPinIndexs(store);
      }
    };
  });
}

/**
 * Get the object store in the specified mode.
 * mode can be 'readonly', 'readwrite' or 'versionchange'.
 * @param {*} storeName 
 * @param {*} mode 
 * @returns 
 */
function getObjectStore(storeName, mode) {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

/**
 * Create indexes for the pin object store.
 * Indexes permit to use property-based searches like in SQL databases.
 * Created on title, description, color, createdAt, and updatedAt properties.
 * @param {*} store 
 */
function createPinIndexs(store) {
  // Create an index on the 'title' property
  if (!store.indexNames.contains('title')) {
    store.createIndex('title', 'title', { unique: false });
  }
  // Create an index on the 'description' property
  if (!store.indexNames.contains('description')) {
    store.createIndex('description', 'description', { unique: false });
  }
  if (!store.indexNames.contains('color')) {
    store.createIndex('color', 'color', { unique: false });
  }
  // Create an index on the 'createdAt' property
  if (!store.indexNames.contains('createdAt')) {
    store.createIndex('createdAt', 'createdAt', { unique: false });
  }
  // Create an index on the 'updatedAt' property
  if (!store.indexNames.contains('updatedAt')) {
    store.createIndex('updatedAt', 'updatedAt', { unique: false });
  }
}

/**
 * Validate the pin object.
 * @param {*} pin 
 * @returns {boolean}
 */
function validatePin(pin) {
  if (!pin.title || !pin.color) {
    console.error('Missing mandatory pin fields:', pin);
    return false;
  }
  return true;
}

/**
 * Update the createdAt and updatedAt timestamps of a pin.
 * @param {*} pin 
 * @param {*} isNew 
 */
function updateTimestamps(pin, isNew = false) {
  const now = new Date().toISOString();
    if (isNew) {
    pin.createdAt = now;
  }
  pin.updatedAt = now;
}

/**
 * Add a new pin to the database.
 * A validation is performed before adding the pin.
 * @param {*} pin 
 * @returns 
 */
export async function addPin(pin) {
  await CheckDbInitialization();
  const store = getObjectStore(DB_STORE_NAME, 'readwrite');
  if (!validatePin(pin)) {
    throw new Error('Invalid pin data. Title and color are required.');
  }
  updateTimestamps(pin, true);
  // Store the pin in the database
  const request = store.add(pin);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error('Error adding pin:', event);
      reject(event);
    };
  });
}

/**
 * Update an existing pin in the database.
 * A validation is performed before updating the pin.
 * @param {*} pin 
 * @returns 
 */
export async function updatePin(pin) {
  await CheckDbInitialization();
  const store = getObjectStore(DB_STORE_NAME, 'readwrite');
  if (!validatePin(pin)) {
    throw new Error('Invalid pin data. Title and color are required.');
  }
  updateTimestamps(pin);
  const request = store.put(pin);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error('Error updating pin:', event);
      reject(event);
    };
  });
}

/**
 * Get a pin by its ID.
 * @param {*} id 
 * @returns 
 */
export async function getPin(id) {
    await CheckDbInitialization();
    const store = getObjectStore(DB_STORE_NAME, 'readonly');
    const request = store.get(id);
    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = (event) => {
            console.error('Error getting pin:', event);
            reject(event);
        };
    });
}

/**
 * Get all pins from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of pins.
 */
export async function getAllPins() {
  await CheckDbInitialization();
  const store = getObjectStore(DB_STORE_NAME, 'readonly');
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error('Error getting all pins:', event);
      reject(event);
    };
  });
}

/**
 * Search pins by text by using the title and description indexes.
 * @param {*} query 
 * @returns 
 */
export async function textSearchPins(query) {
  await CheckDbInitialization();
  const store = getObjectStore(DB_STORE_NAME, 'readonly');
  const pins = [];
  const request = store.openCursor();
  return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
          const pin = cursor.value;
          if (pin.title.toLowerCase().includes(query.toLowerCase()) || pin.description.toLowerCase().includes(query.toLowerCase())) {
            pins.push(pin);
          }
          cursor.continue();
      } else {
          resolve(pins);
      }
      };
      request.onerror = (event) => {
      console.error('Error searching pins:', event);
      reject(event);
      };
  });
}

/**
 * Delete a pin by its ID.
 * @param {*} id 
 * @returns 
 */
export async function deletePin(id) {
  await CheckDbInitialization();
  const store = getObjectStore(DB_STORE_NAME, 'readwrite');
  const request = store.delete(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error('Error deleting pin:', event);
      reject(event);
    };
  });
}

/**
 * Clear all pins from the database.
 * @returns 
 */
export async function clearPins() {
  await CheckDbInitialization();
  const store = getObjectStore(DB_STORE_NAME, 'readwrite');
  const request = store.clear();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error('Error clearing pins:', event);
      reject(event);
    };
  });
}

/**
 * Check if the database is initialized, and open it if not.
 * @returns {Promise<void>}
 */
export async function CheckDbInitialization() {
  if (!db) {
    await openDb();
  }
}

// Initialize the database connection on module load
CheckDbInitialization();

export default {
  addPin,
  getAllPins,
  deletePin,
  clearPins,
  CheckDbInitialization,
};