"use client";

import { useState } from "react";
import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerList } from "./PlayerList";
import { Skull } from "lucide-react";

interface PhaseAssassinationProps {
  players: AvalonPlayerPublic[];
  playerId: string;
  canAssassinate: boolean;
  onAssassinate: (targetId: string) => Promise<void>;
  isActing: boolean;
}

export function PhaseAssassination({
  players,
  playerId,
  canAssassinate,
  onAssassinate,
  isActing,
}: PhaseAssassinationProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skull className="size-6 text-destructive" />
          <CardTitle>암살 단계</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          규장각이 승리했습니다. 존현각 자객이 정조를 지목하면 노론 벽파의
          승리입니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {canAssassinate ? (
          <>
            <p className="text-sm font-medium">
              정조로 의심되는 플레이어를 선택하세요.
            </p>

            <PlayerList
              players={players}
              proposedTeam={[]}
              currentPlayerId={playerId}
              highlightIds={selected ? [selected] : []}
              onSelect={setSelected}
              selectable
            />

            <Button
              className="w-full"
              size="lg"
              variant="destructive"
              onClick={() => selected && onAssassinate(selected)}
              disabled={!selected || isActing}
            >
              {isActing ? "지목 중..." : "정조 지목"}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            존현각 자객이 정조를 지목하는 중...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
