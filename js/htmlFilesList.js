import { loadSavedFiles, loadFileById, deleteFile } from './storage.js';
import { viewHTML } from './preview.js'; // Imported from preview.js
import { openModal } from './modal.js'; // Imported from modal.js
import { showMetadata } from './metadata.js'; // Imported from metadata.js

let sortOrderDescending = true;
let searchQuery = '';

export async function loadHTMLFiles() {
    const htmlListElement = document.getElementById('htmlList');

    // Fetch files from IndexedDB
    let savedFiles = await loadSavedFiles();

    if (!savedFiles || savedFiles.length === 0) {
        htmlListElement.innerHTML = `<li>No files available.</li>`;
        return;
    }

    // Filter files based on the search query
    const filteredFiles = savedFiles.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredFiles.length === 0) {
        htmlListElement.innerHTML = `<li>No matching files found.</li>`;
        return;
    }

    // Sort files based on the selected order
    const sortedFiles = filteredFiles.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrderDescending ? dateB - dateA : dateA - dateB;
    });

    // Clear and re-render the list
    htmlListElement.innerHTML = '';
    sortedFiles.forEach((file) => {
        // Calculate the file size dynamically
        const fileSizeBytes = new Blob([file.content]).size;
        const fileSizeFormatted = formatFileSize(fileSizeBytes);

        const listItem = document.createElement('li');
        listItem.dataset.fileId = file.id;
        listItem.classList.add('file-item');
        listItem.innerHTML = `
            <div class="file-card">
                <!-- File Info Section -->
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${fileSizeFormatted}</span>
                    <span class="timestamp">${formatTimeDifference(file.createdAt)}</span>
                </div>

                <!-- Action Buttons -->
                <div class="card-actions">
                    <button class="icon-button viewButton" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-button editButton" title="Edit">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="icon-button infoButton" title="Info">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="icon-button deleteButton" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        // Attach event listeners with the correct function references
        listItem.querySelector('.viewButton').addEventListener('click', () => viewHTML(file.id));
        listItem.querySelector('.editButton').addEventListener('click', () => openModal(file.id));
        listItem.querySelector('.infoButton').addEventListener('click', () => showMetadata(file.id));
        listItem.querySelector('.deleteButton').addEventListener('click', () => {
            deleteFile(file.id).then(() => loadHTMLFiles());
        });

        htmlListElement.appendChild(listItem);
    });

    updateSortIcon();
}

// Helper function to format file size
function formatFileSize(bytes) {
    const units = ['bytes', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Event delegation setup
document.getElementById('htmlList').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const fileId = button.closest('li').dataset.fileId;
    const action = button.dataset.action;

    if (!fileId || !action) return;

    switch (action) {
        case 'view':
            viewHTML(fileId);
            break;
        case 'edit':
            openModal(fileId);
            break;
        case 'info':
            showMetadata(fileId);
            break;
        case 'delete':
            deleteFile(fileId).then(() => loadHTMLFiles());
            break;
        default:
            console.warn('Unknown action:', action);
    }
});

// Function to format time differences for display
export function formatTimeDifference(timestamp) {
    const now = Date.now();
    const savedTime = new Date(timestamp);
    const timeDifference = Math.floor((now - savedTime) / 1000);

    if (timeDifference < 60) {
        return `${timeDifference} second${timeDifference !== 1 ? 's' : ''} ago`;
    } else if (timeDifference < 3600) {
        const minutes = Math.floor(timeDifference / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (timeDifference < 86400) {
        const hours = Math.floor(timeDifference / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        return savedTime.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
    }
}

// Function to toggle sort order and reload the list
export function toggleSortOrder() {
    sortOrderDescending = !sortOrderDescending;
    loadHTMLFiles();
}

// Function to update the sort icon based on the order
function updateSortIcon() {
    const sortButton = document.getElementById('sortButton');
    if (sortButton) {
        const iconElement = sortButton.querySelector('.material-icons');
        if (iconElement) {
            iconElement.textContent = sortOrderDescending ? 'south' : 'north';
        }
    }
}

// Function to handle search input
export function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchQuery = searchInput.value.trim();
        loadHTMLFiles();
    }
}