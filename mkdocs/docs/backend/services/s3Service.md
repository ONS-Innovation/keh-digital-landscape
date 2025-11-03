# S3 Service

The S3 Service provides a centralised interface for all Amazon S3 operations within the Digital Landscape backend. It implements a singleton pattern to ensure consistent S3 client instances and provides methods for common S3 operations.

## Overview

The service manages three different S3 buckets:

- **Main bucket** - Primary application data storage
- **TAT bucket** - Technology Assessment Tool data
- **Copilot bucket** - GitHub Copilot metrics and data

## Configuration

The service automatically configures S3 clients based on environment variables:

```javascript
const mainBucket = process.env.S3_BUCKET_NAME;
const tatBucket = process.env.S3_BUCKET_NAME_TAT;
const copilotBucket = process.env.S3_BUCKET_NAME_COPILOT;
```

## Methods

### `getObject(bucket, key)`

Retrieves an object from the specified S3 bucket.

**Parameters:**

- `bucket` (string) - The S3 bucket name
- `key` (string) - The object key/path

**Returns:** Promise resolving to the object data

**Example:**

```javascript
const s3Service = require('./s3Service');
const data = await s3Service.getObject('my-bucket', 'data/file.json');
```

### `putObject(bucket, key, body, contentType = 'application/json')`

Stores an object in the specified S3 bucket.

**Parameters:**

- `bucket` (string) - The S3 bucket name
- `key` (string) - The object key/path
- `body` (any) - The object data to store
- `contentType` (string, optional) - MIME type (default: 'application/json')

**Returns:** Promise resolving to the put operation result

**Example:**

```javascript
const result = await s3Service.putObject('my-bucket', 'data/file.json', { message: 'Hello World' });
```

### `getObjectViaSignedUrl(bucket, key, expiresIn = 3600)`

Generates a presigned URL for accessing an S3 object.

**Parameters:**

- `bucket` (string) - The S3 bucket name
- `key` (string) - The object key/path
- `expiresIn` (number, optional) - URL expiration time in seconds (default: 3600)

**Returns:** Promise resolving to the signed URL

**Example:**

```javascript
const signedUrl = await s3Service.getObjectViaSignedUrl('my-bucket', 'private/file.pdf', 7200);
```

## Bucket Configuration Methods

### `getMainBucket()`

Returns the main application bucket name.

### `getTatBucket()`

Returns the TAT (Technology Assessment Tool) bucket name.

### `getCopilotBucket()`

Returns the Copilot metrics bucket name.

## Error Handling

The service includes comprehensive error handling:

- Logs all S3 operations and errors using the application logger
- Throws descriptive errors for failed operations
- Handles AWS SDK errors appropriately

## Usage Example

```javascript
const s3Service = require('../services/s3Service');

// Get project data
try {
  const projectData = await s3Service.getObject(s3Service.getMainBucket(), 'projects/data.json');
  console.log('Project data retrieved successfully');
} catch (error) {
  console.error('Failed to retrieve project data:', error);
}

// Store updated data
try {
  await s3Service.putObject(s3Service.getMainBucket(), 'projects/updated-data.json', {
    projects: updatedProjects,
  });
  console.log('Data stored successfully');
} catch (error) {
  console.error('Failed to store data:', error);
}
```

## Implementation Notes

- Uses singleton pattern to maintain single S3 client instances
- Automatically stringifies JSON data for storage
- Provides consistent error logging across all operations
- Supports multiple bucket configurations for different data types
