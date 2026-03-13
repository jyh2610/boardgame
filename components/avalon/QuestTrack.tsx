"use client";

import type { QuestResult } from "@/lib/avalon-engine";
import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestTrackProps {
  questTrack: QuestResult[];
  currentRound: number;
  questSizes: [number, number, number, number, number];
}

const ROUND_LABELS = ["1", "2", "3", "4", "5"];

export function QuestTrack({
  questTrack,
  currentRound,
  questSizes,
}: QuestTrackProps) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground mr-1.5 shrink-0 hidden sm:inline">
        사명
      </span>
      {ROUND_LABELS.map((label, i) => {
        const result = questTrack[i] ?? null;
        const size = questSizes[i] ?? 0;
        const isCurrent = currentRound === i + 1;

        return (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center gap-0.5 p-1.5 sm:p-2 rounded-lg border-2 min-w-[2.5rem] sm:min-w-[3rem] transition-all",
              isCurrent && "border-primary bg-primary/15 shadow-md shadow-primary/20 scale-105",
              !isCurrent && "border-border bg-card/60"
            )}
          >
            <span
              className={cn(
                "text-[10px] sm:text-xs font-bold",
                isCurrent ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}R
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground/80">
              {size}명
            </span>
            <div
              className={cn(
                "mt-0.5 sm:mt-1 flex items-center justify-center size-6 sm:size-7 rounded-full",
                result === "SUCCESS" && "bg-blue-500/20",
                result === "FAIL" && "bg-red-500/20",
                result === null && "bg-muted/50"
              )}
            >
              {result === "SUCCESS" && (
                <Check className="size-4 sm:size-5 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
              )}
              {result === "FAIL" && (
                <X className="size-4 sm:size-5 text-red-600 dark:text-red-400 stroke-[2.5]" />
              )}
              {result === null && (
                <Minus className="size-3 sm:size-4 text-muted-foreground/50" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
