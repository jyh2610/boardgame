"use client";

import type { Team } from "@/lib/avalon-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trophy, Swords } from "lucide-react";

interface PhaseEndProps {
  winner: Team;
  playerId: string;
  myTeam?: Team;
}

export function PhaseEnd({ winner, playerId, myTeam }: PhaseEndProps) {
  const router = useRouter();
  const isGoodWin = winner === "GOOD";
  const isMyWin = myTeam ? myTeam === winner : undefined;

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

        <Button
          className="w-full"
          size="lg"
          variant="outline"
          onClick={() => router.push("/resistans_avalon")}
        >
          로비로 돌아가기
        </Button>
      </CardContent>
    </Card>
  );
}
