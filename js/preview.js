let currentViewIndex = null;

export function viewHTML(content, index) {
    currentViewIndex = index; // Store the index of the currently viewed HTML document
    const previewIframe = document.getElementById('htmlPreview');
    document.getElementById('listView').style.display = 'none';
    document.getElementById('previewView').style.display = 'block';
    previewIframe.srcdoc = content;
}

export function exitPreview() {
    document.getElementById('listView').style.display = 'block';
    document.getElementById('previewView').style.display = 'none';
}

export function showPrettyPrint(savedFiles) {
    if (currentViewIndex === null || !savedFiles[currentViewIndex]) {
        alert('Unable to retrieve HTML content.');
        return;
    }

    const file = savedFiles[currentViewIndex];
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

export function refreshPreview(savedFiles) {
    if (currentViewIndex === null || !savedFiles[currentViewIndex]) {
        alert('Unable to refresh. No HTML content loaded.');
        return;
    }

    const file = savedFiles[currentViewIndex];
    const content = file.content;
    
    const previewIframe = document.getElementById('htmlPreview');
    previewIframe.srcdoc = content; // Reload the content in the iframe
}

export { currentViewIndex };