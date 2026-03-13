import { NextRequest, NextResponse } from "next/server";
import { sendJoinNotification } from "@/lib/avalon-chat";

/** 유저 접속 시 채팅에 접속 알림 전송 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;

  try {
    const body = await request.json();
    const { playerId, playerName } = body as {
      playerId?: string;
      playerName?: string;
    };

    if (!playerId || !playerName) {
      return NextResponse.json(
        { error: "playerId, playerName이 필요합니다." },
        { status: 400 }
      );
    }

    const msg = await sendJoinNotification(gameId, playerId, playerName);
    return NextResponse.json(msg);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "접속 알림 전송 실패" },
      { status: 500 }
    );
  }
}
