import { saveFile, updateFile, loadFileById, loadSavedFiles } from './storage.js';
import { loadHTMLFiles } from './htmlFilesList.js';
import { showMetadata } from './metadata.js';

let currentEditFile = null; // Track the file being edited

// Open the modal for creating or editing an HTML file
export async function openModal(fileId = null) {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    document.getElementById('nameInputContainer').style.display = 'none';
    document.getElementById('htmlContent').value = '';
    document.getElementById('htmlNameInput').value = '';

    console.log(`openModal called with fileId: ${fileId}`);

    if (fileId) {
        try {
            const file = await loadFileById(fileId);

            if (!file || typeof file.content !== 'string' || file.content.trim() === '') {
                console.error(`Loaded file with ID "${fileId}" is invalid or empty.`);
                alert(`Error: File with ID "${fileId}" is invalid or empty.`);
                return;
            }

            currentEditFile = {
                id: file.id,
                name: file.name,
                content: file.content,
                createdAt: file.createdAt,
                metadata: file.metadata,
            };

            console.log("Editing existing file:", currentEditFile);

            document.getElementById('htmlContent').value = currentEditFile.content;
            document.getElementById('htmlNameInput').value = currentEditFile.name;
            document.getElementById('nameInputContainer').style.display = 'block';

            // Set up metadata button
            document.getElementById('metadataButton').onclick = () => {
                if (currentEditFile && currentEditFile.id) {
                    showMetadata(currentEditFile.id); // Show metadata for the current file
                } else {
                    alert('No file selected to view metadata.');
                }
            };
        } catch (error) {
            console.error(`Error loading file with ID "${fileId}":`, error);
            alert('An error occurred while loading the file.');
        }
    } else {
        currentEditFile = null;
        console.log("Creating a new file, currentEditFile set to null");
    }
}

// Close the modal and reset fields
export function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('htmlContent').value = '';
    document.getElementById('htmlNameInput').value = '';
    currentEditFile = null;
    console.log("Modal closed, currentEditFile reset to null");
}

// Save or update HTML content
export async function saveHTML() {
    const contentInput = document.getElementById('htmlContent').value.trim();
    const nameInput = document.getElementById('htmlNameInput').value.trim();

    if (!contentInput) {
        alert('Please enter HTML content.');
        return;
    }

    const formattedContent = html_beautify(contentInput, {
        indent_size: 2,
        wrap_line_length: 80,
        end_with_newline: true,
    });

    const extractedTitle = extractTitle(formattedContent);
    const fileName = nameInput || extractedTitle || `HTML Document #${Date.now()}`;

    try {
        if (currentEditFile && currentEditFile.id) {
            console.log(`Updating existing file with ID: ${currentEditFile.id}`);
            await updateFile(currentEditFile.id, fileName, formattedContent);
        } else {
            console.log("Creating a new file");
            await saveFile(fileName, formattedContent);
        }

        closeModal();

        // Refresh the list of files
        const updatedFiles = await loadSavedFiles();
        loadHTMLFiles(updatedFiles, openModal, showMetadata); // Adjusted for only relevant actions
    } catch (error) {
        console.error('Error saving the file:', error);
        alert('An error occurred while saving the file.');
    }
}

// Extract the <title> from the HTML content
function extractTitle(htmlContent) {
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1] : null;
}

// Bind functions to the global scope for debugging purposes
window.openModal = openModal;
window.closeModal = closeModal;
window.saveHTML = saveHTML;