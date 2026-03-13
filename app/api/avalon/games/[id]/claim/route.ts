import { NextRequest, NextResponse } from "next/server";
import { claimPlayerSlot } from "@/lib/avalon-connected";

/** 플레이어 슬롯 점유 (입장) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: gameId } = await params;

  try {
    const body = await request.json();
    const { playerId, displayName } = body as {
      playerId?: string;
      displayName?: string;
    };

    if (!playerId) {
      return NextResponse.json(
        { error: "playerId가 필요합니다." },
        { status: 400 }
      );
    }

    const result = await claimPlayerSlot(
      gameId,
      String(playerId),
      displayName ?? ""
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "슬롯 점유 실패" },
      { status: 500 }
    );
  }
}
