"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  MultiplayerGameProvider,
  useMultiplayerGame,
} from "@/lib/multiplayer-context";
import GameBoard from "@/components/game/GameBoard";
import DiceControl from "@/components/game/DiceControl";
import PlayerStatus from "@/components/game/PlayerStatus";
import GameLog from "@/components/game/GameLog";
import GameModal from "@/components/game/GameModal";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const PLAYER_STORAGE_KEY = "burumabul_player";

function getStoredPlayerId(gameId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, number>;
    return data[gameId] ?? null;
  } catch {
    return null;
  }
}

function setStoredPlayerId(gameId: string, playerId: number) {
  try {
    const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
    const data = (raw ? JSON.parse(raw) : {}) as Record<string, number>;
    data[gameId] = playerId;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function GameContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.gameId as string;
  const mp = useMultiplayerGame();
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);

  const playerIdParam = searchParams.get("p");
  const storedPlayerId = getStoredPlayerId(gameId);
  const playerId =
    playerIdParam !== null ? parseInt(playerIdParam, 10) : storedPlayerId;

  useEffect(() => {
    if (playerId !== null && !isNaN(playerId) && playerId >= 0) {
      setStoredPlayerId(gameId, playerId);
      setShowPlayerPicker(false);
    } else if (mp?.state && !mp.isLoading) {
      setShowPlayerPicker(true);
    }
  }, [gameId, playerId, mp?.state, mp?.isLoading]);

  const handlePickPlayer = useCallback(
    (id: number) => {
      setStoredPlayerId(gameId, id);
      router.replace(`/game/${gameId}?p=${id}`);
      setShowPlayerPicker(false);
    },
    [gameId, router],
  );

  if (!mp) return null;

  if (mp.isLoading && !mp.state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">게임 로딩 중...</div>
      </div>
    );
  }

  if (mp.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 p-6">
        <p className="text-destructive">{mp.error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold"
        >
          홈으로
        </button>
      </div>
    );
  }

  if (showPlayerPicker && mp.state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full">
          <h2 className="text-lg font-bold mb-4">플레이어 선택</h2>
          <p className="text-sm text-muted-foreground mb-4">
            당신의 캐릭터를 선택하세요.
          </p>
          <div className="flex flex-col gap-2">
            {mp.state.players.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePickPlayer(p.id)}
                className="flex items-center gap-3 p-3 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-lg"
                  style={{ backgroundColor: p.color }}
                >
                  {p.icon}
                </div>
                <span className="font-bold">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (playerId === null || isNaN(playerId) || playerId < 0) {
    return null;
  }

  return <GameInner gameId={gameId} playerId={playerId} />;
}

function GameInner({ gameId, playerId }: { gameId: string; playerId: number }) {
  const router = useRouter();
  const mp = useMultiplayerGame();
  const state = mp?.state;
  const [copied, setCopied] = React.useState(false);

  if (!state) return null;

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isHost = playerId === 0;

  const copyCode = () => {
    if (mp?.roomCode && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(mp.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <h1 className="text-lg font-black text-primary tracking-widest">
            부루마블
          </h1>
          {isHost && mp?.roomCode && (
            <button
              onClick={copyCode}
              className="text-xs font-mono bg-muted px-2 py-1 rounded-lg hover:bg-muted/80 transition-colors"
              title="방 코드 복사"
            >
              {mp.roomCode} {copied ? "✓" : "📋"}
            </button>
          )}
        </div>

        {currentPlayer && (
          <motion.div
            key={state.currentPlayerIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full"
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-sm shadow-sm"
              style={{ backgroundColor: currentPlayer.color }}
            >
              {currentPlayer.icon}
            </div>
            <span className="text-sm font-bold text-primary">
              {currentPlayer.name}의 차례
            </span>
          </motion.div>
        )}

        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
        >
          <RotateCcw size={13} />
          나가기
        </button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-3 p-3 overflow-auto min-h-0">
        <aside className="lg:w-56 xl:w-64 shrink-0 flex flex-col gap-3 lg:overflow-y-auto">
          <PlayerStatus />
        </aside>
        <section className="flex-1 flex items-start justify-center overflow-auto">
          <div className="overflow-auto">
            <GameBoard />
          </div>
        </section>
        <aside className="lg:w-52 xl:w-60 shrink-0 flex flex-col gap-3">
          <DiceControl />
          <GameLog />
        </aside>
      </main>
      <GameModal />
    </div>
  );
}

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.gameId as string;
  const playerIdParam = searchParams.get("p");
  const playerId = playerIdParam !== null ? parseInt(playerIdParam, 10) : 0;

  if (!gameId) {
    return null;
  }

  return (
    <MultiplayerGameProvider
      gameId={gameId}
      playerId={isNaN(playerId) ? 0 : Math.max(0, playerId)}
    >
      <GameContent />
    </MultiplayerGameProvider>
  );
}
