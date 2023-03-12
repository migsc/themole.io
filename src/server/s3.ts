import aws from "aws-sdk";

aws.config.update({
  signatureVersion: "v4",
});

aws.config.update({ region: process.env.AWS_S3_BUCKET_REGION });

const s3 = new aws.S3({
  region: process.env.AWS_S3_BUCKET_REGION,
});

export default s3;

//   s3.putObject({
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     Key: "test",
//     Body: "test",
//   });
