
let savedFiles = JSON.parse(localStorage.getItem('htmlFiles') || '[]');
let documentCounter = savedFiles.length + 1; // Initialize counter based on existing documents
let currentEditIndex = null; // Track the index of the currently edited item

document.addEventListener('DOMContentLoaded', () => {
    loadHTMLFiles();
});


// Other existing functions like openModal, closeModal, saveHTML, etc.

function openModal(index = null) {
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('nameInputContainer').style.display = 'none';
    document.getElementById('htmlContent').value = '';
    document.getElementById('htmlNameInput').value = '';

    // If an index is provided, it means we are editing
    if (index !== null) {
        currentEditIndex = index;
        const file = savedFiles[index];
        document.getElementById('htmlContent').value = file.content;
        document.getElementById('htmlNameInput').value = file.name;
        document.getElementById('nameInputContainer').style.display = 'block';
    } else {
        currentEditIndex = null; // Reset if adding new HTML
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('htmlContent').value = '';
    document.getElementById('htmlNameInput').value = '';
    currentEditIndex = null;
}

function saveHTML() {
    let contentInput = document.getElementById('htmlContent').value.trim();
    const nameInput = document.getElementById('htmlNameInput').value.trim();

    if (!contentInput) {
        alert('Please enter HTML content.');
        return;
    }

    // Format the HTML using js-beautify
    contentInput = html_beautify(contentInput, {
        indent_size: 2,  // Set the indentation size for formatting
        wrap_line_length: 80,
        end_with_newline: true
    });

    const extractedTitle = extractTitle(contentInput);
    const name = nameInput || extractedTitle || `HTML Document #${documentCounter++}`;
    const timestamp = Date.now();

    // Calculate metadata
    const sizeInKB = (new Blob([contentInput]).size / 1024).toFixed(2);
    const scriptTagsCount = (contentInput.match(/<script[\s\S]*?>/gi) || []).length;
    const externalUrls = (contentInput.match(/https?:\/\/[^\s"'>]+/gi) || []).map(url => {
        const baseUrl = url.split('/').slice(0, 3).join('/');
        const isHttps = baseUrl.startsWith('https');
        return { url: baseUrl, isHttps };
    });

    const metadata = {
        size: `${sizeInKB} KB`,
        scripts: scriptTagsCount,
        externalReferences: externalUrls.length,
        externalUrls
    };

    const htmlFile = {
        name,
        content: contentInput,
        timestamp,
        metadata
    };

    // Update or save the new HTML file
    if (currentEditIndex !== null) {
        savedFiles[currentEditIndex] = htmlFile;
    } else {
        savedFiles.push(htmlFile);
    }

    localStorage.setItem('htmlFiles', JSON.stringify(savedFiles));
    loadHTMLFiles();
    closeModal();
}

function updateTitle() {
    const content = document.getElementById('htmlContent').value;
    const title = extractTitle(content);

    if (title) {
        document.getElementById('nameInputContainer').style.display = 'none';
    } else {
        document.getElementById('nameInputContainer').style.display = 'block';
    }
}

function extractTitle(htmlContent) {
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1] : null;
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
        viewButton.onclick = () => viewHTML(file.content);
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

function viewHTML(content) {
    const previewIframe = document.getElementById('htmlPreview');
    document.getElementById('listView').style.display = 'none';
    document.getElementById('previewView').style.display = 'block';
    previewIframe.srcdoc = content;
}

function exitPreview() {
    document.getElementById('listView').style.display = 'block';
    document.getElementById('previewView').style.display = 'none';
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

function closeMetadataModal() {
    document.getElementById('metadataModal').style.display = 'none';
}

function showPrettyPrint() {
    const iframe = document.getElementById('htmlPreview');
    const htmlContent = iframe.contentDocument.documentElement.outerHTML;

    // Use html_beautify to format the HTML
    const prettyHtml = html_beautify(htmlContent, {
        indent_size: 2,
        wrap_line_length: 80
    });

    // Set the formatted HTML in the pre element
    const preElement = document.getElementById('prettyPrintContent');
    preElement.textContent = prettyHtml;

    // Highlight the content using Prism.js
    Prism.highlightElement(preElement);

    // Show the modal
    document.getElementById('prettyPrintModal').style.display = 'flex';
}

// Function to close the Pretty Print modal
function closePrettyPrintModal() {
    document.getElementById('prettyPrintModal').style.display = 'none';
}