import { loadFileById } from './storage.js';

// Display metadata information of a given HTML file by ID
export async function showMetadata(fileId) {
    console.log(`showMetadata called with fileId: ${fileId}`);

    try {
        // Load the file by its ID using the updated storage model
        const file = await loadFileById(fileId);
        
        if (!file) {
            console.warn(`No file found with ID: ${fileId}`);
            alert(`File with ID ${fileId} not found.`);
            return;
        }

        // Ensure metadata has default values if missing
        const metadata = file.metadata || {
            compressedSize: 'Unknown',
            uncompressedSize: 'Unknown',
            scripts: 'Unknown',
            externalReferences: 'Unknown',
            externalUrls: []
        };

        // Create an ordered list of external URLs if available, with icons based on HTTP/HTTPS
        const externalUrlsList = metadata.externalUrls && metadata.externalUrls.length > 0
            ? `<ol>${metadata.externalUrls.map(({ url, isHttps }) => {
                const icon = isHttps ? 'lock' : 'warning';
                const iconColor = isHttps ? '#4caf50' : '#f44336'; // Green for HTTPS, red for HTTP.
                return `<li>
                            <span class="material-icons" style="color: ${iconColor}; vertical-align: middle;">${icon}</span>
                            ${url}
                        </li>`;
            }).join('')}</ol>`
            : '<p>No external URLs found.</p>';

        // Populate metadata content
        const metadataContent = `
            <div class="info-section">
                <p><span class="info-label">Name:</span> <span class="info-value">${file.name}</span></p>
                <p><span class="info-label">Compressed Size:</span> <span class="info-value">${metadata.compressedSize}</span></p>
                <p><span class="info-label">Uncompressed Size:</span> <span class="info-value">${metadata.uncompressedSize}</span></p>
                <p><span class="info-label">Number of Scripts:</span> <span class="info-value">${metadata.scripts}</span></p>
                <p><span class="info-label">External References:</span> <span class="info-value">${metadata.externalReferences}</span></p>
            </div>
            <div class="info-section">
                <h3>External URLs</h3>
                ${externalUrlsList}
            </div>
        `;

        // Insert metadata content into the modal and show the modal
        document.getElementById('metadataContent').innerHTML = metadataContent;
        document.getElementById('metadataModal').style.display = 'flex';
    } catch (error) {
        console.error(`Error loading metadata for file with ID ${fileId}:`, error);
        alert('An error occurred while loading metadata.');
    }
}

// Close the metadata modal
export function closeMetadataModal() {
    document.getElementById('metadataModal').style.display = 'none';
}