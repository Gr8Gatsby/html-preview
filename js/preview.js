let currentViewFileName = null; // Use file name to track the currently viewed document

export function viewHTML(content, fileName) {
    currentViewFileName = fileName; // Store the file name of the currently viewed HTML document
    const previewIframe = document.getElementById('htmlPreview');

    // Display preview view and hide the list view
    document.getElementById('listView').style.display = 'none';
    document.getElementById('previewView').style.display = 'block';

    // Set the content of the iframe
    if (previewIframe) {
        previewIframe.srcdoc = content;
    } else {
        console.error("Could not find iframe with ID 'htmlPreview'");
    }
}

export function exitPreview() {
    document.getElementById('listView').style.display = 'block';
    document.getElementById('previewView').style.display = 'none';
}

export function showPrettyPrint(savedFiles) {
    if (!currentViewFileName) {
        alert('Unable to retrieve HTML content.');
        return;
    }

    // Find the file by its name
    const file = savedFiles.find(f => f.name === currentViewFileName);
    if (!file) {
        alert('File not found.');
        return;
    }

    const htmlContent = file.content;

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

export function closePrettyPrintModal() {
    document.getElementById('prettyPrintModal').style.display = 'none';
}

export function refreshPreview() {
    const previewIframe = document.getElementById('htmlPreview');

    // Check if iframe has a `src` URL or `srcdoc`
    if (previewIframe.src) {
        // Reload by refreshing the URL
        previewIframe.contentWindow.location.reload();
    } else if (previewIframe.srcdoc) {
        // Re-trigger srcdoc to reload inline HTML
        previewIframe.srcdoc = previewIframe.srcdoc;
    } else {
        alert('Unable to refresh. No content loaded in iframe.');
    }
}

export { currentViewFileName };