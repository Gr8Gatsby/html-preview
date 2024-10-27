// modal.js

export function openModal(index = null) {
    currentEditIndex = index;
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

export function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('htmlContent').value = '';
    document.getElementById('htmlNameInput').value = '';
    currentEditIndex = null;
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

function extractTitle(htmlContent) {
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1] : null;
}