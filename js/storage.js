// Utility function to generate a GUID
function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Dictionary for basic HTML compression
const dictionary = {
    "<div>": "~D",
    "</div>": "~d",
    "<span>": "~S",
    "</span>": "~s",
    "<p>": "~P",
    "</p>": "~p",
    "<br>": "~B",
    "<strong>": "~T",
    "</strong>": "~t",
    "class=\"": "~C",
    "id=\"": "~I",
    // Add more patterns as needed
};

// Compression function using dictionary
function dictionaryCompress(input) {
    let compressed = input;
    for (const [key, value] of Object.entries(dictionary)) {
        compressed = compressed.split(key).join(value);
    }
    return compressed;
}

// Decompression function using dictionary
function dictionaryDecompress(input) {
    let decompressed = input;
    for (const [key, value] of Object.entries(dictionary)) {
        decompressed = decompressed.split(value).join(key);
    }
    return decompressed;
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

// Save a single file to IndexedDB with dictionary compression
export async function saveFile(fileName, htmlContent) {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    // Calculate uncompressed size in bytes
    const uncompressedSizeBytes = htmlContent.length;
    const uncompressedSize = formatSize(uncompressedSizeBytes);

    // Apply dictionary compression
    const compressedContent = dictionaryCompress(htmlContent);
    const compressedSizeBytes = compressedContent.length;
    const compressedSize = formatSize(compressedSizeBytes);

    // Log sizes for debugging
    console.log("Saving file with sizes:");
    console.log("Compressed Size:", compressedSize);
    console.log("Uncompressed Size:", uncompressedSize);

    const file = {
        id: generateGUID(),
        name: fileName,
        content: compressedContent,
        createdAt: new Date().toISOString(),
        metadata: {
            compressedSize: compressedSize,
            uncompressedSize: uncompressedSize,
            compressedSizeBytes: compressedSizeBytes,
            uncompressedSizeBytes: uncompressedSizeBytes
        }
    };

    return new Promise((resolve, reject) => {
        const request = store.add(file);
        request.onsuccess = () => resolve(file.id);
        request.onerror = () => reject(`Failed to save file: ${request.error}`);
    });
}

// Load all saved files from IndexedDB (no decompression here)
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

            const mappedFiles = files.map(file => {
                const uncompressedSizeBytes = file.metadata?.uncompressedSizeBytes || 0;
                const compressedSizeBytes = file.metadata?.compressedSizeBytes || 0;

                return {
                    id: file.id,
                    name: file.name,
                    content: file.content, // Still compressed
                    createdAt: file.createdAt,
                    metadata: {
                        compressedSize: formatSize(compressedSizeBytes),
                        uncompressedSize: formatSize(uncompressedSizeBytes),
                    }
                };
            });

            resolve(mappedFiles);
        };

        request.onerror = () => {
            console.error("Failed to retrieve files from IndexedDB:", request.error);
            reject(request.error);
        };
    });
}

// Update an existing file in IndexedDB with dictionary compression
export async function updateFile(fileId, fileName, htmlContent) {
    console.log(`updateFile called with fileId: ${fileId}, fileName: ${fileName}`);

    const db = await openDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    // Calculate uncompressed size in bytes
    const uncompressedSizeBytes = htmlContent.length;
    const uncompressedSize = formatSize(uncompressedSizeBytes);

    // Apply dictionary compression
    const compressedContent = dictionaryCompress(htmlContent);
    const compressedSizeBytes = compressedContent.length;
    const compressedSize = formatSize(compressedSizeBytes);

    // Log sizes and the ID for debugging
    console.log("Attempting to update file with ID:", fileId);
    console.log("Compressed Size:", compressedSize);
    console.log("Uncompressed Size:", uncompressedSize);

    // Prepare the file object with the correct ID to update the existing entry
    const file = {
        id: fileId, // Use the provided fileId to ensure updating the correct file
        name: fileName,
        content: compressedContent,
        createdAt: new Date().toISOString(),
        metadata: {
            compressedSize: compressedSize,
            uncompressedSize: uncompressedSize,
            compressedSizeBytes: compressedSizeBytes,
            uncompressedSizeBytes: uncompressedSizeBytes
        }
    };

    return new Promise((resolve, reject) => {
        // Use put() to update or add a file with the given ID
        const request = store.put(file);  // This should update the file if ID matches
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
// Load a specific file by its ID with dictionary decompression
export async function loadFileById(fileId) {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const request = store.get(fileId);

        request.onsuccess = async () => {
            const file = request.result;

            if (file) {
                // Decompress content using dictionary
                const decodedContent = dictionaryDecompress(file.content);
                let uncompressedSize = file.metadata?.uncompressedSize;

                // Update uncompressed size if it was unknown
                if (uncompressedSize === "Unknown") {
                    uncompressedSize = decodedContent.length + " bytes";

                    // Save the updated uncompressed size back to IndexedDB
                    const updateTx = db.transaction(storeName, "readwrite");
                    const updateStore = updateTx.objectStore(storeName);
                    file.metadata.uncompressedSize = uncompressedSize;

                    await new Promise((updateResolve, updateReject) => {
                        const updateRequest = updateStore.put(file);
                        updateRequest.onsuccess = () => updateResolve();
                        updateRequest.onerror = () => updateReject(`Failed to update uncompressed size: ${updateRequest.error}`);
                    });
                }

                file.content = decodedContent; // Return the decompressed content
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
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const request = store.delete(fileId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(`Failed to delete file with ID ${fileId}: ${request.error}`);
    });
}

// Increment document counter (uses count from IndexedDB)
export async function incrementDocumentCounter() {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result + 1);
        request.onerror = () => reject(`Failed to count documents: ${request.error}`);
    });
}

// Batch delete files by their IDs
export async function deleteFiles(fileIds) {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    return Promise.all(
        fileIds.map(
            fileId =>
                new Promise((resolve, reject) => {
                    const request = store.delete(fileId);
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(`Failed to delete file with ID ${fileId}: ${request.error}`);
                })
        )
    );
}

// Fetch metadata only (no decompression)
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
                createdAt: file.createdAt,
            }));
            resolve(metadata);
        };
        request.onerror = () => reject(`Failed to fetch metadata: ${request.error}`);
    });
}

function formatSize(bytes) {
    const units = ['bytes', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}