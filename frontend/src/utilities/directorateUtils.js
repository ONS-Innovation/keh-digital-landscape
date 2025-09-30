export const getDirectorateColour = (directorateId, directorates) => {
    for (let i = 0; i < directorates.length; i++) {
        if (directorates[i].id === directorateId) {
            return directorates[i].colour || 'var(--accent)';
        }
    }

    return 'var(--accent)'; // Default colour if not found
}

export const getDirectorateName = (directorateId, directorates) => {
    for (let i = 0; i < directorates.length; i++) {
        if (directorates[i].id === directorateId) {
            return directorates[i].name;
        }
    }

    return 'Unknown Directorate'; // Default if not found
}