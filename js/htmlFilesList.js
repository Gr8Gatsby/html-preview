// Sort order: true for descending (most recent first), false for ascending (oldest first)
let sortOrderDescending = true;
let searchQuery = '';

// Function to load and display HTML files with sorting and filtering functionalities
export function loadHTMLFiles(savedFiles, viewHTML, openModal, showMetadata, deleteHTML) {
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

    sortedFiles.forEach((file, index) => {
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
        viewButton.onclick = () => viewHTML(file.content, index);
        iconGroup.appendChild(viewButton);

        const editButton = document.createElement('button');
        editButton.className = 'icon-button';
        editButton.innerHTML = '<span class="material-icons">edit</span>';
        editButton.onclick = () => openModal(index);
        iconGroup.appendChild(editButton);

        const infoButton = document.createElement('button');
        infoButton.className = 'icon-button';
        infoButton.innerHTML = '<span class="material-icons">info</span>';
        infoButton.onclick = () => showMetadata(index, savedFiles);
        iconGroup.appendChild(infoButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'icon-button';
        deleteButton.innerHTML = '<span class="material-icons">delete</span>';
        deleteButton.onclick = () => deleteHTML(index);
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

export function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    searchQuery = searchInput.value.trim();
    loadHTMLFiles(savedFiles, viewHTML, openModal, showMetadata, deleteHTML);
}