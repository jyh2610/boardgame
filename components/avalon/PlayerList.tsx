"use client";

import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { Crown, Sword } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerListProps {
  players: AvalonPlayerPublic[];
  proposedTeam: string[];
  currentPlayerId?: string;
  highlightIds?: string[];
  onSelect?: (playerId: string) => void;
  selectable?: boolean;
}

export function PlayerList({
  players,
  proposedTeam,
  currentPlayerId,
  highlightIds = [],
  onSelect,
  selectable = false,
}: PlayerListProps) {
  const proposedSet = new Set(proposedTeam);
  const highlightSet = new Set(highlightIds);

  return (
    <div className="flex flex-col gap-2">
      {players.map((p) => {
        const isOnQuest = proposedSet.has(p.id);
        const isMe = p.id === currentPlayerId;
        const isHighlighted = highlightSet.has(p.id);

        return (
          <div
            key={p.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-colors",
              isMe && "border-primary bg-primary/10",
              isOnQuest && "border-primary/50 bg-primary/5",
              isHighlighted && selectable && "hover:border-primary cursor-pointer",
              selectable && "cursor-pointer hover:bg-accent/50"
            )}
            onClick={() => selectable && onSelect?.(p.id)}
            role={selectable ? "button" : undefined}
          >
            <div
              className={cn(
                "size-10 rounded-full flex items-center justify-center text-lg font-bold border-2",
                isMe ? "border-primary bg-primary/20" : "border-border bg-muted"
              )}
            >
              {p.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium truncate">{p.name}</span>
                {p.isLeader && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40">
                    <Crown className="size-3" />
                    대장
                  </span>
                )}
                {isOnQuest && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/40">
                    <Sword className="size-3" />
                    원정대
                  </span>
                )}
              </div>
              {p.vote !== null && (
                <span className="text-xs text-muted-foreground">
                  {p.vote === "APPROVE" ? "찬성" : "반대"}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
