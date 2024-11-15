import { loadSavedFiles, loadFileById, deleteFile } from './storage.js';

let sortOrderDescending = true;
let searchQuery = '';

// Function to load and display HTML files with sorting and filtering functionalities
export async function loadHTMLFiles(viewHTML, openModal, showMetadata, deleteHTML) {
    const htmlListElement = document.getElementById('htmlList');
    htmlListElement.innerHTML = '';

    // Fetch files from IndexedDB
    let savedFiles = await loadSavedFiles();

    // Filter files based on the search query
    const filteredFiles = savedFiles.filter((file) => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort files based on the selected order
    const sortedFiles = filteredFiles.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrderDescending ? dateB - dateA : dateA - dateB;
    });

    sortedFiles.forEach((file) => {
        const metadata = file.metadata || {
            compressedSize: 'Unknown',
            uncompressedSize: 'Unknown',
            scripts: 'Unknown',
            externalReferences: 'Unknown'
        };
    
        const listItem = document.createElement('li');
        listItem.dataset.savedDate = file.createdAt;
    
        // Create the file info section
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
    
        const nameElement = document.createElement('span');
        nameElement.className = 'name';
        nameElement.textContent = `${file.name} (ID: ${file.id})`; // Display file name and ID for debugging
        fileInfo.appendChild(nameElement);
    
        const sizeLabel = document.createElement('span');
        sizeLabel.className = 'size-label';
        sizeLabel.textContent = `Compressed: ${metadata.compressedSize}, Uncompressed: ${metadata.uncompressedSize}`;
        fileInfo.appendChild(sizeLabel);
    
        listItem.appendChild(fileInfo);
    
        // Create the icon group section
        const iconGroup = document.createElement('div');
        iconGroup.className = 'icon-group';
    
        const viewButton = document.createElement('button');
        viewButton.className = 'icon-button';
        viewButton.innerHTML = '<span class="material-icons">visibility</span>';
        viewButton.onclick = () => viewHTML(file.id);
        iconGroup.appendChild(viewButton);
    
        const editButton = document.createElement('button');
        editButton.className = 'icon-button';
        editButton.innerHTML = '<span class="material-icons">edit</span>';
        editButton.onclick = () => openModal(file.id);
        iconGroup.appendChild(editButton);
    
        const infoButton = document.createElement('button');
        infoButton.className = 'icon-button';
        infoButton.innerHTML = '<span class="material-icons">info</span>';
        infoButton.onclick = () => showMetadata(file.id);
        iconGroup.appendChild(infoButton);
    
        const deleteButton = document.createElement('button');
        deleteButton.className = 'icon-button';
        deleteButton.innerHTML = '<span class="material-icons">delete</span>';
        deleteButton.onclick = () => deleteHTML(file.id);
        iconGroup.appendChild(deleteButton);
    
        listItem.appendChild(iconGroup);
    
        const timeSpan = document.createElement('p');
        timeSpan.textContent = `Saved ${formatTimeDifference(file.createdAt)}`;
        timeSpan.className = 'time-span';
        listItem.appendChild(timeSpan);
    
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
            year: 'numeric'
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
    console.log(`showMetadata called with fileId: ${fileId}`);

    try {
        const file = await loadFileById(fileId);
        if (file) {
            console.log(`Showing metadata for file: ${file.name}`, file.metadata);
            // Display metadata in the modal or wherever required
        } else {
            console.error(`File not found with ID: ${fileId}`);
            alert(`File with ID ${fileId} not found.`);
        }
    } catch (error) {
        console.error(`Error loading metadata for file with ID: ${fileId}`, error);
        alert(`An error occurred while trying to load metadata for file ID ${fileId}.`);
    }
}

export async function deleteHTML(fileId) {
    await deleteFile(fileId);
    await loadHTMLFiles(viewHTML, openModal, showMetadata, deleteHTML); // Reload the list after deletion
    console.log(`Deleted file with ID: ${fileId}`);
}