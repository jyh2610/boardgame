import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession } from "@/lib/game-sessions";
import {
  rollDice,
  movePlayer,
  finishMoving,
  buyProperty,
  declineBuy,
  payRent,
  confirmGoldenKey,
  handleJailEscape,
  confirmModal,
  buildHouse,
  type GameState,
} from "@/lib/game-engine";
import { TOTAL_TILES } from "@/lib/game-data";

export async function POST(
  request: NextRequest,
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

  try {
    const body = await request.json();
    const { playerId, action, payload } = body as {
      playerId: number;
      action: string;
      payload?: { tileId?: number; steps?: number };
    };

    if (playerId === undefined || playerId === null) {
      return NextResponse.json(
        { error: "playerId가 필요합니다." },
        { status: 400 },
      );
    }

    const pid = Number(playerId);
    const currentPlayerId = state.players[state.currentPlayerIndex]?.id ?? -1;
    if (Number(currentPlayerId) !== pid) {
      return NextResponse.json(
        {
          error: "현재 당신의 차례가 아닙니다.",
          debug: {
            receivedPlayerId: pid,
            currentPlayerId: Number(currentPlayerId),
            phase: state.phase,
          },
        },
        { status: 403 },
      );
    }

    let nextState: GameState = state;

    switch (action) {
      case "roll":
        if (state.phase !== "ROLL") {
          return NextResponse.json(
            { error: "주사위를 굴릴 수 없습니다." },
            { status: 400 },
          );
        }
        nextState = rollDice(state);
        break;

      case "move":
        if (state.phase !== "MOVING" || !payload?.steps) {
          return NextResponse.json(
            { error: "이동할 수 없습니다." },
            { status: 400 },
          );
        }
        nextState = movePlayer(state, pid, payload.steps);
        break;

      case "finishMoving":
        if (state.phase !== "MOVING") {
          return NextResponse.json(
            { error: "이동 완료할 수 없습니다." },
            { status: 400 },
          );
        }
        nextState = finishMoving(state);
        break;

      case "buy":
        if (state.phase !== "BUY") {
          return NextResponse.json(
            { error: "매수할 수 없습니다." },
            { status: 400 },
          );
        }
        nextState = buyProperty(state);
        break;

      case "decline":
        if (state.phase !== "BUY") {
          return NextResponse.json(
            { error: "거절할 수 없습니다." },
            { status: 400 },
          );
        }
        nextState = declineBuy(state);
        break;

      case "payRent":
        if (state.phase !== "PAY_RENT") {
          return NextResponse.json(
            { error: "통행료를 낼 수 없습니다." },
            { status: 400 },
          );
        }
        nextState = payRent(state);
        break;

      case "confirmGoldenKey":
        if (state.phase !== "GOLDEN_KEY") {
          return NextResponse.json(
            { error: "황금열쇠를 확인할 수 없습니다." },
            { status: 400 },
          );
        }
        nextState = confirmGoldenKey(state);
        break;

      case "jailEscape":
        if (state.phase !== "JAIL") {
          return NextResponse.json(
            { error: "보석금을 낼 수 없습니다." },
            { status: 400 },
          );
        }
        nextState = handleJailEscape(state);
        break;

      case "confirmModal":
        if (!["TAX", "WELFARE", "TRAVEL", "JAIL"].includes(state.phase)) {
          return NextResponse.json(
            { error: "모달을 확인할 수 없습니다." },
            { status: 400 },
          );
        }
        nextState = confirmModal(state);
        break;

      case "buildHouse":
        if (payload?.tileId != null) {
          nextState = buildHouse(state, payload.tileId);
        }
        break;

      default:
        return NextResponse.json(
          { error: `알 수 없는 액션: ${action}` },
          { status: 400 },
        );
    }

    await updateSession(id, nextState);
    return NextResponse.json(nextState);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "액션 처리 실패" }, { status: 500 });
  }
}
