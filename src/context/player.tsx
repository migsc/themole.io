import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  type PropsWithChildren,
} from "react";
import type { PlayerState } from "~/types";
import useLocalStorage from "~/hooks/useLocalStorage";

const defaultPlayerState: PlayerState = {
  score: 0,
  streak: 0,
  solveCount: 0,
  attemptCount: 0,
};

const PlayerStateContext = createContext<
  [PlayerState, Dispatch<SetStateAction<PlayerState>>]
>([
  defaultPlayerState,
  (value) => {
    console.log(
      "Called default PlayerStateContext dispatch function that doesn't do anything. But here's the value:",
      value
    );
  },
]);

export function PlayerStateProvider({ children }: PropsWithChildren) {
  const value = useLocalStorage<PlayerState>("player", defaultPlayerState);

  return (
    <PlayerStateContext.Provider value={value}>
      {children}
    </PlayerStateContext.Provider>
  );
}

export function usePlayerState() {
  const value = useContext(PlayerStateContext);

  if (!value) {
    throw new Error("usePlayerState must be used within a PlayerStateProvider");
  }

  return value;
}
