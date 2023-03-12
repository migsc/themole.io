import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { usePlayerState } from "~/context/player";
import dayjs from "dayjs";
import { Hitbox, PrismaClient } from "@prisma/client";
import { Picture } from "@prisma/client";
import s3 from "~/server/s3";
import { motion } from "framer-motion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect, useRef, useState } from "react";

const prisma = new PrismaClient();

export async function getStaticProps(context) {
  const todaysDate: string = dayjs().format("YYYY-MM-DD");

  const picture = await prisma.picture.findFirst({
    where: {
      scheduledFor: todaysDate,
    },
    include: {
      hitboxes: true,
    },
  });

  console.log({ picture });

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: picture?.filename,
    Expires: 60, // The expiration time of the signed URL in seconds
  };

  const pictureUrl = await s3.getSignedUrlPromise("getObject", params);

  if (!picture || !pictureUrl) {
    return {
      notFound: true,
    };
  }

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
  picture: Picture & { hitboxes: Hitbox[] };
  pictureUrl: string;
}) => {
  const [player] = usePlayerState();
  const [isDateVisible, setIsDateVisible] = useState<boolean>(false);
  const [isDescriptionVisible, setIsDescriptionVisible] =
    useState<boolean>(false);
  const [isStartVisible, setIsStartVisible] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [timestampStarted, setTimestampStarted] = useState<Date>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const [{ width: currentWidth, height: currentHeight }, setCurrentSize] =
    useState({
      width: picture.width,
      height: picture.height,
    });

  const { width: originalWidth, height: originalHeight } = picture;

  const widthScaleFactor = currentWidth / originalWidth;
  const heightScaleFactor = currentHeight / originalHeight;

  const relativeHitboxes = picture.hitboxes.map((hitbox) =>
    getRelativeHitbox(hitbox, widthScaleFactor, heightScaleFactor)
  );

  console.log({
    currentWidth,
    currentHeight,
    originalWidth,
    originalHeight,
    picture,
    relativeHitboxes,
    widthScaleFactor,
    heightScaleFactor,
  });

  console.log({ pictureUrl });

  const [animationParentRef, enableAnimations] =
    useAutoAnimate(/* optional config */);

  function handleStart() {
    setHasStarted(true);
    setTimestampStarted(new Date());
  }

  function handleImageClicked(e: React.MouseEvent<HTMLImageElement>) {
    e.preventDefault();

    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;

    for (const hitbox of relativeHitboxes) {
      if (isMouseInHitbox([mouseX, mouseY], hitbox)) {
        handleHitboxFound();
      }
    }
  }

  function handleHitboxFound() {
    const timestampFound = new Date();

    const elapsedSeconds = dayjs(timestampFound).diff(
      timestampStarted,
      "second"
    );

    const score = calculateScoreFromSeconds(elapsedSeconds);

    alert(
      `You found it! It took you ${getSecondsFormatted(
        elapsedSeconds
      )}. You scored ${score} points.`
    );
  }

  function handleResize() {
    console.log("resize", {
      width: imageRef.current.width,
      height: imageRef.current.height,
    });

    setCurrentSize({
      width: imageRef.current.width,
      height: imageRef.current.height,
    });
  }

  useEffect(() => {
    // handleResize();

    setTimeout(() => {
      setIsDateVisible(true);
    }, 1);

    setTimeout(() => {
      setIsDescriptionVisible(true);
    }, 1000);

    setTimeout(() => {
      setIsStartVisible(true);
    }, 2000);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
      <main className="bg-white font-incosolata">
        <div className="py-24 px-6 sm:px-6 sm:py-32 lg:px-8">
          <div
            ref={animationParentRef}
            className="mx-auto max-w-2xl text-center"
          >
            {isDateVisible && (
              <p
                className={`${
                  !hasStarted ? "text-lg" : "text-xs"
                } mx-auto mt-6 text-center leading-8 text-gray-600 transition-all duration-700 `}
              >
                {dayjs(picture.scheduledFor).format("dddd, MMMM D, YYYY")}
              </p>
            )}

            {isDescriptionVisible && (
              <h2
                className={`${
                  !hasStarted ? "sm:text-4x text-3xl" : "text-sm"
                } text-center tracking-tight text-gray-900 transition-all duration-700 `}
              >
                {picture.description}
              </h2>
            )}

            {isStartVisible && !hasStarted && (
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  type="button"
                  className="animate-pulse rounded-full bg-white py-2.5 px-10 text-lg font-light text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={handleStart}
                >
                  Start
                </button>
              </div>
            )}

            {hasStarted && (
              <div className="mt-4 block rounded-lg bg-white shadow-xl transition-all duration-700 dark:bg-neutral-700">
                <a href="#!" data-te-ripple-init data-te-ripple-color="light">
                  <Image
                    ref={imageRef}
                    className="w-full rounded-xl"
                    src={pictureUrl}
                    alt={picture.description}
                    width={picture.width}
                    height={picture.height}
                    onClick={handleImageClicked}
                  />
                </a>
              </div>
            )}

            {/* <div className="max-w-sm overflow-hidden rounded shadow-lg">
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-2xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Start
              </a>
            </div> */}

            {/* <div className="flex flex-wrap justify-center">
              <div>
                <img
                  alt="Picture of the day"
                  src={pictureUrl}
                  className="h-auto max-w-sm rounded-lg shadow-none transition-shadow duration-300 ease-in-out hover:shadow-lg hover:shadow-black/30"
                />
              </div>
            </div> */}
            {/* <img
              alt="Picture of the day"
              src={pictureUrl}
              width={400}
              height={400}
            /> */}
          </div>
        </div>
      </main>
    </>
  );
};

const maxScore = 5000;
const minScore = 100;

const scoringTiers = [
  {
    range: [0, 15],
    lossPer: 0,
  },
  {
    range: [15, 75],
    lossPer: -50,
  },
  {
    range: [75, 120],
    lossPer: -25,
  },
  {
    range: [120, 150],
    lossPer: -10,
  },
  {
    range: [150, 165],
    lossPer: -5,
  },
  {
    range: [165, Infinity],
    lossPer: -1,
  },
];

function getRelativeHitbox(
  hitbox: Hitbox,
  widthScaleFactor: number,
  heightScaleFactor: number
): Hitbox {
  const [topLeftX, topLeftY] = hitbox.topLeft;
  const [bottomRightX, bottomRightY] = hitbox.bottomRight;

  return {
    ...hitbox,
    topLeft: [topLeftX * widthScaleFactor, topLeftY * heightScaleFactor],
    bottomRight: [
      bottomRightX * widthScaleFactor,
      bottomRightY * widthScaleFactor,
    ],
  };
}

function isMouseInHitbox(
  [mouseX, mouseY]: [number, number],
  {
    topLeft: [topLeftX, topLeftY],
    bottomRight: [bottomRightX, bottomRightY],
  }: Hitbox
) {
  if (
    mouseX >= topLeftX &&
    mouseY >= topLeftY &&
    mouseX <= bottomRightX &&
    mouseY <= bottomRightY
  ) {
    return true;
  }
}

function calculateScoreFromSeconds(seconds) {
  let score = maxScore;

  for (const tier of scoringTiers) {
    const [rangeStart, rangeEnd] = tier.range;

    // Score falls within the last tier
    if (seconds > rangeStart && rangeEnd === Infinity) {
      score += (seconds - rangeStart) * tier.lossPer;

      // Some pity points for trying :)
      return score < minScore ? minScore : score;
    }

    // Score falls within this tier
    if (seconds > rangeStart && seconds <= rangeEnd) {
      return score + (seconds - rangeStart) * tier.lossPer;
    }

    // Otherwise score falls in a lower tier. Take the entire penalty of this tier.
    score += (rangeEnd - rangeStart) * tier.lossPer;
  }

  return score;
}

function getSecondsFormatted(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const minutesFormatted = minutes ? `${minutes} min ` : "";
  const secondsFormatted = `${seconds % 6} sec`;

  return minutesFormatted + secondsFormatted;
}

export default Home;
