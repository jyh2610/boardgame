"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AvalonMultiplayerProvider,
  useAvalonMultiplayer,
} from "@/lib/avalon-multiplayer-context";
import { fetchSlots, claimPlayer, createGame } from "@/lib/avalon-api";
import { QuestTrack } from "@/components/avalon/QuestTrack";
import { RejectCount } from "@/components/avalon/RejectCount";
import { BoardStatus } from "@/components/avalon/BoardStatus";
import { PlayerList } from "@/components/avalon/PlayerList";
import { PhaseLobby } from "@/components/avalon/PhaseLobby";
import { PhaseNight } from "@/components/avalon/PhaseNight";
import { PhaseTeamBuilding } from "@/components/avalon/PhaseTeamBuilding";
import { PhaseVoting } from "@/components/avalon/PhaseVoting";
import { PhaseQuesting } from "@/components/avalon/PhaseQuesting";
import { PhaseAssassination } from "@/components/avalon/PhaseAssassination";
import { PhaseEnd } from "@/components/avalon/PhaseEnd";
import { GameChat } from "@/components/avalon/GameChat";
import { Rulebook } from "@/components/avalon/Rulebook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Sword } from "lucide-react";

function PlayerPicker({
  gameId,
  onPick,
}: {
  gameId: string;
  onPick: (playerId: string) => void;
}) {
  const router = useRouter();
  const [slots, setSlots] = useState<
    { id: string; name: string; isTaken: boolean }[]
  >([]);
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchSlots(gameId);
        if (!cancelled) {
          setSlots(data.slots);
          setIsFull(data.isFull);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "로드 실패");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  useEffect(() => {
    if (selectedId) {
      const slot = slots.find((s) => s.id === selectedId);
      setDisplayName(slot?.name ?? "");
    }
  }, [selectedId, slots]);

  useEffect(() => {
    if (isFull && !loading) {
      alert("방이 가득 찼습니다. 로비로 이동합니다.");
      router.replace("/resistans_avalon");
    }
  }, [isFull, loading, router]);

  const handleEnter = async () => {
    if (!selectedId || claiming) return;
    const slotName = slots.find((s) => s.id === selectedId)?.name;
    const trimmed = (displayName.trim() || slotName) ?? "플레이어";
    setClaiming(true);
    try {
      await claimPlayer(gameId, selectedId, trimmed);
      onPick(selectedId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "입장 실패";
      alert(msg);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">게임 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 p-6">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/resistans_avalon")}
        >
          로비로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold mb-4">플레이어 선택</h2>
        <p className="text-sm text-muted-foreground mb-4">
          당신의 캐릭터를 선택하고 이름을 입력하세요.
        </p>
        <div className="flex flex-col gap-2 mb-4">
          {slots.map((p) => (
            <button
              key={p.id}
              onClick={() => !p.isTaken && setSelectedId(p.id)}
              disabled={p.isTaken}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                p.isTaken
                  ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                  : selectedId === p.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <div className="size-10 rounded-full flex items-center justify-center text-lg font-bold border-2 border-border bg-muted">
                {p.name.charAt(0)}
              </div>
              <span className="font-bold">{p.name}</span>
              {p.isTaken && (
                <span className="ml-auto text-xs text-muted-foreground">
                  선택됨
                </span>
              )}
            </button>
          ))}
        </div>
        {selectedId && (
          <div className="space-y-2">
            <label className="text-sm font-medium">이름</label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full"
            />
            <Button
              className="w-full"
              onClick={handleEnter}
              disabled={claiming}
            >
              {claiming ? "입장 중..." : "입장하기"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const gameId = params.gameId as string;
  const mp = useAvalonMultiplayer();
  const playerId = searchParams.get("p") ?? "";

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
        <Button
          variant="outline"
          onClick={() => router.push("/resistans_avalon")}
        >
          로비로 돌아가기
        </Button>
      </div>
    );
  }

  return <AvalonGameInner gameId={gameId} playerId={playerId} />;
}

const CHAT_API = "/api/avalon/games";

function AvalonGameInner({
  gameId,
  playerId,
}: {
  gameId: string;
  playerId: string;
}) {
  const router = useRouter();
  const mp = useAvalonMultiplayer();
  const state = mp?.state;
  const [copied, setCopied] = useState(false);
  const joinNotifiedRef = useRef(false);

  // 유저 접속 시 채팅에 접속 알림 전송 (최초 1회)
  useEffect(() => {
    if (!state || !playerId || joinNotifiedRef.current) return;
    const playerName =
      state.players.find((p) => p.id === playerId)?.name ?? "플레이어";
    joinNotifiedRef.current = true;
    fetch(`${CHAT_API}/${gameId}/chat/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, playerName }),
    }).catch(() => {});
  }, [gameId, playerId, state]);

  if (!state || !mp) return null;

  const copyCode = () => {
    if (mp.roomCode && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(mp.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const questSize = state.config.questSizes[state.currentRound - 1] ?? 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm z-40">
        <div className="flex items-center gap-2">
          <Sword className="size-6 text-primary" />
          <h1 className="text-lg font-black text-primary tracking-widest">
            아발론
          </h1>
          {mp.roomCode && (
            <button
              onClick={copyCode}
              className="text-xs font-mono bg-muted px-2 py-1 rounded-lg hover:bg-muted/80 transition-colors"
              title="방 코드 복사"
            >
              {mp.roomCode} {copied ? "✓" : "📋"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <QuestTrack
            questTrack={state.questTrack}
            currentRound={state.currentRound}
            questSizes={state.config.questSizes}
          />
          <RejectCount rejectTrack={state.rejectTrack} phase={state.phase} />
        </div>

        <button
          onClick={() => router.push("/resistans_avalon")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
        >
          <RotateCcw size={13} />
          나가기
        </button>
      </header>

      <BoardStatus players={state.players} proposedTeam={state.proposedTeam} />

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-auto min-h-0">
        <aside className="lg:w-64 shrink-0">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">플레이어</h3>
              <Rulebook playerRole={state.playerRole ?? null} compact />
            </div>
            <PlayerList
              players={state.players}
              proposedTeam={state.proposedTeam}
              currentPlayerId={playerId}
            />
          </div>
        </aside>

        <section className="flex-1 flex items-start justify-center overflow-auto py-4 min-w-0">
          <div className="w-full max-w-2xl">
            {state.phase === "LOBBY" && (
              <PhaseLobby
                players={state.players}
                connectedPlayerIds={state.connectedPlayerIds ?? []}
                readyPlayerIds={state.readyPlayerIds ?? []}
                playerId={playerId}
                onReady={() => mp.act({ action: "ready" })}
                isActing={mp.isActing}
              />
            )}

            {state.phase === "NIGHT" && state.nightVision && (
              <PhaseNight
                nightVision={state.nightVision}
                players={state.players}
                onFinish={() => mp.act({ action: "finishNight" })}
                isActing={mp.isActing}
              />
            )}

            {state.phase === "TEAM_BUILDING" && (
              <PhaseTeamBuilding
                players={state.players}
                proposedTeam={state.proposedTeam}
                questSize={questSize}
                playerId={playerId}
                canProposeTeam={state.canProposeTeam}
                onPropose={(ids) =>
                  mp.act({
                    action: "proposeTeam",
                    payload: { teamMemberIds: ids },
                  })
                }
                isActing={mp.isActing}
              />
            )}

            {state.phase === "VOTING" && (
              <PhaseVoting
                players={state.players}
                proposedTeam={state.proposedTeam}
                canVote={state.canVote}
                hasVoted={state.hasVoted}
                onVote={(vote) => mp.act({ action: "vote", payload: { vote } })}
                isActing={mp.isActing}
              />
            )}

            {state.phase === "QUESTING" && (
              <PhaseQuesting
                players={state.players}
                proposedTeam={state.proposedTeam}
                playerId={playerId}
                onSubmitCard={(card) =>
                  mp.act({ action: "questCard", payload: { card } })
                }
                isActing={mp.isActing}
              />
            )}

            {state.phase === "ASSASSINATION" && (
              <PhaseAssassination
                players={state.players}
                playerId={playerId}
                canAssassinate={state.canAssassinate}
                onAssassinate={(targetId) =>
                  mp.act({ action: "assassination", payload: { targetId } })
                }
                isActing={mp.isActing}
              />
            )}

            {state.phase === "END" && state.winner && (
              <PhaseEnd
                winner={state.winner}
                playerId={playerId}
                myTeam={state.nightVision?.myTeam}
                players={state.players}
                onRestart={async () => {
                  const { gameId: newGameId } = await createGame(
                    state.config.playerCount,
                    state.players.map((p) => p.name),
                  );
                  router.push(`/resistans_avalon/${newGameId}?p=${playerId}`);
                }}
              />
            )}

            {state.phase !== "LOBBY" &&
              state.phase !== "NIGHT" &&
              state.phase !== "TEAM_BUILDING" &&
              state.phase !== "VOTING" &&
              state.phase !== "QUESTING" &&
              state.phase !== "ASSASSINATION" &&
              state.phase !== "END" && (
                <div className="text-center text-muted-foreground py-12">
                  대기 중...
                </div>
              )}
          </div>
        </section>

        <aside className="lg:w-72 shrink-0 w-full lg:max-w-[288px]">
          <GameChat
            gameId={gameId}
            playerId={playerId}
            playerName={
              state.players.find((p) => p.id === playerId)?.name ?? "플레이어"
            }
            className="h-[320px] lg:h-[400px]"
          />
        </aside>
      </main>
    </div>
  );
}

export default function AvalonGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const playerIdParam = searchParams.get("p");

  if (!gameId) return null;

  // ?p= 없으면 플레이어 선택 화면 (Provider 없이)
  if (!playerIdParam || playerIdParam === "") {
    return (
      <PlayerPicker
        gameId={gameId}
        onPick={(id) => router.replace(`/resistans_avalon/${gameId}?p=${id}`)}
      />
    );
  }

  return (
    <AvalonMultiplayerProvider gameId={gameId} playerId={playerIdParam}>
      <GameContent />
    </AvalonMultiplayerProvider>
  );
}
