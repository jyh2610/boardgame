import { NextRequest, NextResponse } from "next/server";
import { getSession, getCodeByGameId } from "@/lib/game-sessions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const state = await getSession(id);

  if (!state) {
    return NextResponse.json(
      { error: "게임을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const code = await getCodeByGameId(id);
  return NextResponse.json({ ...state, roomCode: code ?? undefined });
}
