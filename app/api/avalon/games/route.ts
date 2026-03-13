import { NextRequest, NextResponse } from "next/server";
import { createAvalonGame } from "@/lib/avalon-engine";
import { createAvalonSession } from "@/lib/avalon-sessions";

/** 아발론 게임 생성 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerCount, names } = body as {
      playerCount: number;
      names: string[];
    };

    if (
      !playerCount ||
      !Array.isArray(names) ||
      names.length < playerCount
    ) {
      return NextResponse.json(
        { error: "playerCount와 names 배열이 필요합니다." },
        { status: 400 }
      );
    }

    if (playerCount < 5 || playerCount > 10) {
      return NextResponse.json(
        { error: "5~10명만 게임이 가능합니다." },
        { status: 400 }
      );
    }

    const playerIds = Array.from({ length: playerCount }, (_, i) =>
      String(i)
    );
    const playerNames = names.slice(0, playerCount);

    const state = createAvalonGame(playerIds, playerNames);
    const { gameId, code } = await createAvalonSession(state);

    return NextResponse.json({ gameId, code });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "게임 생성 실패" },
      { status: 500 }
    );
  }
}
