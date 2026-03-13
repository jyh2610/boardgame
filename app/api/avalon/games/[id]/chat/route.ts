import { NextRequest, NextResponse } from "next/server";
import { getChatMessages, sendChatMessage } from "@/lib/avalon-chat";

/** 채팅 메시지 목록 조회 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 200);

  try {
    const messages = await getChatMessages(gameId, limit);
    return NextResponse.json(messages);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "채팅 로드 실패" },
      { status: 500 }
    );
  }
}

/** 채팅 메시지 전송 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;

  try {
    const body = await request.json();
    const { playerId, playerName, message } = body as {
      playerId?: string;
      playerName?: string;
      message?: string;
    };

    if (!playerId || !playerName || typeof message !== "string") {
      return NextResponse.json(
        { error: "playerId, playerName, message가 필요합니다." },
        { status: 400 }
      );
    }

    const msg = await sendChatMessage(gameId, playerId, playerName, message);
    return NextResponse.json(msg);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "채팅 전송 실패" },
      { status: 500 }
    );
  }
}
