import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * Upload the data into S3
 * @param {Array} data - Array of CSV data to be uploaded
 * @param {String} fileName - Name of the file for data to be uploaded to
 */
export const uploadToS3 = async (data, fileName) => {
    if (!data || data.length < 1) {
        console.error("There is no data to upload to s3.");
        return;
    }

    const region = process.env.REACT_APP_AWS_REGION;
    const accessKeyId = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;

    if (!region) {
        console.error("Missing REACT_APP_AWS_REGION.");
        return;
    }
    if (!accessKeyId || !secretAccessKey) {
        console.error("Missing AWS credentials. Move upload to backend.");
        return;
    }

    const client = new S3Client({
        region,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
    const command = new PutObjectCommand({
        Bucket: "sdp-dev-digital-landscape",
        Key: fileName,
        Body: data,
        ContentType: "text/csv",
    });

    try {
        const response = await client.send(command);
        console.log(response);
    } catch (Exception) {
        console.error("Uploaded failed:", Exception);
        throw Exception;
    }
}