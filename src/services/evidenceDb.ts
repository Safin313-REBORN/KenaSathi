// IndexedDB Storage Layer for Binary Evidence Blobs (Images & PDFs)
// Keeps large Base64 / ArrayBuffer data OUT of localStorage to prevent QuotaExceededError.

const DB_NAME = 'kenasathi_evidence_db_v1';
const STORE_NAME = 'evidence_blobs';
const DB_VERSION = 1;

// In-memory fallback cache for Node test environments or unsupported browsers
const memoryCache = new Map<string, { dataUrl: string; mimeType: string }>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const EvidenceBlobStorage = {
  async saveBlob(id: string, name: string, mimeType: string, dataUrl: string): Promise<string> {
    try {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const record = {
          id,
          name,
          mimeType,
          dataUrl,
          sizeBytes: dataUrl.length,
          savedAt: new Date().toISOString(),
        };
        const req = store.put(record);
        req.onsuccess = () => resolve(id);
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Graceful fallback to in-memory store
      memoryCache.set(id, { dataUrl, mimeType });
      return id;
    }
  },

  async getBlob(id: string): Promise<{ dataUrl: string; mimeType: string } | null> {
    try {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result) {
            resolve({ dataUrl: req.result.dataUrl, mimeType: req.result.mimeType });
          } else {
            resolve(memoryCache.get(id) || null);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return memoryCache.get(id) || null;
    }
  },

  async deleteBlob(id: string): Promise<void> {
    try {
      memoryCache.delete(id);
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      memoryCache.delete(id);
    }
  },

  async clearAllBlobs(): Promise<void> {
    try {
      memoryCache.clear();
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      memoryCache.clear();
    }
  },
};
