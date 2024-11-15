import { loadFileById } from './storage.js';

let currentFile = null; // Holds the currently loaded file object

export async function viewHTML(fileId) {
    const previewIframe = document.getElementById('htmlPreview');
    const listView = document.getElementById('listView');
    const previewView = document.getElementById('previewView');

    // Ensure required elements exist
    if (!previewIframe || !listView || !previewView) {
        console.error("Required elements for preview not found. Check element IDs.");
        return;
    }

    // Switch views
    listView.style.display = 'none';
    previewView.style.display = 'block';

    // Validate file ID
    if (!fileId) {
        console.error("Invalid file ID passed to viewHTML.");
        previewIframe.srcdoc = "<h1>Error: Invalid file ID</h1>";
        return;
    }

    try {
        // Load and decompress the file only once
        const file = await loadFileById(fileId);

        if (!file || typeof file.content !== 'string' || file.content.trim() === '') {
            console.error("Loaded file content is invalid or empty.");
            previewIframe.srcdoc = "<h1>Error: File content is empty or invalid</h1>";
            return;
        }

        currentFile = {
            id: file.id,
            name: file.name,
            content: file.content, // Already decompressed in loadFileById
            createdAt: file.createdAt,
            metadata: file.metadata,
        };

        // Display content in iframe
        previewIframe.srcdoc = currentFile.content;
        document.getElementById('documentName').textContent = currentFile.name;

    } catch (error) {
        console.error("Error loading and displaying file content:", error);
        previewIframe.srcdoc = "<h1>Error: Unable to load file content</h1>";
    }
}

export function exitPreview() {
    const listView = document.getElementById('listView');
    const previewView = document.getElementById('previewView');

    if (listView && previewView) {
        listView.style.display = 'block';
        previewView.style.display = 'none';
        currentFile = null; // Clear current file when exiting preview
    } else {
        console.error("Failed to switch views. Check element IDs.");
    }
}

export function showPrettyPrint() {
    if (!currentFile) {
        console.error("No file loaded for Pretty Print.");
        alert("No file loaded. Please open a file for preview first.");
        return;
    }

    try {
        // Use html_beautify to format the current file content
        const prettyHtml = html_beautify(currentFile.content, {
            indent_size: 2,
            wrap_line_length: 80,
        });

        // Set formatted HTML in the pre element
        const preElement = document.getElementById('prettyPrintContent');
        preElement.textContent = prettyHtml;

        // Highlight the content using Prism.js
        Prism.highlightElement(preElement);

        // Show the modal
        document.getElementById('prettyPrintModal').style.display = 'flex';
    } catch (error) {
        console.error("Error formatting and displaying pretty HTML:", error);
        alert("An error occurred while formatting the HTML.");
    }
}

export function closePrettyPrintModal() {
    const prettyPrintModal = document.getElementById('prettyPrintModal');
    if (prettyPrintModal) {
        prettyPrintModal.style.display = 'none';
    } else {
        console.error("Pretty print modal element not found.");
    }
}

export function refreshPreview() {
    const previewIframe = document.getElementById('htmlPreview');

    if (!previewIframe || !currentFile) {
        console.error("No file loaded for refresh.");
        alert("No file loaded. Please open a file for preview first.");
        return;
    }

    try {
        // Reload the iframe using the currently loaded file content
        previewIframe.srcdoc = ""; // Clear and reset the content
        previewIframe.srcdoc = currentFile.content;
    } catch (error) {
        console.error("Error refreshing iframe content:", error);
        alert("An error occurred while refreshing the preview.");
    }
}