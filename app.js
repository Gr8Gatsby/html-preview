import { openModal, closeModal, saveHTML } from './js/modal.js';
import { viewHTML, exitPreview, showPrettyPrint, closePrettyPrintModal, refreshPreview } from './js/preview.js';
import { showMetadata, closeMetadataModal } from './js/metadata.js';
import { loadHTMLFiles, toggleSortOrder, handleSearch } from './js/htmlFilesList.js';
import { saveFile, loadSavedFiles, deleteFile } from './js/storage.js';

let documentCounter = 0; // Initialize counter for new documents

// Initialize the app on DOM content load
document.addEventListener('DOMContentLoaded', async () => {
    const savedFiles = await loadSavedFiles(); // Fetch files from IndexedDB
    documentCounter = savedFiles.length + 1; // Initialize counter based on existing files
    loadHTMLFiles(viewHTML, openModal, showMetadata, deleteHTML);
});

// Update title display logic
function updateTitle() {
    const content = document.getElementById('htmlContent').value;
    const title = extractTitle(content);

    if (title) {
        document.getElementById('nameInputContainer').style.display = 'none';
    } else {
        document.getElementById('nameInputContainer').style.display = 'block';
    }
}

// Save HTML file
window.saveHTML = saveHTML;
window.saveFile = saveFile;

// Delete HTML file by ID
window.deleteHTML = async (fileId) => {
    await deleteFile(fileId); // Delete from IndexedDB
    loadHTMLFiles(viewHTML, openModal, showMetadata, deleteHTML); // Reload file list
};

// Extract title from HTML content
function extractTitle(htmlContent) {
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1] : null;
}

// Attach other event handlers and functions to the global scope
window.openModal = openModal;
window.closeModal = closeModal;
window.closePrettyPrintModal = closePrettyPrintModal;
window.exitPreview = exitPreview;
window.showMetadata = showMetadata;
window.closeMetadataModal = closeMetadataModal;
window.updateTitle = updateTitle;
window.toggleSortOrder = toggleSortOrder;
window.handleSearch = handleSearch;
window.viewHTML = viewHTML;
window.showPrettyPrint = showPrettyPrint;
window.refreshPreview = refreshPreview;