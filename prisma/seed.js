/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const { PrismaClient } = require("@prisma/client");
const dayjs = require("dayjs");

const prisma = new PrismaClient();

const samplePictures = [
  {
    filename: "sample-dudas-1.jpg",
    description: "Find the heart among the elephants.",
    hitboxes: [
      {
        topLeft: [239, 42],
        bottomRight: [360, 81],
      },
    ],
  },
  {
    filename: "sample-dudas-2.jpg",
    description: "Find the easter egg in the field of tulips.",
    hitboxes: [
      {
        topLeft: [539, 465],
        bottomRight: [574, 504],
      },
    ],
  },
];

async function seed() {
  const $today = dayjs().subtract(1, "day").startOf("day");

  for (const [index, samplePic] of samplePictures.entries()) {
    // await prisma.picture.deleteMany({
    //   where: {
    //     filename: samplePic.filename,
    //   },
    // });

    await prisma.picture.deleteMany({});

    const day = $today.add(index, "day").startOf("day").toDate();

    const picture = await prisma.picture.create({
      data: {
        scheduledFor: day,
        filename: samplePic.filename,
        description: samplePic.description,
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
