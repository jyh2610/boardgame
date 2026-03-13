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
import {
  fetchGame,
  dispatchAction,
  type AvalonAction,
  type AvalonGameStateForPlayer,
} from "./avalon-api";

const POLL_INTERVAL = 2000;

/** 항상 최신 playerId 사용 (클로저 스테일 방지) */
function usePlayerIdRef(playerId: string) {
  const ref = useRef(playerId);
  ref.current = playerId;
  return ref;
}

interface AvalonMultiplayerContextValue {
  gameId: string;
  playerId: string;
  roomCode: string | null;
  state: AvalonGameStateForPlayer | null;
  error: string | null;
  isLoading: boolean;
  isActing: boolean;
  act: (a: AvalonAction) => Promise<void>;
  refresh: () => Promise<void>;
}

const AvalonMultiplayerContext =
  createContext<AvalonMultiplayerContextValue | null>(null);

export function AvalonMultiplayerProvider({
  gameId,
  playerId,
  children,
}: {
  gameId: string;
  playerId: string;
  children: ReactNode;
}) {
  const playerIdRef = usePlayerIdRef(playerId);
  const [state, setState] = useState<AvalonGameStateForPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchGame(gameId, playerIdRef.current);
      setState(data as AvalonGameStateForPlayer);
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

  const act = useCallback(
    async (a: AvalonAction) => {
      if (!state || isActing) return;
      setIsActing(true);
      try {
        const pid = playerIdRef.current;
        await dispatchAction(gameId, pid, a);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "액션 실패");
      } finally {
        setIsActing(false);
      }
    },
    [gameId, state, isActing, refresh],
  );

  const roomCode = state?.roomCode ?? null;

  const value: AvalonMultiplayerContextValue = {
    gameId,
    playerId,
    roomCode,
    state,
    error,
    isLoading,
    isActing,
    act,
    refresh,
  };

  return (
    <AvalonMultiplayerContext.Provider value={value}>
      {children}
    </AvalonMultiplayerContext.Provider>
  );
}

export function useAvalonMultiplayer() {
  const ctx = useContext(AvalonMultiplayerContext);
  return ctx;
}
