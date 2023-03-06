import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { usePlayerState } from "~/context/player";
import dayjs from "dayjs";
import { PrismaClient } from "@prisma/client";
import aws from "aws-sdk";
import { Picture } from "@prisma/client";

aws.config.update({
  signatureVersion: "v4",
});

aws.config.update({ region: process.env.AWS_S3_BUCKET_REGION });

const s3 = new aws.S3({
  region: process.env.AWS_S3_BUCKET_REGION,
});

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const today: Date = dayjs().startOf("day").toDate();

  const picture = await prisma.picture.findFirst({
    where: {
      scheduledFor: today,
    },
  });

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: picture?.filename,
    Expires: 60, // The expiration time of the signed URL in seconds
  };

  const pictureUrl = await s3.getSignedUrlPromise("getObject", params);

  return {
    props: {
      pictureUrl,
      picture: {
        ...picture,
        scheduledFor: dayjs(picture?.scheduledFor).format(),
      },
    }, // will be passed to the page component as props
  };
}

const Home: NextPage = ({
  picture,
  pictureUrl,
}: {
  picture: Picture & { scheduledAt: string };
  pictureUrl: string;
}) => {
  const [player] = usePlayerState();
  console.log({ pictureUrl });
  return (
    <>
      <Head>
        <title>themole.io</title>
        <meta
          name="description"
          content="A fun 'I Spy' game with unique daily challenges."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <pre className="text-xs text-white">{JSON.stringify({ player })}</pre>
          <pre className="text-xs text-white">
            {JSON.stringify({ picture })}
          </pre>
          <h1 className="text-4xl font-bold text-white">
            {picture.description}
          </h1>
          <img
            alt="Picture of the day"
            src={pictureUrl}
            width={400}
            height={400}
          />
        </div>
      </main>
    </>
  );
};

export default Home;
