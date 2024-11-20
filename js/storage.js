// Utility function to generate a GUID
function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// IndexedDB setup
const dbName = "htmlFilesDB";
const storeName = "files";

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "id" }); // "id" as primary key
            }
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(`Database error: ${event.target.error}`);
        };
    });
}

// Save a single file to IndexedDB
export async function saveFile(fileName, htmlContent) {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    const file = {
        id: generateGUID(),
        name: fileName,
        content: htmlContent,
        createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
        const request = store.add(file);
        request.onsuccess = () => resolve(file.id);
        request.onerror = () => reject(`Failed to save file: ${request.error}`);
    });
}

// Load all saved files from IndexedDB
export async function loadSavedFiles() {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
            const files = request.result;

            if (!Array.isArray(files)) {
                console.error("Unexpected result from getAll():", files);
                resolve([]);
                return;
            }

            resolve(
                files.map(file => ({
                    id: file.id,
                    name: file.name,
                    content: file.content,
                    createdAt: file.createdAt
                }))
            );
        };

        request.onerror = () => {
            console.error("Failed to retrieve files from IndexedDB:", request.error);
            reject(request.error);
        };
    });
}

// Update an existing file in IndexedDB
export async function updateFile(fileId, fileName, htmlContent) {
    console.log(`updateFile called with fileId: ${fileId}, fileName: ${fileName}`);

    const db = await openDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    const file = {
        id: fileId,
        name: fileName,
        content: htmlContent,
        createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
        const request = store.put(file);
        request.onsuccess = () => {
            console.log(`File with ID ${fileId} updated successfully.`);
            resolve(file.id);
        };
        request.onerror = (e) => {
            console.error(`Failed to update file: ${e.target.error}`);
            reject(`Failed to update file: ${request.error}`);
        };
    });
}

// Load a specific file by its ID
export async function loadFileById(fileId) {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const request = store.get(fileId);

        request.onsuccess = () => {
            const file = request.result;

            if (file) {
                resolve(file);
            } else {
                reject(`File with ID ${fileId} not found.`);
            }
        };

        request.onerror = () => reject(`Failed to load file: ${request.error}`);
    });
}

// Delete a file by ID
export async function deleteFile(fileId) {
    // Show a confirmation dialog to the user
    const userConfirmed = confirm("Are you sure you want to delete this file? This action cannot be undone.");

    if (!userConfirmed) {
        console.log(`Deletion canceled for file ID: ${fileId}`);
        return; // Exit if the user cancels
    }

    const db = await openDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const request = store.delete(fileId);
        request.onsuccess = () => {
            console.log(`File with ID ${fileId} has been deleted.`);
            resolve();
        };
        request.onerror = () => {
            console.error(`Failed to delete file with ID ${fileId}: ${request.error}`);
            reject(`Failed to delete file with ID ${fileId}: ${request.error}`);
        };
    });
}

// Fetch metadata only
export async function fetchMetadata() {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
            const metadata = request.result.map(file => ({
                id: file.id,
                name: file.name,
                createdAt: file.createdAt
            }));
            resolve(metadata);
        };
        request.onerror = () => reject(`Failed to fetch metadata: ${request.error}`);
    });
}