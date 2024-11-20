import { loadFileById } from './storage.js';

export async function showMetadata(fileId) {
    console.log(`showMetadata called with fileId: ${fileId}`);

    try {
        const file = await loadFileById(fileId);

        if (!file) {
            console.warn(`No file found with ID: ${fileId}`);
            alert(`File with ID ${fileId} not found.`);
            return;
        }

        // Calculate the file size in bytes
        const fileSizeBytes = new Blob([file.content]).size;
        const fileSizeFormatted = formatFileSize(fileSizeBytes);

        const metadata = file.metadata || {
            scripts: 'Unknown',
            externalReferences: 'Unknown',
            externalUrls: []
        };

        // Debugging: Log the external URLs to see if they are being parsed correctly
        console.log('External URLs:', metadata.externalUrls);

        // Handle cases where externalUrls might be undefined or an unexpected format
        const externalUrlsList =
            metadata.externalUrls &&
            Array.isArray(metadata.externalUrls) &&
            metadata.externalUrls.length > 0
                ? `<ul>${metadata.externalUrls
                      .map(({ url, isHttps }) => {
                          if (!url) return ''; // Skip if URL is undefined or empty

                          const icon = isHttps ? 'lock' : 'warning';
                          const iconColor = isHttps ? '#4caf50' : '#f44336';
                          return `<li class="external-url-item">
                                      <span class="material-icons" style="color: ${iconColor};">${icon}</span>
                                      <a href="${url}" target="_blank">${url}</a>
                                  </li>`;
                      })
                      .join('')}</ul>`
                : '<p>No external URLs found.</p>';

        const metadataContent = `
            <div class="info-section">
                <p><span class="info-label">File GUID:</span> <span class="info-value">${file.id}</span></p>
                <p><span class="info-label">Name:</span> <span class="info-value">${file.name}</span></p>
                <p><span class="info-label">File Size:</span> <span class="info-value">${fileSizeFormatted}</span></p>
                <p><span class="info-label">Number of Scripts:</span> <span class="info-value">${metadata.scripts}</span></p>
                <p><span class="info-label">External References:</span> <span class="info-value">${metadata.externalReferences}</span></p>
            </div>
            <div class="info-section external-urls-section">
                <h3>External URLs</h3>
                ${externalUrlsList}
            </div>
        `;

        document.getElementById('metadataContent').innerHTML = metadataContent;
        document.getElementById('metadataModal').style.display = 'flex';
    } catch (error) {
        console.error(`Error loading metadata for file with ID ${fileId}:`, error);
        alert('An error occurred while loading metadata.');
    }
}

export function closeMetadataModal() {
    document.getElementById('metadataModal').style.display = 'none';
}

// Helper function to format file size
function formatFileSize(bytes) {
    const units = ['bytes', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}