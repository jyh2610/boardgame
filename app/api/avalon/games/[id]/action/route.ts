import { NextRequest, NextResponse } from "next/server";
import { getAvalonSession, updateAvalonSession } from "@/lib/avalon-sessions";
import {
  finishNightPhase,
  proposeTeam,
  submitVote,
  submitQuestCard,
  submitAssassination,
  type AvalonMatchState,
} from "@/lib/avalon-engine";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const state = await getAvalonSession(id);

  if (!state) {
    return NextResponse.json(
      { error: "게임을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { playerId, action, payload } = body as {
      playerId: string;
      action: string;
      payload?: Record<string, unknown>;
    };

    if (!playerId || typeof playerId !== "string") {
      return NextResponse.json(
        { error: "playerId가 필요합니다." },
        { status: 400 }
      );
    }

    const playerExists = state.players.some((p) => p.id === playerId);
    if (!playerExists) {
      return NextResponse.json(
        { error: "유효하지 않은 플레이어입니다." },
        { status: 403 }
      );
    }

    let nextState: AvalonMatchState = state;
    let result: { success: boolean; state: AvalonMatchState; error?: string };

    switch (action) {
      case "finishNight":
        nextState = finishNightPhase(state);
        result = { success: true, state: nextState };
        break;

      case "proposeTeam": {
        const teamMemberIds = payload?.teamMemberIds as string[] | undefined;
        if (!Array.isArray(teamMemberIds)) {
          return NextResponse.json(
            { error: "teamMemberIds 배열이 필요합니다." },
            { status: 400 }
          );
        }
        result = proposeTeam(state, playerId, teamMemberIds);
        break;
      }

      case "vote": {
        const vote = payload?.vote as "APPROVE" | "REJECT" | undefined;
        if (vote !== "APPROVE" && vote !== "REJECT") {
          return NextResponse.json(
            { error: "vote는 APPROVE 또는 REJECT여야 합니다." },
            { status: 400 }
          );
        }
        result = submitVote(state, playerId, vote);
        break;
      }

      case "questCard": {
        const card = payload?.card as "SUCCESS" | "FAIL" | undefined;
        if (card !== "SUCCESS" && card !== "FAIL") {
          return NextResponse.json(
            { error: "card는 SUCCESS 또는 FAIL이어야 합니다." },
            { status: 400 }
          );
        }
        result = submitQuestCard(state, playerId, card);
        break;
      }

      case "assassination": {
        const targetId = payload?.targetId as string | undefined;
        if (!targetId || typeof targetId !== "string") {
          return NextResponse.json(
            { error: "targetId가 필요합니다." },
            { status: 400 }
          );
        }
        result = submitAssassination(state, playerId, targetId);
        break;
      }

      default:
        return NextResponse.json(
          { error: `알 수 없는 액션: ${action}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "액션 실패" },
        { status: 400 }
      );
    }

    await updateAvalonSession(id, result.state);

    return NextResponse.json(result.state);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "액션 처리 실패" },
      { status: 500 }
    );
  }
}
