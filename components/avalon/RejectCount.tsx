"use client";

import { XCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/avalon-engine";

interface RejectCountProps {
  rejectTrack: number;
  phase?: Phase;
  maxRejects?: number;
}

export function RejectCount({
  rejectTrack,
  phase,
  maxRejects = 5,
}: RejectCountProps) {
  const isCleared = phase === "SIMYANG" && rejectTrack === 0;
  const isDanger = rejectTrack >= 4;
  const isEvilWin = rejectTrack >= maxRejects;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border-2 transition-colors",
        isEvilWin && "border-red-500 bg-red-500/20",
        isDanger && !isEvilWin && "border-amber-500/70 bg-amber-500/10",
        !isDanger && !isEvilWin && "border-border bg-card/60"
      )}
    >
      {isCleared ? (
        <CheckCircle2 className="size-5 text-green-600 dark:text-green-500 shrink-0" />
      ) : (
        <XCircle className="size-5 text-destructive shrink-0" />
      )}
      <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground shrink-0">
        부결
      </span>
      <div className="flex gap-0.5 sm:gap-1 items-center" title="부결 5회 시 악 승리">
        {Array.from({ length: maxRejects }, (_, i) => (
          <div
            key={i}
            className={cn(
              "size-4 sm:size-5 rounded-full border-2 transition-all duration-300",
              i < rejectTrack
                ? "bg-red-500 border-red-600 dark:border-red-400"
                : "border-muted-foreground/30 bg-muted/30"
            )}
          />
        ))}
      </div>
      <span
        className={cn(
          "text-xs font-bold tabular-nums",
          isEvilWin && "text-red-600 dark:text-red-400",
          isDanger && !isEvilWin && "text-amber-600 dark:text-amber-400",
          !isDanger && !isEvilWin && "text-muted-foreground"
        )}
      >
        {rejectTrack}/{maxRejects}
      </span>
      {isEvilWin && (
        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 shrink-0">
          <AlertTriangle className="size-3.5" />
          악 승리!
        </span>
      )}
    </div>
  );
}
