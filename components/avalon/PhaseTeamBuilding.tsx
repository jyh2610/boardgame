"use client";

import { useState } from "react";
import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerList } from "./PlayerList";
import { ProposedTeam } from "./ProposedTeam";
import { Users } from "lucide-react";

interface PhaseTeamBuildingProps {
  players: AvalonPlayerPublic[];
  proposedTeam: string[];
  questSize: number;
  playerId: string;
  canProposeTeam: boolean;
  onPropose: (teamMemberIds: string[]) => Promise<void>;
  isActing: boolean;
}

export function PhaseTeamBuilding({
  players,
  proposedTeam,
  questSize,
  playerId,
  canProposeTeam,
  onPropose,
  isActing,
}: PhaseTeamBuildingProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < questSize) {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size === questSize) {
      onPropose(Array.from(selected));
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="size-6 text-primary" />
          <CardTitle>원정대 구성</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          {questSize}명을 선택하여 원정대를 구성하세요.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProposedTeam proposedTeam={proposedTeam} players={players} />

        {proposedTeam.length === 0 && canProposeTeam && (
          <>
            <PlayerList
              players={players}
              proposedTeam={[]}
              currentPlayerId={playerId}
              highlightIds={Array.from(selected)}
              onSelect={toggle}
              selectable
            />
            <div className="text-sm text-muted-foreground">
              선택: {selected.size} / {questSize}명
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={selected.size !== questSize || isActing}
            >
              {isActing ? "제안 중..." : "원정대 제안"}
            </Button>
          </>
        )}

        {(proposedTeam.length > 0 || !canProposeTeam) && (
          <p className="text-sm text-muted-foreground text-center">
            {proposedTeam.length > 0
              ? "원정대가 제안되었습니다. 모든 플레이어의 투표를 기다리는 중..."
              : "원정대장이 원정대를 구성하는 중..."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
