"use client";

import type { AvalonPlayerPublic } from "@/lib/avalon-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhaseLobbyProps {
  players: AvalonPlayerPublic[];
  connectedPlayerIds: string[];
  readyPlayerIds: string[];
  playerId: string;
  onReady: () => Promise<void>;
  isActing: boolean;
}

export function PhaseLobby({
  players,
  connectedPlayerIds,
  readyPlayerIds,
  playerId,
  onReady,
  isActing,
}: PhaseLobbyProps) {
  const connectedSet = new Set(connectedPlayerIds);
  const readySet = new Set(readyPlayerIds);
  const playerCount = players.length;
  const allConnected = connectedPlayerIds.length >= playerCount;
  const allReady = readyPlayerIds.length >= playerCount;
  const canStart = allConnected && allReady;
  const amIReady = readySet.has(playerId);

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="size-6 text-primary" />
          <CardTitle>대기실</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          모두 입장한 뒤, 각자 준비를 눌러주세요. 전원 준비 시 게임이 시작됩니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">플레이어 ({connectedPlayerIds.length}/{playerCount})</p>
          <div className="flex flex-col gap-2">
            {players.map((p) => {
              const isConnected = connectedSet.has(p.id);
              const isReady = readySet.has(p.id);
              const isMe = p.id === playerId;

              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    isMe && "border-primary bg-primary/10",
                    !isConnected && "opacity-60"
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
                      {!isConnected
                        ? "대기 중"
                        : isReady
                          ? "준비 완료"
                          : "준비 대기"}
                    </span>
                  </div>
                  <div className="shrink-0">
                    {isConnected && isReady ? (
                      <CheckCircle2 className="size-5 text-green-500" />
                    ) : isConnected ? (
                      <Clock className="size-5 text-muted-foreground" />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!allConnected && (
          <p className="text-sm text-amber-600 dark:text-amber-500 text-center">
            {playerCount - connectedPlayerIds.length}명이 아직 입장하지 않았습니다.
          </p>
        )}

        {allConnected && !allReady && (
          <p className="text-sm text-amber-600 dark:text-amber-500 text-center">
            {playerCount - readyPlayerIds.length}명이 아직 준비하지 않았습니다.
          </p>
        )}

        {canStart && (
          <p className="text-sm text-green-600 dark:text-green-500 text-center font-medium">
            마지막 플레이어가 준비를 누르면 게임이 시작됩니다!
          </p>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={onReady}
          disabled={isActing || amIReady}
        >
          {isActing ? "처리 중..." : amIReady ? "준비 완료" : "준비"}
        </Button>
      </CardContent>
    </Card>
  );
}
