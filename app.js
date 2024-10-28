
import { openModal, closeModal, saveHTML } from './js/modal.js';
import { viewHTML, exitPreview, showPrettyPrint, closePrettyPrintModal, currentViewIndex, refreshPreview } from './js/preview.js';
import { showMetadata, closeMetadataModal } from './js/metadata.js';
import { loadHTMLFiles, toggleSortOrder } from './js/htmlFilesList.js';
import { saveFiles, deleteHTML as deleteFile } from './js/storage.js';

let savedFiles = JSON.parse(localStorage.getItem('htmlFiles') || '[]');
if (!Array.isArray(savedFiles)) {
    savedFiles = [];
}
let documentCounter = savedFiles.length + 1; // Initialize counter based on existing documents
let currentEditIndex = null; // Track the index of the currently edited item

document.addEventListener('DOMContentLoaded', () => {
    loadHTMLFiles(savedFiles, viewHTML, openModal, showMetadata, deleteHTML);
});

function updateTitle() {
    const content = document.getElementById('htmlContent').value;
    const title = extractTitle(content);

    if (title) {
        document.getElementById('nameInputContainer').style.display = 'none';
    } else {
        document.getElementById('nameInputContainer').style.display = 'block';
    }
}

// At the end of app.js or after defining each function
window.openModal = openModal;
window.closeModal = closeModal;
window.saveHTML = () => {
    saveHTML(savedFiles, () => {
        saveFiles(savedFiles);
        loadHTMLFiles(savedFiles, viewHTML, openModal, showMetadata, deleteHTML);
    });
};
window.closePrettyPrintModal = closePrettyPrintModal;
window.exitPreview = exitPreview;
window.showMetadata = (index) => showMetadata(index, savedFiles);
window.closeMetadataModal = closeMetadataModal;
window.documentCounter = documentCounter;
window.currentEditIndex = currentEditIndex;
window.savedFiles = savedFiles;
window.loadHTMLFiles = () => loadHTMLFiles(savedFiles, viewHTML, openModal, showMetadata, deleteHTML);
window.updateTitle = updateTitle;
window.saveNameChange = (nameInput, index) => {
    saveNameChange(nameInput, index);
    saveFiles(savedFiles);
};
window.deleteHTML = (index) => {
    savedFiles = deleteFile(savedFiles, index);
    loadHTMLFiles(savedFiles, viewHTML, openModal, showMetadata, deleteHTML);
};
window.viewHTML = viewHTML;
window.currentViewIndex = currentViewIndex;
window.showPrettyPrint = () => showPrettyPrint(savedFiles);
window.refreshPreview = () => refreshPreview(savedFiles);
window.toggleSortOrder = () => {
    toggleSortOrder();
    saveFiles(savedFiles);
    loadHTMLFiles(savedFiles, viewHTML, openModal, showMetadata, deleteHTML);
};