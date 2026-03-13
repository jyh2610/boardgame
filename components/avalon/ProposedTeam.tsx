"use client";

import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { Sword } from "lucide-react";

interface ProposedTeamProps {
  proposedTeam: string[];
  players: AvalonPlayerPublic[];
}

export function ProposedTeam({ proposedTeam, players }: ProposedTeamProps) {
  const playerMap = new Map(players.map((p) => [p.id, p]));

  if (proposedTeam.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        아직 사명단이 구성되지 않았습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {proposedTeam.map((id) => {
        const p = playerMap.get(id);
        return (
          <div
            key={id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30"
          >
            <Sword className="size-4 text-primary" />
            <span className="font-medium">{p?.name ?? id}</span>
          </div>
        );
      })}
    </div>
  );
}
