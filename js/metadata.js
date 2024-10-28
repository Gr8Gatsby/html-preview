// Display metadata information of a given HTML file.
export function showMetadata(index, savedFiles) {
    if (index === undefined || index === null) {
        console.warn('Metadata index is undefined or null.');
        return;
    }

    const file = savedFiles[index];
    if (!file) {
        console.warn('No file found at the provided index:', index);
        return;
    }

    // Ensure metadata has default values if missing.
    const metadata = file.metadata || {
        size: 'Unknown',
        scripts: 'Unknown',
        externalReferences: 'Unknown',
        externalUrls: []
    };

    // Create an ordered list of external URLs if available, with icons based on HTTP/HTTPS.
    const externalUrlsList = metadata.externalUrls.length > 0
        ? `<ol>${metadata.externalUrls.map(({ url, isHttps }) => {
            const icon = isHttps ? 'lock' : 'warning';
            const iconColor = isHttps ? '#4caf50' : '#f44336'; // Green for HTTPS, red for HTTP.
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

// Close the metadata modal.
export function closeMetadataModal() {
    document.getElementById('metadataModal').style.display = 'none';
}