"use client";

import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RejectCountProps {
  rejectTrack: number;
  maxRejects?: number;
}

export function RejectCount({ rejectTrack, maxRejects = 5 }: RejectCountProps) {
  return (
    <div className="flex items-center gap-2">
      <XCircle className="size-5 text-destructive" />
      <span className="text-sm font-medium">부결</span>
      <div className="flex gap-1">
        {Array.from({ length: maxRejects }, (_, i) => (
          <div
            key={i}
            className={cn(
              "size-3 rounded-full border",
              i < rejectTrack ? "bg-destructive border-destructive" : "border-muted-foreground/30"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {rejectTrack}/{maxRejects}
      </span>
    </div>
  );
}
