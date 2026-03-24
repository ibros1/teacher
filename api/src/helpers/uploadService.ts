import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import https from "https";
import crypto from "crypto";
import path from "path";
import { Readable } from "stream";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
  requestHandler: new NodeHttpHandler({
      httpsAgent: new https.Agent({
          keepAlive: true,
          timeout: 120000, // 2 minute timeout
      }),
  }),
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

/**
 * Streaming upload to R2 using multipart upload.
 * Streams the file in 5MB chunks instead of buffering the entire file.
 */
export const uploadToR2 = async (file: Express.Multer.File): Promise<string> => {
  const fileExtension = path.extname(file.originalname);
  const randomFileName = crypto.randomBytes(16).toString("hex") + fileExtension;
  const objectKey = randomFileName;

  // Convert buffer to readable stream for efficient streaming
  const stream = Readable.from(file.buffer);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
      Body: stream,
      ContentType: file.mimetype,
    },
    // 5MB chunks for multipart upload
    partSize: 5 * 1024 * 1024,
    // Upload up to 4 parts concurrently
    leavePartsOnError: false,
    queueSize: 4,
  });

  await upload.done();

  const publicBaseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, ""); 
  const publicUrl = publicBaseUrl 
    ? `${publicBaseUrl}/${objectKey}` 
    : `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${objectKey}`;

  return publicUrl;
};

/**
 * Generates a presigned URL for direct client-side upload to R2
 */
export const getPresignedUploadUrl = async (fileName: string, contentType: string): Promise<{ uploadUrl: string, publicUrl: string }> => {
  const fileExtension = path.extname(fileName);
  const randomFileName = crypto.randomBytes(16).toString("hex") + fileExtension;
  const objectKey = randomFileName;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: objectKey,
    ContentType: contentType,
  });

  // URL expires in 3600 seconds (1 hour)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  const publicBaseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  const publicUrl = publicBaseUrl 
    ? `${publicBaseUrl}/${objectKey}` 
    : `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${objectKey}`;

  return { uploadUrl, publicUrl };
};
