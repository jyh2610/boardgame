import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { getAvalonSession, getAvalonCodeByGameId } from "@/lib/avalon-sessions";
import { getConnectedPlayerIds } from "@/lib/avalon-connected";
import {
  getPublicStateForPlayer,
  getNightVision,
  getPlayerRoleInfo,
  type AvalonMatchState,
} from "@/lib/avalon-engine";

/** 아발론 게임 상태 조회 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");

  const state = await getAvalonSession(id);

  if (!state) {
    return NextResponse.json(
      { error: "게임을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  // playerId가 있으면 해당 플레이어용 공개 상태 + 밤 단계 정보 + 역할 정보
  if (playerId) {
    const publicState = getPublicStateForPlayer(state, playerId);
    const nightVision =
      state.phase === "NIGHT" ? getNightVision(state, playerId) : null;
    const playerRole =
      state.phase !== "LOBBY" ? getPlayerRoleInfo(state, playerId) : null;
    const roomCode = await getAvalonCodeByGameId(id);
    const connectedPlayerIds =
      state.phase === "LOBBY" ? await getConnectedPlayerIds(id) : undefined;

    return NextResponse.json(
      {
        ...publicState,
        nightVision,
        playerRole,
        roomCode,
        connectedPlayerIds,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  }

  // playerId 없으면 전체 상태 (관전용, 역할 등 비공개 정보 포함 - 개발/디버그용)
  return NextResponse.json(state, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
