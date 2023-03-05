import { type NextPage } from "next";
import Head from "next/head";
import { usePlayerState } from "~/context/player";

const Home: NextPage = () => {
  const [player] = usePlayerState();

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
          <pre className="text-white">{JSON.stringify({ player })}</pre>
        </div>
      </main>
    </>
  );
};

export default Home;
