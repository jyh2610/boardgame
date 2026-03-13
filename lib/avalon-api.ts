import type {
  AvalonMatchState,
  AvalonConfig,
  NightVision,
  PlayerRoleInfo,
  Phase,
  QuestResult,
  QuestCard,
  AvalonPlayerPublic,
  Team,
} from "./avalon-engine";

const API = "/api/avalon/games";

// ============ 응답 타입 ============

/** playerId로 조회 시 반환되는 공개 상태 (역할/팀 등 비공개 정보 제외) */
export interface AvalonPublicState {
  config: AvalonConfig;
  phase: Phase;
  currentRound: number;
  questTrack: QuestResult[];
  rejectTrack: number;
  proposedTeam: string[];
  players: AvalonPlayerPublic[];
  questResultsShuffled: QuestCard[];
  canProposeTeam: boolean;
  canVote: boolean;
  hasVoted: boolean;
  canSubmitQuestCard: boolean;
  hasSubmittedQuestCard: boolean;
  canAssassinate: boolean;
  winner: Team | null;
  assassinationTarget: string | null;
  readyPlayerIds?: string[];
  nightConfirmPlayerIds?: string[];
  lastVoteResult?: {
    approveCount: number;
    rejectCount: number;
    passed: boolean;
  };
  gameLog?: string[];
}

/** playerId로 fetchGame 호출 시 반환 타입 */
export interface AvalonGameStateForPlayer extends AvalonPublicState {
  nightVision: NightVision | null;
  playerRole: PlayerRoleInfo | null;
  roomCode: string | null;
  readyPlayerIds?: string[];
  nightConfirmPlayerIds?: string[];
  connectedPlayerIds?: string[]; // LOBBY 단계에서 입장한 플레이어 id
}

// ============ 액션 타입 ============

export type AvalonAction =
  | { action: "ready" }
  | { action: "confirmNight" }
  | { action: "proposeTeam"; payload: { teamMemberIds: string[] } }
  | { action: "vote"; payload: { vote: "APPROVE" | "REJECT" } }
  | { action: "questCard"; payload: { card: "SUCCESS" | "FAIL" } }
  | { action: "assassination"; payload: { targetId: string } };

// ============ API 함수 ============

/** 아발론 게임 생성 */
export async function createGame(
  playerCount: number,
  names: string[],
): Promise<{ gameId: string; code: string }> {
  const res = await fetch(`${API}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerCount, names }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "게임 생성 실패");
  }
  return res.json();
}

/** 슬롯 목록 조회 (점유 여부 포함) */
export async function fetchSlots(gameId: string): Promise<{
  slots: { id: string; name: string; isTaken: boolean }[];
  isFull: boolean;
  playerCount: number;
}> {
  const res = await fetch(`${API}/${gameId}/slots`, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error || "슬롯 정보를 불러올 수 없습니다.",
    );
  }
  return res.json();
}

/** 플레이어 슬롯 점유 (입장) */
export async function claimPlayer(
  gameId: string,
  playerId: string,
  displayName: string,
): Promise<void> {
  const res = await fetch(`${API}/${gameId}/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId, displayName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "입장 실패");
  }
}

/** 방 코드로 아발론 게임 참가 */
export async function joinGame(code: string): Promise<{ gameId: string }> {
  const res = await fetch(`${API}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "참가 실패");
  }
  return res.json();
}

/**
 * 아발론 게임 상태 조회
 * @param gameId 게임 ID
 * @param playerId 플레이어 ID (있으면 해당 플레이어용 공개 상태 + nightVision 반환, 없으면 전체 상태 - 디버그용)
 */
export async function fetchGame(
  gameId: string,
  playerId?: string,
): Promise<AvalonGameStateForPlayer | AvalonMatchState> {
  const url = playerId
    ? `${API}/${gameId}?playerId=${encodeURIComponent(playerId)}`
    : `${API}/${gameId}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error || "게임을 불러올 수 없습니다.",
    );
  }
  return res.json();
}

/** 아발론 게임 액션 실행 */
export async function dispatchAction(
  gameId: string,
  playerId: string,
  action: AvalonAction,
): Promise<AvalonMatchState> {
  const actionType = action.action;
  const payload = "payload" in action ? action.payload : undefined;
  const res = await fetch(`${API}/${gameId}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId, action: actionType, payload }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "액션 실패");
  }
  return res.json();
}
