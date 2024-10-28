export function loadSavedFiles() {
    return JSON.parse(localStorage.getItem('htmlFiles') || '[]');
}

export function saveFiles(savedFiles) {
    localStorage.setItem('htmlFiles', JSON.stringify(savedFiles));
}

export function incrementDocumentCounter(savedFiles) {
    return savedFiles.length + 1;
}

export function deleteHTML(savedFiles, index) {
    savedFiles.splice(index, 1);
    saveFiles(savedFiles);
    return savedFiles;
}