/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const dayjs = require("dayjs");
const { PrismaClient } = require("@prisma/client");
const aws = require("aws-sdk");
const fs = require("fs");

const prisma = new PrismaClient();

aws.config.update({
  signatureVersion: "v4",
});

aws.config.update({ region: process.env.AWS_S3_BUCKET_REGION });

const s3 = new aws.S3({
  region: process.env.AWS_S3_BUCKET_REGION,
});

const samplePictures = require("./sample-data/pictures.json");

async function seed() {
  await prisma.picture.deleteMany({});

  const $today = dayjs().subtract(1, "day").startOf("day");

  for (const [index, samplePic] of samplePictures.entries()) {
    const $day = $today.add(index, "day");
    const dateFormatted = $day.format("YYYY-MM-DD");
    const persistedFilename = `${dateFormatted}-${samplePic.filename}`;

    await saveFileInS3(
      persistedFilename,
      fs.readFileSync(`./prisma/sample-data/${samplePic.filename}`)
    );

    const picture = await prisma.picture.create({
      data: {
        scheduledFor: dateFormatted,
        filename: persistedFilename,
        description: samplePic.description,
        width: samplePic.width,
        height: samplePic.height,
        hitboxes: {
          create: samplePic.hitboxes,
        },
      },
    });

    console.log({ picture });
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function saveFileInS3(key, blob) {
  return new Promise((resolve, reject) => {
    s3.putObject(
      {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: blob,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
}
