/**
 * Fetches the list of directorates from the backend API.
 * @returns {Promise<Array>} A promise that resolves to an array of directorates.
 */
export const getDirectorates = async () => {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const url = `${backendUrl}/api/directorates/json`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch directorates: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading directorates:', error);
        return [];
    }
};