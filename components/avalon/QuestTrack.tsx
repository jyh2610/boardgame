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
    <div className="flex items-center gap-2">
      {ROUND_LABELS.map((label, i) => {
        const result = questTrack[i] ?? null;
        const size = questSizes[i] ?? 0;
        const isCurrent = currentRound === i + 1;

        return (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg border min-w-[3rem]",
              isCurrent && "border-primary bg-primary/10",
              !isCurrent && "border-border bg-card/50"
            )}
          >
            <span className="text-xs font-medium text-muted-foreground">
              {label}라운드
            </span>
            <span className="text-xs text-muted-foreground">({size}명)</span>
            <div className="mt-1">
              {result === "SUCCESS" && (
                <Check className="size-6 text-green-500" />
              )}
              {result === "FAIL" && <X className="size-6 text-destructive" />}
              {result === null && (
                <Minus className="size-6 text-muted-foreground/50" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
