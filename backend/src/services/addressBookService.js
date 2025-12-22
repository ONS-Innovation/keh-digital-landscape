const s3Service = require('./s3Service');
const logger = require('../config/logger');

/**
 * AddressBookService manages address book lookups and formatting.
 */
class AddressBookService {
    constructor () {
        this.emailKey = 'addressBookEmailKey.json'; // Dictionary for Emails to Usernames
        this.usernameKey = 'addressBookUsernameKey.json'; // Dictionary for Usernames to Emails
    }

    /**
     * Fetch address book lookup maps from S3.
     * @returns {Promise<{emailToUsernameData: Record<string, string>, usernameToEmailData: Record<string, string>}>} Maps for conversion between usernames and emails.
     * @throws {Error} If S3 retrieval fails.
     */
    async getAddressBookData() {
        try {
            const [emailToUsernameRaw, usernameToEmailRaw] = await Promise.all([
                s3Service.getObject('main', this.emailKey),
                s3Service.getObject('main', this.usernameKey)
            ]);
            const emailToUsernameData = this.normalizeMap(emailToUsernameRaw);
            const usernameToEmailData = this.normalizeMap(usernameToEmailRaw);
            return { emailToUsernameData, usernameToEmailData };
        } catch (error) {
            logger.error('Error fetching Address book data', { error: error.message });
            throw error;
        }
    }

    /**
     * Create a new object with all keys lowercased (for case-insensitive lookups).
     * @param {Record<string, string>} obj
     * @returns {Record<string, string>}
     */
    normalizeMap(obj) {
        try {
            const entries = Object.entries(obj || {});
            return entries.reduce((acc, [k, v]) => {
                acc[String(k).toLowerCase()] = v;
                return acc;
            }, {});
        } catch (_) {
            return {};
        }
    }

    /**
     * Resolve the counterpart for each identifier.
     * @param {string[]} input - List of usernames or emails.
     * @returns {Promise<Array<[string|undefined, string|undefined]>>} Pairs as [username, email].
     * @throws {Error} If address book data cannot be fetched.
     */
    async filterAddressBookData(input) {
        const { emailToUsernameData, usernameToEmailData } = await this.getAddressBookData();

        let output = [];

        input.forEach(userDetail => {
            const raw = String(userDetail).trim();
            const isUsername = !raw.includes('@');
            const key = raw.toLowerCase();

            if (isUsername) {
                const email = usernameToEmailData?.[key];
                
                output.push([raw, email]);
            } else {
                const username = emailToUsernameData?.[key];
                
                const canonicalEmail = username
                    ? (usernameToEmailData?.[String(username).toLowerCase()] || raw.toLowerCase())
                    : raw.toLowerCase();
                output.push([username, canonicalEmail]);
            }
        });

        return output;
    }


    /**
     * Build user info objects for the given usernames/emails.
     * @param {string[]} input - Usernames or emails.
     * @returns {Promise<Array<{username: string|undefined, email: string|undefined, url: string, fullname: string|null}>|null>} User details including username, email, GitHub URL, and derived full name; returns null if no input provided.
     */
    async formatAddressBookData(input = []) {
        if (input.length === 0) {
            logger.warn("No inputs were given to Address Book Service");
            return [];
        }

        const output = await this.filterAddressBookData(input);

        const formattedOutput = [];
        const seenUsernames = new Set();

        for (const user of output) {
            const username = user[0];
            const email = user[1];
            const githubLink = this.getGitHubLink(username);
            const fullName = this.getNameByEmail(email);

            if (username && email && githubLink && fullName) {
                const key = String(username).toLowerCase();
                if (seenUsernames.has(key)) continue;
                seenUsernames.add(key);
                const userInfo = { username, email, url: githubLink, fullname: fullName };
                formattedOutput.push(userInfo);
            }
        }

        return formattedOutput;
    }


    /**
     * Get the employee’s GitHub profile URL.
     * @param {string} username
     * @returns {string} GitHub profile URL.
     */
    getGitHubLink(username) {
        if (!username) return null;
        return `https://github.com/${username}`
    }


    /**
     * Derive a display name from an ONS email (e.g., "john.smith@ons.gov.uk" → "john smith").
     * @param {string} email
     * @returns {string|null} Lowercased "firstname lastname" or null if email is falsy/invalid.
     */
    getNameByEmail(email) {
        if (!email) return null;
        return String(email).toLowerCase().split('@')[0].split('.').slice(0, 2).join(' ');
    }
}


module.exports = new AddressBookService();