"use client";

import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { TERMS } from "@/lib/avalon-theme";
import { Crown, Sword } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardStatusProps {
  players: AvalonPlayerPublic[];
  proposedTeam: string[];
}

export function BoardStatus({ players, proposedTeam }: BoardStatusProps) {
  const leader = players.find((p) => p.isLeader);
  const proposedSet = new Set(proposedTeam);
  const proposedPlayers = players.filter((p) => proposedSet.has(p.id));

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 px-3 py-2 border-b border-border bg-muted/30">
      {/* 사명장 토큰 (왕관) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/20 border-2 border-amber-500/50">
          <Crown className="size-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {TERMS.missionLeader}
          </span>
          <span className="text-sm font-bold">
            {leader ? leader.name : "—"}
          </span>
        </div>
      </div>

      {/* 구분선 */}
      <div className="hidden sm:block w-px h-8 bg-border" />

      {/* 사명단 마커 - 지목된 플레이어들 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/20 border-2 border-primary/40">
          <Sword className="size-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {TERMS.missionTeam}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {proposedPlayers.length > 0 ? (
              proposedPlayers.map((p) => (
                <span
                  key={p.id}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold",
                    "bg-primary/15 border border-primary/40 text-primary"
                  )}
                >
                  {p.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">미구성</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
