import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { PlayerStateProvider } from "~/context/player";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <PlayerStateProvider>
        <Component {...pageProps} />
      </PlayerStateProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
