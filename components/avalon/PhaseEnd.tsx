"use client";

import { useState } from "react";
import type { Team } from "@/lib/avalon-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trophy, Swords, RotateCcw } from "lucide-react";

interface PhaseEndProps {
  winner: Team;
  playerId: string;
  myTeam?: Team;
  onRestart?: () => Promise<void>;
}

export function PhaseEnd({
  winner,
  playerId,
  myTeam,
  onRestart,
}: PhaseEndProps) {
  const router = useRouter();
  const [isRestarting, setIsRestarting] = useState(false);
  const isGoodWin = winner === "GOOD";
  const isMyWin = myTeam ? myTeam === winner : undefined;

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
            {isGoodWin ? "선의 승리!" : "악의 승리!"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isMyWin !== undefined && (
          <p className="text-center text-lg font-medium">
            {isMyWin ? "🎉 당신의 승리입니다!" : "😢 패배했습니다."}
          </p>
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
