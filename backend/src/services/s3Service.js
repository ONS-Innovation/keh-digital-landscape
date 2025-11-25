const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../config/logger');

/**
 * S3Service class for managing S3 operations
 */
class S3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: 'eu-west-2',
    });

    // Bucket configurations
    this.buckets = {
      main: process.env.BUCKET_NAME || 'sdp-dev-digital-landscape',
      tat: process.env.TAT_BUCKET_NAME || 'sdp-dev-tech-audit-tool-api',
      copilot:
        process.env.COPILOT_BUCKET_NAME || 'sdp-dev-copilot-usage-dashboard',
    };
  }

  /**
   * Get an object from S3 bucket
   * @param {string} bucket - Bucket name or bucket key from this.buckets
   * @param {string} key - Object key
   * @returns {Promise<Object>} Parsed JSON object
   */
  async getObject(bucket, key) {
    try {
      const bucketName = this.buckets[bucket] || bucket;
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const { Body } = await this.s3Client.send(command);
      const data = await Body.transformToString();
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error getting object from S3: ${bucket}/${key}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Put an JSON object to S3 bucket
   * @param {string} bucket - Bucket name or bucket key from this.buckets
   * @param {string} key - Object key
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  async putObject(bucket, key, data) {
    try {
      const bucketName = this.buckets[bucket] || bucket;
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json',
      });

      await this.s3Client.send(command);
      logger.info(`Successfully put object to S3: ${bucket}/${key}`);
    } catch (error) {
      logger.error(`Error putting object to S3: ${bucket}/${key}`, {
        error: error.message,
      });
      throw error;
    }
  }


  /**
   * Put an CSV object to S3 bucket
   * @param {string} bucket - Bucket name or bucket key from this.buckets
   * @param {string} key - Object key
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  async putCSVObject(bucket, key, data) {
    try {
      const bucketName = this.buckets[bucket] || bucket;
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: data,
        ContentType: 'text/csv',
      });

      await this.s3Client.send(command);
      logger.info(`Successfully put object to S3: ${bucket}/${key}`);
    } catch (error) {
      logger.error(`Error putting object to S3: ${bucket}/${key}`, {
        error: error.message,
      });
      throw error;
    }
  }


  /**
   * Get a signed URL for an S3 object and fetch its content
   * @param {string} bucket - Bucket name or bucket key from this.buckets
   * @param {string} key - Object key
   * @param {number} expiresIn - URL expiration time in seconds (default: 300)
   * @returns {Promise<Object>} Parsed JSON object
   */
  async getObjectViaSignedUrl(bucket, key, expiresIn = 300) {
    try {
      const bucketName = this.buckets[bucket] || bucket;
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      const response = await fetch(signedUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      return jsonData;
    } catch (error) {
      logger.error(
        `Error getting object via signed URL from S3: ${bucket}/${key}`,
        { error: error.message }
      );
      throw error;
    }
  }

  /**
   * Get bucket name by key
   * @param {string} bucketKey - Key from this.buckets
   * @returns {string} Bucket name
   */
  getBucketName(bucketKey) {
    return this.buckets[bucketKey] || bucketKey;
  }
}

// Export a singleton instance
module.exports = new S3Service();
