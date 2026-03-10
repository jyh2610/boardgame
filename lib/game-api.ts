import type { GameState } from "./game-engine";

const API = "/api";

export async function createGame(
  numPlayers: number,
  names: string[],
): Promise<{ gameId: string; code: string }> {
  const res = await fetch(`${API}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ numPlayers, names }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "게임 생성 실패");
  }
  return res.json();
}

export async function joinGame(code: string): Promise<{ gameId: string }> {
  const res = await fetch(`${API}/games/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "참가 실패");
  }
  return res.json();
}

export async function fetchGame(gameId: string): Promise<GameState> {
  const res = await fetch(`${API}/games/${gameId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "게임을 불러올 수 없습니다.");
  }
  return res.json();
}

export type GameAction =
  | { action: "roll" }
  | { action: "move"; payload: { steps: number } }
  | { action: "finishMoving" }
  | { action: "buy" }
  | { action: "decline" }
  | { action: "payRent" }
  | { action: "confirmGoldenKey" }
  | { action: "jailEscape" }
  | { action: "confirmModal" }
  | { action: "buildHouse"; payload: { tileId: number } };

export async function dispatchAction(
  gameId: string,
  playerId: number,
  action: GameAction,
): Promise<GameState> {
  const res = await fetch(`${API}/games/${gameId}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId, ...action }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "액션 실패");
  }
  return res.json();
}
