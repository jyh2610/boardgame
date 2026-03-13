"use client";

import { useState } from "react";
import type { Role, Team } from "@/lib/avalon-engine";
import { ROLE_NAMES } from "@/lib/avalon-theme";
import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trophy, Swords, RotateCcw, Skull } from "lucide-react";

interface PhaseEndProps {
  winner: Team;
  playerId: string;
  myTeam?: Team;
  players?: AvalonPlayerPublic[];
  assassinationTarget?: string | null;
  onRestart?: () => Promise<void>;
}

export function PhaseEnd({
  winner,
  playerId,
  myTeam,
  players,
  assassinationTarget,
  onRestart,
}: PhaseEndProps) {
  const router = useRouter();
  const [isRestarting, setIsRestarting] = useState(false);
  const isGoodWin = winner === "GOOD";
  const isMyWin = myTeam ? myTeam === winner : undefined;

  const targetPlayer = assassinationTarget
    ? players?.find((p) => p.id === assassinationTarget)
    : null;

  const handleRestart = async () => {
    if (!onRestart || isRestarting) return;
    setIsRestarting(true);
    try {
      await onRestart();
    } catch (e) {
      alert(e instanceof Error ? e.message : "다시 시작 실패");
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-center gap-2">
          {isGoodWin ? (
            <Trophy className="size-12 text-primary" />
          ) : (
            <Swords className="size-12 text-destructive" />
          )}
          <CardTitle className="text-2xl">
            {isGoodWin ? "규장각의 승리!" : "노론 벽파의 승리!"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isMyWin !== undefined && (
          <p className="text-center text-lg font-medium">
            {isMyWin ? "🎉 당신의 승리입니다!" : "😢 패배했습니다."}
          </p>
        )}

        {assassinationTarget && targetPlayer && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Skull className="size-4 text-destructive" />
              존현각 자객이 지목한 플레이어
            </h3>
            <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-md bg-background border border-border">
              <span className="font-medium">{targetPlayer.name}</span>
              {targetPlayer.role != null ? (
                <span
                  className={`text-sm font-semibold ${
                    targetPlayer.team === "GOOD"
                      ? "text-primary"
                      : "text-destructive"
                  }`}
                >
                  {ROLE_NAMES[targetPlayer.role]}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
          </div>
        )}

        {players && players.some((p) => p.role != null) && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold mb-3">모든 참가자 역할</h3>
            <div className="space-y-2">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-md bg-background border border-border"
                >
                  <span className="font-medium">{p.name}</span>
                  {p.role != null ? (
                    <span
                      className={`text-sm font-semibold ${
                        p.team === "GOOD" ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {ROLE_NAMES[p.role]}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {onRestart && (
            <Button
              className="w-full"
              size="lg"
              onClick={handleRestart}
              disabled={isRestarting}
            >
              <RotateCcw className="size-4 mr-2" />
              {isRestarting ? "생성 중..." : "다시 시작하기"}
            </Button>
          )}
          <Button
            className="w-full"
            size="lg"
            variant="outline"
            onClick={() => router.push("/resistans_avalon")}
          >
            로비로 돌아가기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
