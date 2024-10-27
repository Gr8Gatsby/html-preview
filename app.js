
import { openModal, closeModal, saveHTML } from './js/modal.js';
import { viewHTML, exitPreview, showPrettyPrint, closePrettyPrintModal, currentViewIndex, refreshPreview } from './js/preview.js';

let savedFiles = JSON.parse(localStorage.getItem('htmlFiles') || '[]');
let documentCounter = savedFiles.length + 1; // Initialize counter based on existing documents
let currentEditIndex = null; // Track the index of the currently edited item

document.addEventListener('DOMContentLoaded', () => {
    loadHTMLFiles();
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

function loadHTMLFiles() {
    const htmlListElement = document.getElementById('htmlList');
    htmlListElement.innerHTML = '';

    savedFiles.forEach((file, index) => {
        const metadata = file.metadata || { size: 'Unknown', scripts: 'Unknown', externalReferences: 'Unknown' };

        const listItem = document.createElement('li');
        
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
        infoButton.onclick = () => showMetadata(index);
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
}

function saveNameChange(nameInput, index) {
    const newName = nameInput.value.trim();
    if (newName) {
        savedFiles[index].name = newName;
        localStorage.setItem('htmlFiles', JSON.stringify(savedFiles));
    }
    nameInput.readOnly = true;
}

function deleteHTML(index) {
    savedFiles.splice(index, 1);
    localStorage.setItem('htmlFiles', JSON.stringify(savedFiles));
    loadHTMLFiles();
}

function formatTimeDifference(timestamp) {
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

function showMetadata(index) {
    if (index === undefined || index === null) {
        console.warn('Metadata index is undefined or null.');
        return;
    }

    const file = savedFiles[index];
    if (!file) {
        console.warn('No file found at the provided index:', index);
        return;
    }

    // Ensure metadata has default values if missing
    const metadata = file.metadata || {
        size: 'Unknown',
        scripts: 'Unknown',
        externalReferences: 'Unknown',
        externalUrls: []
    };

    // Create an ordered list of external URLs if available, with icons based on http/https
    const externalUrlsList = metadata.externalUrls.length > 0
        ? `<ol>${metadata.externalUrls.map(({ url, isHttps }) => {
            const icon = isHttps ? 'lock' : 'warning';
            const iconColor = isHttps ? '#4caf50' : '#f44336'; // Green for HTTPS, red for HTTP
            return `<li>
                        <span class="material-icons" style="color: ${iconColor}; vertical-align: middle;">${icon}</span>
                        ${url}
                    </li>`;
        }).join('')}</ol>`
        : '<p>No external URLs found.</p>';

    const metadataContent = `
        <div class="info-section">
            <p><span class="info-label">Name:</span> <span class="info-value">${file.name}</span></p>
            <p><span class="info-label">Size:</span> <span class="info-value">${metadata.size}</span></p>
            <p><span class="info-label">Number of Scripts:</span> <span class="info-value">${metadata.scripts}</span></p>
            <p><span class="info-label">External References:</span> <span class="info-value">${metadata.externalReferences}</span></p>
        </div>
        <div class="info-section">
            <h3>External URLs</h3>
            ${externalUrlsList}
        </div>
    `;

    document.getElementById('metadataContent').innerHTML = metadataContent;
    document.getElementById('metadataModal').style.display = 'flex';
}

function closeMetadataModal() {
    document.getElementById('metadataModal').style.display = 'none';
}

// At the end of app.js or after defining each function
window.openModal = openModal;
window.closeModal = closeModal;
window.saveHTML = saveHTML;
window.closePrettyPrintModal = closePrettyPrintModal;
window.exitPreview = exitPreview;
window.showMetadata = showMetadata;
window.closeMetadataModal = closeMetadataModal;
window.documentCounter = documentCounter;
window.currentEditIndex = currentEditIndex;
window.savedFiles = savedFiles;
window.loadHTMLFiles = loadHTMLFiles;
window.updateTitle = updateTitle;
window.saveNameChange = saveNameChange;
window.deleteHTML = deleteHTML;
window.viewHTML = viewHTML;
window.currentViewIndex = currentViewIndex;
window.showPrettyPrint = () => showPrettyPrint(savedFiles);
window.refreshPreview = () => refreshPreview(savedFiles);