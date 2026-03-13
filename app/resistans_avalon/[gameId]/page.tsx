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
import { VoteResultBanner } from "@/components/avalon/VoteResultBanner";
import { GameChat } from "@/components/avalon/GameChat";
import { AvalonGameLog } from "@/components/avalon/AvalonGameLog";
import { Rulebook } from "@/components/avalon/Rulebook";
import { NightVisionSummary } from "@/components/avalon/NightVisionSummary";
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
      <header className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 px-3 sm:px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm z-40">
        <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Sword className="size-5 sm:size-6 text-primary shrink-0" />
            <h1 className="text-base sm:text-lg font-black text-primary tracking-widest truncate">
              조선비사
            </h1>
            {mp.roomCode && (
              <button
                onClick={copyCode}
                className="text-[10px] sm:text-xs font-mono bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg hover:bg-muted/80 transition-colors shrink-0"
                title="방 코드 복사"
              >
                {mp.roomCode} {copied ? "✓" : "📋"}
              </button>
            )}
          </div>
          <button
            onClick={() => router.push("/resistans_avalon")}
            className="flex sm:hidden items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted shrink-0"
          >
            <RotateCcw size={13} />
            나가기
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 min-w-0">
          <QuestTrack
            questTrack={state.questTrack}
            currentRound={state.currentRound}
            questSizes={state.config.questSizes}
          />
          <RejectCount rejectTrack={state.rejectTrack} phase={state.phase} />
          <button
            onClick={() => router.push("/resistans_avalon")}
            className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted shrink-0"
          >
            <RotateCcw size={13} />
            나가기
          </button>
        </div>
      </header>

      <BoardStatus players={state.players} proposedTeam={state.proposedTeam} />

      <main className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 overflow-auto min-h-0">
        <aside className="lg:w-64 shrink-0 order-2 lg:order-none">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">플레이어</h3>
              <div className="flex items-center gap-1.5">
                {state.nightVision && (
                  <NightVisionSummary
                    nightVision={state.nightVision}
                    players={state.players}
                  />
                )}
                <Rulebook playerRole={state.playerRole ?? null} compact />
              </div>
            </div>
            <PlayerList
              players={state.players}
              proposedTeam={state.proposedTeam}
              currentPlayerId={playerId}
            />
          </div>
        </aside>

        <section className="flex-1 flex items-start justify-center overflow-auto py-3 sm:py-4 min-w-0 order-1 lg:order-none">
          <div className="w-full max-w-2xl">
            {state.lastVoteResult &&
              (state.phase === "SIMYANG" ||
                state.phase === "SIMYANGDAN_SETUP") && (
                <VoteResultBanner
                  approveCount={state.lastVoteResult.approveCount}
                  rejectCount={state.lastVoteResult.rejectCount}
                  passed={state.lastVoteResult.passed}
                />
              )}
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
                nightConfirmPlayerIds={state.nightConfirmPlayerIds ?? []}
                playerId={playerId}
                onConfirm={() => mp.act({ action: "confirmNight" })}
                isActing={mp.isActing}
              />
            )}

            {state.phase === "SIMYANGDAN_SETUP" && (
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
                lastVoteResult={state.lastVoteResult}
              />
            )}

            {state.phase === "SIMYANG" && (
              <PhaseQuesting
                players={state.players}
                proposedTeam={state.proposedTeam}
                playerId={playerId}
                hasSubmittedQuestCard={state.hasSubmittedQuestCard}
                onSubmitCard={(card) =>
                  mp.act({ action: "questCard", payload: { card } })
                }
                isActing={mp.isActing}
              />
            )}

            {state.phase === "JAGAP_PHASE" && (
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
                assassinationTarget={state.assassinationTarget}
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
              state.phase !== "SIMYANGDAN_SETUP" &&
              state.phase !== "VOTING" &&
              state.phase !== "SIMYANG" &&
              state.phase !== "JAGAP_PHASE" &&
              state.phase !== "END" && (
                <div className="text-center text-muted-foreground py-12">
                  대기 중...
                </div>
              )}
          </div>
        </section>

        <aside className="lg:w-72 shrink-0 w-full lg:max-w-[288px] flex flex-col gap-3 order-3 lg:order-none">
          <AvalonGameLog gameLog={state.gameLog ?? []} className="shrink-0" />
          <GameChat
            gameId={gameId}
            playerId={playerId}
            playerName={
              state.players.find((p) => p.id === playerId)?.name ?? "플레이어"
            }
            className="h-[200px] sm:h-[240px] lg:h-[340px] flex-1 min-h-0"
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
