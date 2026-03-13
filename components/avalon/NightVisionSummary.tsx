"use client";

import type { NightVision } from "@/lib/avalon-engine";
import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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

function idToName(players: AvalonPlayerPublic[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? `플레이어 ${id}`;
}

interface NightVisionSummaryProps {
  nightVision: NightVision;
  players: AvalonPlayerPublic[];
}

export function NightVisionSummary({
  nightVision,
  players,
}: NightVisionSummaryProps) {
  const {
    myRole,
    myTeam,
    knownEvil,
    knownMerlinCandidates,
    knownEvilTeammates,
  } = nightVision;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs h-8"
          title="밤에 본 정보 다시 보기"
        >
          <Moon className="size-3.5" />
          내가 본 정보
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-sm sm:max-w-md">
        <SheetHeader className="shrink-0 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Moon className="size-5 text-primary" />
            밤에 본 정보
          </SheetTitle>
        </SheetHeader>
        <div className="pt-4 space-y-5 overflow-y-auto">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              당신의 역할
            </p>
            <p className="text-xl font-bold text-primary">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
