// Sort order: true for descending (most recent first), false for ascending (oldest first)
let sortOrderDescending = true;
let searchQuery = '';
let savedFiles = []; // Ensure this is populated with your files array elsewhere

// Function to load and display HTML files with sorting and filtering functionalities
export function loadHTMLFiles(files, viewHTML, openModal, showMetadata, deleteHTML) {
    savedFiles = files; // Assign the provided files to savedFiles
    const htmlListElement = document.getElementById('htmlList');
    htmlListElement.innerHTML = '';

    // Filter files based on the search query
    const filteredFiles = savedFiles.filter((file) => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort files based on the selected order
    const sortedFiles = filteredFiles.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return sortOrderDescending ? dateB - dateA : dateA - dateB;
    });

    sortedFiles.forEach((file) => {
        const metadata = file.metadata || { size: 'Unknown', scripts: 'Unknown', externalReferences: 'Unknown' };

        const listItem = document.createElement('li');
        listItem.dataset.savedDate = file.timestamp;

        // Create the file info section
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';

        const nameElement = document.createElement('span');
        nameElement.className = 'name';
        nameElement.textContent = file.name;
        fileInfo.appendChild(nameElement);

        const sizeLabel = document.createElement('span');
        sizeLabel.className = 'size-label';
        sizeLabel.textContent = metadata.size;
        fileInfo.appendChild(sizeLabel);

        listItem.appendChild(fileInfo);

        // Create the icon group section
        const iconGroup = document.createElement('div');
        iconGroup.className = 'icon-group';

        const viewButton = document.createElement('button');
        viewButton.className = 'icon-button';
        viewButton.innerHTML = '<span class="material-icons">visibility</span>';
        viewButton.onclick = () => viewHTML(file.content, file.name);
        iconGroup.appendChild(viewButton);

        const editButton = document.createElement('button');
        editButton.className = 'icon-button';
        editButton.innerHTML = '<span class="material-icons">edit</span>';
        editButton.onclick = () => openModal(file.name);
        iconGroup.appendChild(editButton);

        const infoButton = document.createElement('button');
        infoButton.className = 'icon-button';
        infoButton.innerHTML = '<span class="material-icons">info</span>';
        infoButton.onclick = () => showMetadata(file.name);
        iconGroup.appendChild(infoButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'icon-button';
        deleteButton.innerHTML = '<span class="material-icons">delete</span>';
        deleteButton.onclick = () => deleteHTML(file.name);
        iconGroup.appendChild(deleteButton);

        listItem.appendChild(iconGroup);

        const timeSpan = document.createElement('p');
        timeSpan.textContent = `Saved ${formatTimeDifference(file.timestamp)}`;
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
    const timeDifference = Math.floor((now - timestamp) / 1000);

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
    loadHTMLFiles(savedFiles, viewHTML, openModal, showMetadata, deleteHTML); // Re-call with updated order
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
    loadHTMLFiles(savedFiles, viewHTML, openModal, showMetadata, deleteHTML);
}

// Modify viewHTML, openModal, showMetadata, and deleteHTML functions to search by file name
export function viewHTML(fileName) {
    const file = savedFiles.find(f => f.name === fileName);
    if (file) {
        console.log(`Viewing content of file: ${fileName}`, file);
    } else {
        console.error(`File not found: ${fileName}`);
    }
}

export function openModal(fileName) {
    const file = savedFiles.find(f => f.name === fileName);
    if (file) {
        console.log(`Editing file: ${fileName}`, file);
    } else {
        console.error(`File not found: ${fileName}`);
    }
}

export function showMetadata(fileName) {
    const file = savedFiles.find(f => f.name === fileName);
    if (file) {
        console.log(`Showing metadata for file: ${fileName}`, file.metadata);
    } else {
        console.error(`File not found: ${fileName}`);
    }
}

export function deleteHTML(fileName) {
    const fileIndex = savedFiles.findIndex(f => f.name === fileName);
    if (fileIndex !== -1) {
        savedFiles.splice(fileIndex, 1);
        loadHTMLFiles(savedFiles, viewHTML, openModal, showMetadata, deleteHTML); // Reload the list after deletion
        console.log(`Deleted file: ${fileName}`);
    } else {
        console.error(`File not found for deletion: ${fileName}`);
    }
}