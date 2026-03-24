"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresignedUploadUrl = exports.uploadToR2 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const node_http_handler_1 = require("@smithy/node-http-handler");
const https_1 = __importDefault(require("https"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const s3Client = new client_s3_1.S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
    requestHandler: new node_http_handler_1.NodeHttpHandler({
        httpsAgent: new https_1.default.Agent({
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
const uploadToR2 = async (file) => {
    const fileExtension = path_1.default.extname(file.originalname);
    const randomFileName = crypto_1.default.randomBytes(16).toString("hex") + fileExtension;
    const objectKey = randomFileName;
    // Convert buffer to readable stream for efficient streaming
    const stream = stream_1.Readable.from(file.buffer);
    const upload = new lib_storage_1.Upload({
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
exports.uploadToR2 = uploadToR2;
/**
 * Generates a presigned URL for direct client-side upload to R2
 */
const getPresignedUploadUrl = async (fileName, contentType) => {
    const fileExtension = path_1.default.extname(fileName);
    const randomFileName = crypto_1.default.randomBytes(16).toString("hex") + fileExtension;
    const objectKey = randomFileName;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: objectKey,
        ContentType: contentType,
    });
    // URL expires in 3600 seconds (1 hour)
    const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
    const publicBaseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
    const publicUrl = publicBaseUrl
        ? `${publicBaseUrl}/${objectKey}`
        : `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${objectKey}`;
    return { uploadUrl, publicUrl };
};
exports.getPresignedUploadUrl = getPresignedUploadUrl;
