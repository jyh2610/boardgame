"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createGame, joinGame } from "@/lib/avalon-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sword, Users, LogIn } from "lucide-react";

const PLAYER_COUNTS = [5, 6, 7, 8, 9, 10] as const;

export default function ResistansAvalonLobbyPage() {
  const router = useRouter();
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // 방 만들기 상태
  const [playerCount, setPlayerCount] = useState<number>(5);
  const [names, setNames] = useState<string[]>(
    Array(10)
      .fill(null)
      .map((_, i) => `플레이어 ${i + 1}`),
  );

  // 방 참가 상태
  const [joinCode, setJoinCode] = useState("");

  const handleCreate = async () => {
    setCreateError(null);
    setIsCreating(true);
    try {
      const trimmedNames = names
        .slice(0, playerCount)
        .map((n) => n.trim() || `플레이어`);
      const { gameId, code } = await createGame(playerCount, trimmedNames);
      router.push(`/resistans_avalon/${gameId}`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "게임 생성 실패");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    setJoinError(null);
    setIsJoining(true);
    try {
      const code = joinCode.trim().toUpperCase();
      if (!code) {
        setJoinError("방 코드를 입력하세요.");
        return;
      }
      const { gameId } = await joinGame(code);
      router.push(`/resistans_avalon/${gameId}`);
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : "참가 실패");
    } finally {
      setIsJoining(false);
    }
  };

  const updateName = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sword className="size-10 text-primary" />
            <h1 className="text-3xl font-black tracking-tight">
              레지스탕스 아발론
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            선과 악의 대결, 숨겨진 역할 추리 게임
          </p>
        </header>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Users className="size-4" />방 만들기
            </TabsTrigger>
            <TabsTrigger value="join" className="flex items-center gap-2">
              <LogIn className="size-4" />방 참가
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>새 게임 만들기</CardTitle>
                <CardDescription>
                  5~10명이 플레이할 수 있습니다. 인원 수와 이름을 입력하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">인원 수</label>
                  <div className="flex flex-wrap gap-2">
                    {PLAYER_COUNTS.map((n) => (
                      <Button
                        key={n}
                        variant={playerCount === n ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPlayerCount(n)}
                      >
                        {n}명
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">플레이어 이름</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: playerCount }, (_, i) => (
                      <Input
                        key={i}
                        placeholder={`플레이어 ${i + 1}`}
                        value={names[i] ?? ""}
                        onChange={(e) => updateName(i, e.target.value)}
                      />
                    ))}
                  </div>
                </div>

                {createError && (
                  <p className="text-sm text-destructive">{createError}</p>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? "생성 중..." : "방 만들기"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>방 코드로 참가</CardTitle>
                <CardDescription>
                  호스트에게 받은 6자리 방 코드를 입력하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="예: ABC123"
                  value={joinCode}
                  onChange={(e) =>
                    setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                  }
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                />

                {joinError && (
                  <p className="text-sm text-destructive">{joinError}</p>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleJoin}
                  disabled={isJoining || !joinCode.trim()}
                >
                  {isJoining ? "참가 중..." : "참가하기"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
