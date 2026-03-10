import { NextRequest, NextResponse } from "next/server";
import { createGame } from "@/lib/game-engine";
import { createSession } from "@/lib/game-sessions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { numPlayers, names } = body as {
      numPlayers: number;
      names: string[];
    };

    if (!numPlayers || !Array.isArray(names) || names.length < numPlayers) {
      return NextResponse.json(
        { error: "numPlayers와 names 배열이 필요합니다." },
        { status: 400 },
      );
    }

    const state = createGame(numPlayers, names.slice(0, numPlayers));
    const { gameId, code } = await createSession(state);

    return NextResponse.json({ gameId, code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "게임 생성 실패" }, { status: 500 });
  }
}
