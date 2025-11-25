/**
 * Format the Seat data into CSV
 * @param {Array} seatData - Array of information about those who hold Github Copilot Licenses
 * @param {boolean} isEngaged - Whether to upload the latest Engaged users or Unengaged users
 * @returns {string} CSV string including header row
 */
function formatIntoCSV(seatData, isEngaged) {
    if (!Array.isArray(seatData) || seatData.length === 0) {
        return '';
    }

    const headers = ['Username', 'ONS Email/s', 'GitHub Profile', 'Last Activity'];

    // Ensure conversion to string then add double quotes
    const addQuotes = value => {
        if (value === null || value === undefined) {
            return '';
        } 
        
        const str = String(value);
        return `"${str}"`;
    };

    // Create the headers row for the CSV
    const headerRow = headers.map(addQuotes).join(',');

    // For each piece of information map it and assign it to the rowValues
    const dataRows = seatData.map(user => {
        const login = user.assignee.login;
        const emailField = user.assignee.email;
        const emails = Array.isArray(emailField) ? emailField.join('; ') : emailField;
        const lastActivity = user.last_activity_at;

        const rowValues = [
            login,
            emails,
            `https://github.com/${login}`,
            lastActivity,
        ];
        return rowValues.map(addQuotes).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
}

module.exports = { formatIntoCSV };


