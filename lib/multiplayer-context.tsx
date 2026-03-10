"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { GameState } from "./game-engine";
import { fetchGame, dispatchAction, type GameAction } from "./game-api";

const POLL_INTERVAL = 2000;

interface MultiplayerContextValue {
  gameId: string;
  playerId: number;
  roomCode: string | null;
  state: GameState | null;
  error: string | null;
  isLoading: boolean;
  isMyTurn: boolean;
  setState: (
    partial: Partial<GameState> | ((s: GameState) => Partial<GameState>),
  ) => void;
  act: (a: GameAction) => Promise<void>;
  refresh: () => Promise<void>;
}

const MultiplayerContext = createContext<MultiplayerContextValue | null>(null);

export function MultiplayerGameProvider({
  gameId,
  playerId,
  children,
}: {
  gameId: string;
  playerId: number;
  children: ReactNode;
}) {
  const [state, setStateInternal] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchGame(gameId);
      setStateInternal(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "로드 실패");
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    refresh();

    pollRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refresh]);

  const setState = useCallback(
    (partial: Partial<GameState> | ((s: GameState) => Partial<GameState>)) => {
      setStateInternal((prev) => {
        if (!prev) return prev;
        const next = typeof partial === "function" ? partial(prev) : partial;
        return { ...prev, ...next };
      });
    },
    [],
  );

  const act = useCallback(
    async (a: GameAction) => {
      if (!state) return;
      try {
        const next = await dispatchAction(gameId, playerId, a);
        setStateInternal(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : "액션 실패");
      }
    },
    [gameId, playerId, state],
  );

  const currentPlayerId = state?.players[state.currentPlayerIndex]?.id ?? -1;
  const isMyTurn =
    currentPlayerId === playerId &&
    !state?.players[state.currentPlayerIndex]?.isBankrupt;

  const roomCode =
    (state as GameState & { roomCode?: string })?.roomCode ?? null;

  const value: MultiplayerContextValue = {
    gameId,
    playerId,
    roomCode,
    state,
    error,
    isLoading,
    isMyTurn,
    setState,
    act,
    refresh,
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayerGame() {
  const ctx = useContext(MultiplayerContext);
  return ctx;
}
