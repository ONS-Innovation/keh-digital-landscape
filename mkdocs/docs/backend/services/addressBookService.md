# Address Book Service

The Address Book Service provides centralised functionality for resolving user information from GitHub usernames and ONS email addresses. It loads lookup dictionaries from S3, performs matching for all inputted data and then returns user information including the Profile picture, GitHub profile URL and username, Full name and Email Address.

## Overview

The service specialises in address book lookups and formatting:

- Convert emails to usernames (and vice versa) using S3 dictionaries
- Use GitHub Account IDs for GitHub profile pictures
- Handle user inputs to retrieve data

## Dependencies

The service relies on:

- GitHub App authentication (via `getAppAndInstallation` utility)
- Application logging system
- Environment variables for organisation configuration
- S3 object retrieval via `s3Service.getObject(bucket, key)`
- Application logging (`logger`)
- S3 keys within folder `AddressBook/`:
  - `addressBookEmailKey.json` (email → username)
  - `addressBookUsernameKey.json` (username → email)
  - `addressBookIDKey.json` (username → GitHub Account ID)

## Methods

### `getAddressBookData()`

Fetch the three lookup maps from S3 and normalise their keys to lowercase.

**Returns:** `{ emailToUsernameData, usernameToEmailData, usernameToIDData }`

**Errors:** Logs and rethrows if S3 retrieval fails.

### `normaliseMap(obj)`

Create a new object with lowercased keys for case-insensitive lookups.

**Returns:** Normalised map or `{}` if input is invalid.

### `filterAddressBookData(input)`

Resolve each identifier (username or email) to its counterpart(s).

**Input:** `string[]` of usernames or emails

**Returns:** `Array<[username|undefined, email|undefined, accountID|undefined]>`

**Notes:**

- Usernames are detected by absence of `@`
- Emails are canonicalised to lowercase; if an email maps to a username, the canonical email is retrieved from the username map

### `formatAddressBookData(input = [])`

Build formatted user info objects for the given inputs.

**Returns:** `Array<{ username, email, accountID, avatarUrl, url, fullname }>`

**Behaviour:**

- Returns `[]` and logs a warning when `input` is empty
- Deduplicates by lowercase `username`
- Only includes users where `username`, `email`, `accountID`, `url`, and `fullname` are all present

### `getAvatarLink(accountID)`

Return a GitHub avatar URL for a given Account ID or `null` if missing.

### `getGitHubLink(username)`

Return a GitHub profile URL for a given username or `null` if missing.

### `getNameByEmail(email)`

Derive a lowercase display name from an ONS email, e.g., `john.smith@ons.gov.uk → "john smith"`.

## Data Flow

1. Inputs are trimmed and inspected to determine username vs email
2. Lookup maps are fetched via `getAddressBookData()`
3. `filterAddressBookData()` produces `[username, email, accountID]` tuples
4. `formatAddressBookData()` enriches tuples with `avatarUrl`, `url`, and `fullname`, then filters and deduplicates

## Error Handling

- S3 failures are logged and rethrown in `getAddressBookData()`
- `normaliseMap()` guards against invalid objects and returns `{}`
- Empty inputs log a warning and return `[]`

## Usage Examples

### Resolve and format a single username

```javascript
const addressBookService = require('../services/addressBookService');

async function getUser(username) {
  const result = await addressBookService.formatAddressBookData([username]);
  return result[0] || null;
}

// Example output
// {
//   username: 'username',
//   email: 'firstName.lastName@ons.gov.uk',
//   accountID: '1234567',
//   avatarUrl: 'https://avatars.githubusercontent.com/u/1234567',
//   url: 'https://github.com/username',
//   fullname: 'firstName lastName'
// }
```

### Multiple inputs and deduplication

```javascript
const inputs = ['cooper-wright', 'cooper.wright@ons.gov.uk', 'totaldwarf03'];
const users = await addressBookService.formatAddressBookData(inputs);
// Returns unique, fully populated user objects for valid inputs
```

## Implementation Notes

- Inputs are case-insensitive; keys are normalised to lowercase
- Deduplication uses lowercase `username`
- `avatarUrl` and `url` depend on `accountID` and `username`, respectively
- Consumers should handle the case where no users are returned (e.g. show "No results.")
