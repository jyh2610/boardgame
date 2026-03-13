"use client";

import type { NightVision } from "@/lib/avalon-engine";
import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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

const ROLE_DESCRIPTIONS: Record<string, string> = {
  MERLIN:
    "선의 세력. 밤에 모든 악의 세력을 볼 수 있음 (단, 모드레드는 제외). 원정 3번 성공 시 암살자가 멀린을 지목하면 악의 역전승.",
  PERCIVAL:
    "선의 세력. 밤에 멀린과 모르가나 중 한 명을 볼 수 있음 (둘 다 '멀린 후보'로 표시됨). 진짜 멀린을 찾아 보호해야 함.",
  LOYAL:
    "선의 세력. 특별한 능력 없음. 원정에 참가 시 성공 카드만 제출 가능. 악을 찾아 원정을 성공시키는 것이 목표.",
  ASSASSIN:
    "악의 세력. 악 동료들을 모두 알고 있음. 원정 3번 성공 후 멀린을 정확히 지목하면 악의 역전승.",
  MORGANNA:
    "악의 세력. 퍼시벌에게 멀린 후보로 보임 (멀린과 함께). 악 동료들을 모두 알고 있음.",
  MORDRED:
    "악의 세력. 멀린에게 보이지 않음 (멀린은 모드레드를 악으로 알 수 없음). 악 동료들을 모두 알고 있음.",
  OBERON:
    "악의 세력. 다른 악에게 보이지 않고, 다른 악도 모름. 혼자 행동해야 함.",
  MINION:
    "악의 세력. 악 동료들을 모두 알고 있음. 원정에 참가 시 실패 카드 제출 가능.",
};

interface PhaseNightProps {
  nightVision: NightVision;
  players: AvalonPlayerPublic[];
  nightConfirmPlayerIds: string[];
  playerId: string;
  onConfirm: () => Promise<void>;
  isActing: boolean;
}

function idToName(players: AvalonPlayerPublic[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? `플레이어 ${id}`;
}

export function PhaseNight({
  nightVision,
  players,
  nightConfirmPlayerIds,
  playerId,
  onConfirm,
  isActing,
}: PhaseNightProps) {
  const {
    myRole,
    myTeam,
    knownEvil,
    knownMerlinCandidates,
    knownEvilTeammates,
  } = nightVision;

  const confirmSet = new Set(nightConfirmPlayerIds);
  const playerCount = players.length;
  const allConfirmed = nightConfirmPlayerIds.length >= playerCount;
  const amIConfirmed = confirmSet.has(playerId);

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Moon className="size-6 text-primary" />
          <CardTitle>밤 - 역할 확인</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          역할을 확인한 뒤 확인 버튼을 눌러주세요. 전원 확인 시 게임이 진행됩니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">당신의 역할</p>
          <p className="text-2xl font-bold text-primary">
            {ROLE_NAMES[myRole] ?? myRole}
          </p>
          <p className="text-sm text-muted-foreground">
            {myTeam === "GOOD" ? "선의 세력" : "악의 세력"}
          </p>
          {ROLE_DESCRIPTIONS[myRole] && (
            <p className="text-sm text-foreground pt-2 border-t border-border">
              {ROLE_DESCRIPTIONS[myRole]}
            </p>
          )}
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

        <div className="space-y-2">
          <p className="text-sm font-medium">확인 현황 ({nightConfirmPlayerIds.length}/{playerCount})</p>
          <div className="flex flex-col gap-2">
            {players.map((p) => {
              const isConfirmed = confirmSet.has(p.id);
              const isMe = p.id === playerId;

              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    isMe && "border-primary bg-primary/10",
                    !isConfirmed && "opacity-80"
                  )}
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
                    <span className="font-medium truncate block">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {isConfirmed ? "확인 완료" : "확인 대기"}
                    </span>
                  </div>
                  <div className="shrink-0">
                    {isConfirmed ? (
                      <CheckCircle2 className="size-5 text-green-500" />
                    ) : (
                      <Clock className="size-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!allConfirmed && (
          <p className="text-sm text-amber-600 dark:text-amber-500 text-center">
            {playerCount - nightConfirmPlayerIds.length}명이 아직 확인하지 않았습니다.
          </p>
        )}

        {allConfirmed && (
          <p className="text-sm text-green-600 dark:text-green-500 text-center font-medium">
            마지막 플레이어가 확인을 누르면 게임이 진행됩니다!
          </p>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={onConfirm}
          disabled={isActing || amIConfirmed}
        >
          {isActing ? "확인 중..." : amIConfirmed ? "확인 완료" : "확인"}
        </Button>
      </CardContent>
    </Card>
  );
}
