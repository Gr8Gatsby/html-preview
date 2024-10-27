
let savedFiles = JSON.parse(localStorage.getItem('htmlFiles') || '[]');
let documentCounter = savedFiles.length + 1; // Initialize counter based on existing documents
let currentEditIndex = null; // Track the index of the currently edited item

document.addEventListener('DOMContentLoaded', () => {
    loadHTMLFiles();
    const htmlContentInput = document.getElementById('htmlContent');

    // Automatically paste HTML content if valid HTML is found in the clipboard
    htmlContentInput.addEventListener('focus', async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            const isHtmlDocument = checkIfHtmlDocument(clipboardText);

            if (isHtmlDocument) {
                htmlContentInput.value = clipboardText;
                updateTitle(); // Update the title based on the new content
            }
        } catch (error) {
            console.error('Failed to read from clipboard:', error);
        }
    });

    htmlContentInput.addEventListener('input', updateTitle);
});

// Function to check if the clipboard content is a full HTML document
function checkIfHtmlDocument(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Check if the parsed document contains an <html> element
    return doc.documentElement.tagName.toLowerCase() === 'html';
}

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
    const contentInput = document.getElementById('htmlContent').value.trim();
    const nameInput = document.getElementById('htmlNameInput').value.trim();

    if (!contentInput) {
        alert('Please enter HTML content.');
        return;
    }

    const extractedTitle = extractTitle(contentInput);
    const name = nameInput || extractedTitle || `HTML Document #${documentCounter++}`;
    const timestamp = Date.now();

    // If editing an existing item, update the content
    if (currentEditIndex !== null) {
        savedFiles[currentEditIndex] = { name, content: contentInput, timestamp };
    } else {
        // Otherwise, add a new item
        savedFiles.push({ name, content: contentInput, timestamp });
    }

    localStorage.setItem('htmlFiles', JSON.stringify(savedFiles));
    localStorage.setItem('documentCounter', documentCounter); // Store the updated counter
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
        const listItem = document.createElement('li');

        const nameInput = document.createElement('input');
        nameInput.value = file.name;
        nameInput.className = 'name-input';
        nameInput.readOnly = true;

        nameInput.addEventListener('click', () => {
            nameInput.readOnly = false;
            nameInput.focus();
        });

        nameInput.addEventListener('blur', () => {
            saveNameChange(nameInput, index);
        });
        nameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                nameInput.blur();
            }
        });

        const timeSpan = document.createElement('p');
        timeSpan.textContent = `Saved ${formatTimeDifference(file.timestamp)}`;
        timeSpan.className = 'time-span';

        const viewButton = document.createElement('button');
        viewButton.className = 'icon-button';
        viewButton.innerHTML = '<span class="material-icons">visibility</span>';
        viewButton.onclick = () => viewHTML(file.content);

        const editButton = document.createElement('button');
        editButton.className = 'icon-button';
        editButton.innerHTML = '<span class="material-icons">edit</span>';
        editButton.onclick = () => openModal(index);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'icon-button';
        deleteButton.innerHTML = '<span class="material-icons">delete</span>';
        deleteButton.onclick = () => deleteHTML(index);

        listItem.appendChild(nameInput);
        listItem.appendChild(viewButton);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
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