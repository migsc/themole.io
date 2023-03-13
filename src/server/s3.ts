import { S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_S3_BUCKET_REGION,
});

export default client;
