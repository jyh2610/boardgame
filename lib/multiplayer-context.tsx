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

/** 항상 최신 playerId 사용 (클로저 스테일 방지) */
function usePlayerIdRef(playerId: number) {
  const ref = useRef(playerId);
  ref.current = playerId;
  return ref;
}

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
  const playerIdRef = usePlayerIdRef(playerId);
  const [state, setStateInternal] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
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
      if (!state || isActing) return;
      setIsActing(true);
      try {
        const pid = playerIdRef.current;
        const next = await dispatchAction(gameId, pid, a);
        setStateInternal(next);
        setError(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "액션 실패";
        // 403(차례 아님), phase 불일치(이동 완료 등)는 경쟁 상태로 인한 것일 수 있음 → 새로고침만 하고 에러 팝업 표시 안 함
        const isSoftError =
          msg.includes("차례") ||
          msg.includes("이동 완료할 수 없습니다") ||
          msg.includes("이동할 수 없습니다") ||
          msg.includes("굴릴 수 없습니다");
        if (isSoftError) {
          try {
            const fresh = await fetchGame(gameId);
            setStateInternal(fresh);
            setError(null);
          } catch {
            setError(msg);
          }
        } else {
          setError(msg);
        }
      } finally {
        setIsActing(false);
      }
    },
    [gameId, state, isActing],
  );

  const currentPlayerId = state?.players[state.currentPlayerIndex]?.id ?? -1;
  const isMyTurn =
    currentPlayerId === playerId &&
    !state?.players[state.currentPlayerIndex]?.isBankrupt &&
    !isActing;

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
