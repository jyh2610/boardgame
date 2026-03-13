import { NextRequest, NextResponse } from "next/server";
import { getAvalonSession } from "@/lib/avalon-sessions";
import { getConnectedPlayerIds } from "@/lib/avalon-connected";

/** 슬롯 목록 조회 (플레이어별 점유 여부) */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: gameId } = await params;

  const state = await getAvalonSession(gameId);
  if (!state) {
    return NextResponse.json(
      { error: "게임을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const connected = await getConnectedPlayerIds(gameId);
  const playerCount = state.config.playerCount;
  const isFull = connected.length >= playerCount;

  const slots = state.players.map((p) => ({
    id: p.id,
    name: p.name,
    isTaken: connected.includes(p.id),
  }));

  return NextResponse.json(
    { slots, isFull, playerCount },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
