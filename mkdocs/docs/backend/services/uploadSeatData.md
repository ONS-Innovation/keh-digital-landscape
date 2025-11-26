# Upload Seat Data Service

The Upload Seat Data service takes in API requests, transforms the data and then uploads it to S3, making it the main source of control (within the backend) for Seat Data upload.

## Overview

The service manages seat data uploading operations:

- Formatting seat data into CSV
- Correctly naming the file
- Uploading the file to S3

## Dependencies

The service integrates with:

- S3 Service for data storage and retrieval
- Application logging system
- CSV formatting from an Array

## Methods

### `seatDataUpload()`

Formats and Uploads Github Copilot seat data to S3

**Arguments:** 
- data, an array of all seat data collected within githubService.js
- isEngaged, a boolean value which says whether the data is for engaged or inactive users

## Validation Logic

The service implements simple validation:

### Entry Validation

```javascript
    async function seatDataUpload(data, isEngaged) {
    if (!Array.isArray(data) || data.length === 0) {
        logger.error('Seat Data is empty.');
        throw new Error('Seat data is empty.');
    }

    //...
```

## Storage Integration

The service seamlessly integrates with S3 storage:

## Error Handling

The service provides comprehensive error handling:

- **Validation Errors** - Clear messages for invalid data