"use client";

import type { NightVision } from "@/lib/avalon-engine";
import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon } from "lucide-react";

const ROLE_NAMES: Record<string, string> = {
  MERLIN: "멀린",
  PERCIVAL: "퍼시벌",
  LOYAL: "충직한 시민",
  ASSASSIN: "암살자",
  MORGANNA: "모르가나",
  MORDRED: "모드레드",
  OBERON: "오베론",
  MINION: "악의 하수인",
};

interface PhaseNightProps {
  nightVision: NightVision;
  players: AvalonPlayerPublic[];
  onFinish: () => Promise<void>;
  isActing: boolean;
}

function idToName(players: AvalonPlayerPublic[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? `플레이어 ${id}`;
}

export function PhaseNight({
  nightVision,
  players,
  onFinish,
  isActing,
}: PhaseNightProps) {
  const {
    myRole,
    myTeam,
    knownEvil,
    knownMerlinCandidates,
    knownEvilTeammates,
  } = nightVision;

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Moon className="size-6 text-primary" />
          <CardTitle>밤 - 역할 확인</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">당신의 역할</p>
          <p className="text-2xl font-bold text-primary">
            {ROLE_NAMES[myRole] ?? myRole}
          </p>
          <p className="text-sm text-muted-foreground">
            {myTeam === "GOOD" ? "선의 세력" : "악의 세력"}
          </p>
        </div>

        {knownEvil.length > 0 && (
          <div className="space-y-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm font-medium text-destructive">
              악으로 알려진 플레이어
            </p>
            <ul className="text-sm list-disc list-inside">
              {knownEvil.map((id) => (
                <li key={id}>{idToName(players, id)}</li>
              ))}
            </ul>
          </div>
        )}

        {knownMerlinCandidates.length > 0 && (
          <div className="space-y-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm font-medium text-primary">
              멀린 후보 (멀린 또는 모르가나)
            </p>
            <ul className="text-sm list-disc list-inside">
              {knownMerlinCandidates.map((id) => (
                <li key={id}>{idToName(players, id)}</li>
              ))}
            </ul>
          </div>
        )}

        {knownEvilTeammates.length > 0 && (
          <div className="space-y-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm font-medium text-destructive">악의 동료</p>
            <ul className="text-sm list-disc list-inside">
              {knownEvilTeammates.map((id) => (
                <li key={id}>{idToName(players, id)}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={onFinish}
          disabled={isActing}
        >
          {isActing ? "확인 중..." : "확인 완료"}
        </Button>
      </CardContent>
    </Card>
  );
}
