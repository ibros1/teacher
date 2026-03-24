/**
 * One-time script to set CORS policy on the R2 bucket.
 * Run with: npx ts-node set-cors.ts
 */
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

async function setCors() {
  const command = new PutBucketCorsCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: ["http://localhost:5173"],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedHeaders: ["*"],
          ExposeHeaders: ["ETag", "Content-Type"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  });

  try {
    const response = await s3Client.send(command);
    console.log("✅ CORS policy set successfully!", response);
  } catch (error) {
    console.error("❌ Failed to set CORS:", error);
  }
}

setCors();
