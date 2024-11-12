let currentEditFileName = null; // Declare the variable at the top

// Updated openModal function to use fileName instead of index
export function openModal(fileName = null) {
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('nameInputContainer').style.display = 'none';
    document.getElementById('htmlContent').value = '';
    document.getElementById('htmlNameInput').value = '';

    // If a fileName is provided, it means we are editing
    if (fileName !== null) {
        const file = savedFiles.find(f => f.name === fileName);
        if (file) {
            // Populate the modal with the file's content and name
            document.getElementById('htmlContent').value = file.content;
            document.getElementById('htmlNameInput').value = file.name;
            document.getElementById('nameInputContainer').style.display = 'block';

            // Optionally store the index or reference of the current file being edited
            currentEditFileName = fileName; // Track the file being edited
        } else {
            console.error(`File with name "${fileName}" not found.`);
        }
    } else {
        // If adding new HTML
        currentEditFileName = null;
    }
}

export function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('htmlContent').value = '';
    document.getElementById('htmlNameInput').value = '';
    currentEditFileName = null;
}

export function saveHTML() {
    let contentInput = document.getElementById('htmlContent').value.trim();
    const nameInput = document.getElementById('htmlNameInput').value.trim();

    if (!contentInput) {
        alert('Please enter HTML content.');
        return;
    }

    // Format the HTML using js-beautify
    contentInput = html_beautify(contentInput, {
        indent_size: 2,
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
    if (currentEditFileName !== null) {
        // Find the index of the file being edited by its name
        const fileIndex = savedFiles.findIndex(f => f.name === currentEditFileName);
        if (fileIndex !== -1) {
            savedFiles[fileIndex] = htmlFile; // Update the existing file
        }
    } else {
        savedFiles.push(htmlFile); // Add new file
    }

    localStorage.setItem('htmlFiles', JSON.stringify(savedFiles));
    loadHTMLFiles(savedFiles, viewHTML, openModal, showMetadata, deleteHTML); // Reload the list
    closeModal();
}

function extractTitle(htmlContent) {
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1] : null;
}