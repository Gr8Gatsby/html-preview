import { loadSavedFiles, loadFileById, deleteFile } from './storage.js';

let sortOrderDescending = true;
let searchQuery = '';

// Function to load and display HTML files with sorting and filtering functionalities
export async function loadHTMLFiles(viewHTML, openModal, showMetadata, deleteHTML) {
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

    // If the list is empty or needs rebuilding, clear and re-render the list
    htmlListElement.innerHTML = '';
    sortedFiles.forEach((file) => {
        const listItem = document.createElement('li');
        listItem.dataset.fileId = file.id; // Attach file ID to the element
        listItem.classList.add('file-item'); // Add a class for styling
        listItem.innerHTML = `
            <div class="file-info">
                <span class="file-name">${file.name} (ID: ${file.id})</span>
                <span class="timestamp">${formatTimeDifference(file.createdAt)}</span>
            </div>
            <div class="button-group">
                <button class="icon-button viewButton" title="View"><i class="material-icons">visibility</i></button>
                <button class="icon-button editButton" title="Edit"><i class="material-icons">edit</i></button>
                <button class="icon-button infoButton" title="Info"><i class="material-icons">info</i></button>
                <button class="icon-button deleteButton" title="Delete"><i class="material-icons">delete</i></button>
            </div>
        `;

        // Attach event listeners to buttons
        listItem.querySelector('.viewButton').onclick = () => viewHTML(file.id);
        listItem.querySelector('.editButton').onclick = () => openModal(file.id);
        listItem.querySelector('.infoButton').onclick = () => showMetadata(file.id);
        listItem.querySelector('.deleteButton').onclick = () => deleteHTML(file.id);

        htmlListElement.appendChild(listItem);
    });

    // Update the sort icon based on the current sort order
    updateSortIcon();
}

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
    loadHTMLFiles(viewHTML, openModal, showMetadata, deleteHTML); // Re-call with updated order
}

// Function to update the sort icon based on the order
function updateSortIcon() {
    const sortButton = document.getElementById('sortButton');
    const iconElement = sortButton.querySelector('.material-icons');

    // Update the icon based on the sort order
    if (sortOrderDescending) {
        iconElement.textContent = 'south'; // Represents descending order
    } else {
        iconElement.textContent = 'north'; // Represents ascending order
    }
}

// Function to handle search input
export function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    searchQuery = searchInput.value.trim();
    loadHTMLFiles(viewHTML, openModal, showMetadata, deleteHTML);
}

// Modify functions to work with `id`
export async function viewHTML(fileId) {
    const file = await loadFileById(fileId);
    if (file) {
        console.log(`Viewing content of file: ${file.name}`, file.content);
    } else {
        console.error(`File not found: ${fileId}`);
    }
}

export async function openModal(fileId) {
    const file = await loadFileById(fileId);
    if (file) {
        console.log(`Editing file: ${file.name}`, file);
    } else {
        console.error(`File not found: ${fileId}`);
    }
}

export async function showMetadata(fileId) {
    try {
        const file = await loadFileById(fileId);
        if (file) {
            console.log(`Showing metadata for file: ${file.name}`, file.metadata);
        } else {
            console.error(`File not found with ID: ${fileId}`);
        }
    } catch (error) {
        console.error(`Error loading metadata for file with ID: ${fileId}`, error);
    }
}

export async function deleteHTML(fileId) {
    await deleteFile(fileId);
    await loadHTMLFiles(viewHTML, openModal, showMetadata, deleteHTML); // Reload the list after deletion
    console.log(`Deleted file with ID: ${fileId}`);
}