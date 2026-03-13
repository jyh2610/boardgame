/**
 * 조선비사 - 조선시대 인물 배경 숨겨진 역할 게임
 * (The Resistance: Avalon 규칙 기반)
 */

// ============ 타입 정의 ============

export type Team = "GOOD" | "EVIL";

export type Role =
  | "JUNGJO" // 정조 - 규장각
  | "JUNGYAKYONG" // 정약용 - 규장각
  | "GYUJANGGAK" // 규장각 각신
  | "JAGAP" // 존현각 자객 - 노론 벽파
  | "SIMHWANJI" // 심환지 - 노론 벽파
  | "JEONGSUNWANGHU" // 정순왕후 - 노론 벽파 (정조에게 안 보임)
  | "HONGGUKYEONG" // 홍국영 - 노론 벽파 (다른 노론에게 안 보임)
  | "NORON_BYOKPA"; // 노론 벽파

export type Phase =
  | "LOBBY" // 대기실
  | "NIGHT" // 밤 - 역할 확인
  | "SIMYANGDAN_SETUP" // 사명단 구성
  | "VOTING" // 찬반 투표
  | "SIMYANG" // 사명 수행
  | "JAGAP_PHASE" // 자객 지목 단계
  | "END"; // 게임 종료

export type Vote = "APPROVE" | "REJECT";

export type QuestCard = "SUCCESS" | "FAIL";

export type QuestResult = "SUCCESS" | "FAIL" | null; // null = 아직 진행 안 됨

// 플레이어 내부 상태 (서버 전용, 클라이언트에는 제한적으로 전달)
export interface AvalonPlayer {
  id: string;
  name: string;
  role: Role;
  team: Team;
  isLeader: boolean;
  vote: Vote | null; // 투표 종료 전까지 비공개
  questCard: QuestCard | null; // 제출 즉시 섞여서 비공개
}

// 클라이언트용 플레이어 뷰 (역할/팀 등 비공개 정보 제거)
export interface AvalonPlayerPublic {
  id: string;
  name: string;
  isLeader: boolean;
  isOnQuest: boolean; // 이번 원정대에 포함 여부
  vote: Vote | null; // 투표 완료 후에만 공개
  isReady?: boolean; // LOBBY 단계에서 준비 완료 여부
  role?: Role; // END 단계에서만 공개
  team?: Team; // END 단계에서만 공개
}

// 밤 단계에서 각 플레이어에게 보여줄 정보
export interface NightVision {
  myRole: Role;
  myTeam: Team;
  knownEvil: string[]; // 악으로 알려진 플레이어 id (멀린용, 모드레드 제외)
  knownMerlinCandidates: string[]; // 멀린 후보 id (퍼시벌용 - 멀린+모르가나)
  knownEvilTeammates: string[]; // 악 동료 id (악 진영용, 오베론 제외)
}

// 인원별 게임 설정
export interface AvalonConfig {
  playerCount: number;
  goodCount: number;
  evilCount: number;
  questSizes: [number, number, number, number, number]; // 1~5라운드별 필요 인원
  round4RequiresTwoFails: boolean; // 7인 이상 4라운드: 실패 2장 필요
}

// 전체 매치 상태
export interface AvalonMatchState {
  config: AvalonConfig;
  phase: Phase;
  currentRound: number; // 1 ~ 5
  questTrack: QuestResult[]; // 길이 5, 각 라운드 결과
  rejectTrack: number; // 0 ~ 5, 투표 부결 횟수
  proposedTeam: string[]; // 원정대장이 제안한 팀 (플레이어 id)
  players: AvalonPlayer[];
  questResultsShuffled: QuestCard[]; // 퀘스트 카드 셔플 결과 (공개용)
  assassinationTarget: string | null; // 암살자가 지목한 플레이어 id
  winner: Team | null; // 게임 종료 시 승리 진영
  readyPlayerIds?: string[]; // LOBBY 단계에서 준비 완료한 플레이어 id
  nightConfirmPlayerIds?: string[]; // NIGHT 단계에서 확인 완료한 플레이어 id
  lastVoteResult?: {
    approveCount: number;
    rejectCount: number;
    passed: boolean;
  };
  gameLog?: string[]; // 게임 진행 로그 (최신순)
}

// ============ 상수 및 설정 ============

const AVALON_CONFIGS: Record<number, AvalonConfig> = {
  5: {
    playerCount: 5,
    goodCount: 3,
    evilCount: 2,
    questSizes: [2, 3, 2, 3, 3],
    round4RequiresTwoFails: false,
  },
  6: {
    playerCount: 6,
    goodCount: 4,
    evilCount: 2,
    questSizes: [2, 3, 4, 3, 4],
    round4RequiresTwoFails: false,
  },
  7: {
    playerCount: 7,
    goodCount: 4,
    evilCount: 3,
    questSizes: [2, 3, 3, 4, 4],
    round4RequiresTwoFails: true,
  },
  8: {
    playerCount: 8,
    goodCount: 5,
    evilCount: 3,
    questSizes: [3, 4, 4, 5, 5],
    round4RequiresTwoFails: true,
  },
  9: {
    playerCount: 9,
    goodCount: 6,
    evilCount: 3,
    questSizes: [3, 4, 4, 5, 5],
    round4RequiresTwoFails: true,
  },
  10: {
    playerCount: 10,
    goodCount: 6,
    evilCount: 4,
    questSizes: [3, 4, 4, 5, 5],
    round4RequiresTwoFails: true,
  },
};

// 역할 풀 (인원수별)
const ROLE_POOLS: Record<number, Role[]> = {
  5: ["JUNGJO", "JUNGYAKYONG", "GYUJANGGAK", "JAGAP", "NORON_BYOKPA"],
  6: ["JUNGJO", "JUNGYAKYONG", "GYUJANGGAK", "GYUJANGGAK", "JAGAP", "NORON_BYOKPA"],
  7: [
    "JUNGJO",
    "JUNGYAKYONG",
    "GYUJANGGAK",
    "GYUJANGGAK",
    "JAGAP",
    "SIMHWANJI",
    "JEONGSUNWANGHU",
  ],
  8: [
    "JUNGJO",
    "JUNGYAKYONG",
    "GYUJANGGAK",
    "GYUJANGGAK",
    "GYUJANGGAK",
    "JAGAP",
    "SIMHWANJI",
    "JEONGSUNWANGHU",
  ],
  9: [
    "JUNGJO",
    "JUNGYAKYONG",
    "GYUJANGGAK",
    "GYUJANGGAK",
    "GYUJANGGAK",
    "GYUJANGGAK",
    "JAGAP",
    "SIMHWANJI",
    "HONGGUKYEONG",
  ],
  10: [
    "JUNGJO",
    "JUNGYAKYONG",
    "GYUJANGGAK",
    "GYUJANGGAK",
    "GYUJANGGAK",
    "GYUJANGGAK",
    "JAGAP",
    "SIMHWANJI",
    "JEONGSUNWANGHU",
    "HONGGUKYEONG",
  ],
};

// 역할 → 팀 매핑
const ROLE_TO_TEAM: Record<Role, Team> = {
  JUNGJO: "GOOD",
  JUNGYAKYONG: "GOOD",
  GYUJANGGAK: "GOOD",
  JAGAP: "EVIL",
  SIMHWANJI: "EVIL",
  JEONGSUNWANGHU: "EVIL",
  HONGGUKYEONG: "EVIL",
  NORON_BYOKPA: "EVIL",
};

// ============ 유틸리티 ============

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function addLog(state: AvalonMatchState, message: string): AvalonMatchState {
  const log = state.gameLog ?? [];
  return { ...state, gameLog: [message, ...log] };
}

// ============ 엔진 함수 ============

/**
 * 로비 상태 생성 (모두 입장 후 준비 누르면 createAvalonGame으로 전환)
 */
export function createAvalonLobby(
  playerCount: number,
  names: string[],
): AvalonMatchState {
  const config = AVALON_CONFIGS[playerCount];
  if (!config) {
    throw new Error(
      `지원하지 않는 인원수: ${playerCount}. 5~10명만 가능합니다.`,
    );
  }

  const playerIds = Array.from({ length: playerCount }, (_, i) => String(i));
  const players: AvalonPlayer[] = playerIds.map((id, i) => ({
    id,
    name: names[i] ?? `플레이어 ${i + 1}`,
    role: "GYUJANGGAK", // 로비에서는 미사용 (표시 안 함)
    team: "GOOD",
    isLeader: false,
    vote: null,
    questCard: null,
  }));

  return {
    config,
    phase: "LOBBY",
    currentRound: 1,
    questTrack: [null, null, null, null, null],
    rejectTrack: 0,
    proposedTeam: [],
    players,
    questResultsShuffled: [],
    assassinationTarget: null,
    winner: null,
    readyPlayerIds: [],
    gameLog: [],
  };
}

/**
 * 게임 생성 및 초기화 (로비에서 모두 준비 시 호출)
 */
export function createAvalonGame(
  playerIds: string[],
  playerNames: string[],
): AvalonMatchState {
  const count = playerIds.length;
  const config = AVALON_CONFIGS[count];
  if (!config) {
    throw new Error(`지원하지 않는 인원수: ${count}. 5~10명만 가능합니다.`);
  }

  // 역할 무작위 분배
  const roles = shuffle(ROLE_POOLS[count] ?? []);
  const players: AvalonPlayer[] = playerIds.map((id, i) => ({
    id,
    name: playerNames[i] ?? `플레이어 ${i + 1}`,
    role: roles[i],
    team: ROLE_TO_TEAM[roles[i]],
    isLeader: i === 0,
    vote: null,
    questCard: null,
  }));

  return addLog(
    {
      config,
      phase: "NIGHT",
      currentRound: 1,
      questTrack: [null, null, null, null, null],
      rejectTrack: 0,
      proposedTeam: [],
      players,
      questResultsShuffled: [],
      assassinationTarget: null,
      winner: null,
      gameLog: [],
    },
    "게임이 시작되었습니다.",
  );
}

/**
 * 밤 단계 - 플레이어 확인 추가. 전원 확인 시 팀 빌딩으로 전환
 */
export function confirmNightPhase(
  state: AvalonMatchState,
  playerId: string,
): AvalonMatchState {
  if (state.phase !== "NIGHT") return state;
  const confirmIds = state.nightConfirmPlayerIds ?? [];
  if (confirmIds.includes(playerId)) return state;
  const newConfirmIds = [...confirmIds, playerId];
  const playerCount = state.config.playerCount;
  const allConfirmed = newConfirmIds.length >= playerCount;

  if (allConfirmed) {
    return addLog(
      { ...state, phase: "SIMYANGDAN_SETUP" },
      "모든 플레이어가 역할을 확인했습니다. 1라운드 사명단 구성을 시작합니다.",
    );
  }
  return {
    ...state,
    nightConfirmPlayerIds: newConfirmIds,
  };
}

/**
 * 각 플레이어에게 보여줄 밤 단계 정보 (정보 비대칭)
 */
export function getNightVision(
  state: AvalonMatchState,
  playerId: string,
): NightVision {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return {
      myRole: "GYUJANGGAK",
      myTeam: "GOOD",
      knownEvil: [],
      knownMerlinCandidates: [],
      knownEvilTeammates: [],
    };
  }

  const { role, team } = player;

  // 멀린: 모든 악을 알 수 있음. 단, 모드레드는 선으로 보임
  if (role === "JUNGJO") {
    const knownEvil = state.players
      .filter((p) => p.team === "EVIL" && p.role !== "JEONGSUNWANGHU")
      .map((p) => p.id);
    return {
      myRole: role,
      myTeam: team,
      knownEvil,
      knownMerlinCandidates: [],
      knownEvilTeammates: [],
    };
  }

  // 퍼시벌: 멀린과 모르가나를 알 수 있음 (둘 다 '멀린'으로 보임)
  if (role === "JUNGYAKYONG") {
    const jungjo = state.players.find((p) => p.role === "JUNGJO");
    const simhwanji = state.players.find((p) => p.role === "SIMHWANJI");
    const candidates = [jungjo?.id, simhwanji?.id].filter(Boolean) as string[];
    return {
      myRole: role,
      myTeam: team,
      knownEvil: [],
      knownMerlinCandidates: candidates,
      knownEvilTeammates: [],
    };
  }

  // 악의 세력 (일반 악, 암살자, 모르가나, 모드레드): 서로를 알 수 있음. 오베론 제외
  if (team === "EVIL") {
    const knownEvilTeammates = state.players
      .filter(
        (p) => p.team === "EVIL" && p.role !== "HONGGUKYEONG" && p.id !== playerId,
      )
      .map((p) => p.id);
    return {
      myRole: role,
      myTeam: team,
      knownEvil: [],
      knownMerlinCandidates: [],
      knownEvilTeammates,
    };
  }

  // 일반 선, 오베론: 자신 외 정보 없음
  return {
    myRole: role,
    myTeam: team,
    knownEvil: [],
    knownMerlinCandidates: [],
    knownEvilTeammates: [],
  };
}

/** 플레이어 역할 정보 (룰북 등에서 항상 표시용) */
export interface PlayerRoleInfo {
  myRole: Role;
  myTeam: Team;
}

/**
 * 플레이어의 역할 정보 반환 (게임 중 항상 알 수 있는 정보)
 */
export function getPlayerRoleInfo(
  state: AvalonMatchState,
  playerId: string,
): PlayerRoleInfo | null {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return null;
  return {
    myRole: player.role,
    myTeam: player.team,
  };
}

/**
 * Phase 1: 원정대 구성 - 원정대장이 팀 제안
 */
export function proposeTeam(
  state: AvalonMatchState,
  leaderId: string,
  teamMemberIds: string[],
): { success: boolean; state: AvalonMatchState; error?: string } {
  if (state.phase !== "SIMYANGDAN_SETUP") {
    return { success: false, state, error: "사명단 구성 단계가 아닙니다." };
  }

  const leader = state.players.find((p) => p.id === leaderId);
  if (!leader?.isLeader) {
    return {
      success: false,
      state,
      error: "사명장만 팀을 제안할 수 있습니다.",
    };
  }

  const requiredSize = state.config.questSizes[state.currentRound - 1];
  if (teamMemberIds.length !== requiredSize) {
    return {
      success: false,
      state,
      error: `사명단은 정확히 ${requiredSize}명이어야 합니다.`,
    };
  }

  const validIds = new Set(state.players.map((p) => p.id));
  const allValid = teamMemberIds.every((id) => validIds.has(id));
  if (!allValid) {
    return {
      success: false,
      state,
      error: "유효하지 않은 플레이어가 포함되어 있습니다.",
    };
  }

  const uniqueTeam = [...new Set(teamMemberIds)];
  if (uniqueTeam.length !== requiredSize) {
    return { success: false, state, error: "중복된 플레이어가 있습니다." };
  }

  // 투표 단계로 전환, 모든 플레이어 투표 초기화
  const playersWithResetVote = state.players.map((p) => ({ ...p, vote: null }));
  const leaderName = leader.name;
  const teamNames = teamMemberIds
    .map((id) => state.players.find((p) => p.id === id)?.name ?? "?")
    .join(", ");
  const logMsg = `사명장 ${leaderName}이(가) 사명단을 제안했습니다: ${teamNames}`;

  return {
    success: true,
    state: addLog(
      {
        ...state,
        phase: "VOTING",
        proposedTeam: teamMemberIds,
        players: playersWithResetVote,
      },
      logMsg,
    ),
  };
}

/**
 * Phase 2: 찬반 투표
 */
export function submitVote(
  state: AvalonMatchState,
  playerId: string,
  vote: Vote,
): { success: boolean; state: AvalonMatchState; error?: string } {
  if (state.phase !== "VOTING") {
    return { success: false, state, error: "투표 단계가 아닙니다." };
  }

  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    return { success: false, state, error: "플레이어를 찾을 수 없습니다." };
  }

  const players = state.players.map((p) =>
    p.id === playerId ? { ...p, vote } : p,
  );

  const allVoted = players.every((p) => p.vote !== null);
  if (!allVoted) {
    return {
      success: true,
      state: { ...state, players },
    };
  }

  // 투표 결과 집계
  const approveCount = players.filter((p) => p.vote === "APPROVE").length;
  const rejectCount = players.filter((p) => p.vote === "REJECT").length;
  const totalPlayers = players.length;
  const majority = totalPlayers / 2;
  const lastVoteResult = {
    approveCount,
    rejectCount,
    passed: approveCount > majority,
  };

  const voteLog = `투표 결과: 찬성 ${approveCount} / 반대 ${rejectCount} - ${approveCount > majority ? "가결" : "부결"}`;

  if (approveCount > majority) {
    // 가결 → 퀘스트 수행으로
    return {
      success: true,
      state: addLog(
        {
          ...state,
          players,
          phase: "SIMYANG",
          rejectTrack: 0, // 사명 출발 시 부결 카운트 초기화
          lastVoteResult,
        },
        voteLog,
      ),
    };
  }

  // 부결 → 사명장 넘기고 Reject Track +1
  const leaderIndex = state.players.findIndex((p) => p.isLeader);
  const nextLeaderIndex = (leaderIndex + 1) % state.players.length;
  const newRejectTrack = state.rejectTrack + 1;

  const playersWithNewLeader = players.map((p, i) => ({
    ...p,
    isLeader: i === nextLeaderIndex,
    vote: null,
  }));

  // Reject Track 5 도달 시 악의 즉시 승리
  if (newRejectTrack >= 5) {
    return {
      success: true,
      state: addLog(
        {
          ...state,
          players: playersWithNewLeader,
          phase: "END",
          rejectTrack: newRejectTrack,
          winner: "EVIL",
          lastVoteResult,
        },
        "부결 5회 - 노론 벽파의 승리!",
      ),
    };
  }

  return {
    success: true,
    state: addLog(
      {
        ...state,
        players: playersWithNewLeader,
        phase: "SIMYANGDAN_SETUP",
        proposedTeam: [],
        rejectTrack: newRejectTrack,
        lastVoteResult,
      },
      voteLog,
    ),
  };
}

/**
 * 여러 클라이언트의 동시 투표를 병합한 뒤 결과 처리
 * (race condition 방지: 저장 직전 최신 상태와 병합)
 */
export function mergeVotesAndProcess(
  baseState: AvalonMatchState,
  incomingState: AvalonMatchState,
): AvalonMatchState {
  if (baseState.phase !== "VOTING" || incomingState.phase !== "VOTING") {
    return incomingState;
  }

  const mergedPlayers = baseState.players.map((p) => {
    const incoming = incomingState.players.find((x) => x.id === p.id);
    const vote = incoming?.vote ?? p.vote;
    return { ...p, vote };
  });

  const allVoted = mergedPlayers.every((p) => p.vote !== null);
  if (!allVoted) {
    return { ...baseState, players: mergedPlayers };
  }

  const approveCount = mergedPlayers.filter((p) => p.vote === "APPROVE").length;
  const rejectCount = mergedPlayers.filter((p) => p.vote === "REJECT").length;
  const totalPlayers = mergedPlayers.length;
  const majority = totalPlayers / 2;
  const lastVoteResult = {
    approveCount,
    rejectCount,
    passed: approveCount > majority,
  };
  const voteLog = `투표 결과: 찬성 ${approveCount} / 반대 ${rejectCount} - ${approveCount > majority ? "가결" : "부결"}`;

  if (approveCount > majority) {
    return addLog(
      {
        ...baseState,
        players: mergedPlayers,
        phase: "SIMYANG",
        rejectTrack: 0,
        lastVoteResult,
      },
      voteLog,
    );
  }

  const leaderIndex = baseState.players.findIndex((p) => p.isLeader);
  const nextLeaderIndex = (leaderIndex + 1) % baseState.players.length;
  const newRejectTrack = baseState.rejectTrack + 1;

  const playersWithNewLeader = mergedPlayers.map((p, i) => ({
    ...p,
    isLeader: i === nextLeaderIndex,
    vote: null,
  }));

  if (newRejectTrack >= 5) {
    return addLog(
      {
        ...baseState,
        players: playersWithNewLeader,
        phase: "END",
        rejectTrack: newRejectTrack,
        winner: "EVIL",
        lastVoteResult,
      },
      "부결 5회 - 역적의 승리!",
    );
  }

  return addLog(
    {
      ...baseState,
      players: playersWithNewLeader,
      phase: "SIMYANGDAN_SETUP",
      proposedTeam: [],
      rejectTrack: newRejectTrack,
      lastVoteResult,
    },
    voteLog,
  );
}

/**
 * Phase 3: 퀘스트 카드 제출
 */
export function submitQuestCard(
  state: AvalonMatchState,
  playerId: string,
  card: QuestCard,
): { success: boolean; state: AvalonMatchState; error?: string } {
  if (state.phase !== "SIMYANG") {
    return { success: false, state, error: "퀘스트 수행 단계가 아닙니다." };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return { success: false, state, error: "플레이어를 찾을 수 없습니다." };
  }

  if (!state.proposedTeam.includes(playerId)) {
    return {
      success: false,
      state,
      error: "사명단원만 카드를 제출할 수 있습니다.",
    };
  }

  if (player.questCard !== null) {
    return {
      success: false,
      state,
      error: "이미 카드를 제출했습니다.",
    };
  }

  // 선(GOOD) 진영은 무조건 성공만 제출 가능
  if (player.team === "GOOD" && card === "FAIL") {
    return {
      success: false,
      state,
      error: "선의 세력은 성공 카드만 제출할 수 있습니다.",
    };
  }

  const players = state.players.map((p) =>
    p.id === playerId ? { ...p, questCard: card } : p,
  );

  const questMembers = state.proposedTeam;
  const allSubmitted = questMembers.every((id) => {
    const p = players.find((x) => x.id === id);
    return p?.questCard !== null;
  });

  if (!allSubmitted) {
    return {
      success: true,
      state: { ...state, players },
    };
  }

  // 카드 수집 후 셔플하여 공개
  const cards = questMembers
    .map((id) => players.find((p) => p.id === id)!.questCard!)
    .filter(Boolean);
  const shuffled = shuffle(cards);

  const failCount = shuffled.filter((c) => c === "FAIL").length;
  const round4Special =
    state.config.round4RequiresTwoFails && state.currentRound === 4;
  const questSuccess = round4Special ? failCount < 2 : failCount === 0;

  const newQuestTrack = [...state.questTrack];
  newQuestTrack[state.currentRound - 1] = questSuccess ? "SUCCESS" : "FAIL";
  const roundLog = `라운드 ${state.currentRound} 사명: ${questSuccess ? "성공!" : "실패!"}`;

  const successCount = newQuestTrack.filter((r) => r === "SUCCESS").length;
  const failRoundCount = newQuestTrack.filter((r) => r === "FAIL").length;

  // 퀘스트 3번 실패 → 악의 즉시 승리
  if (failRoundCount >= 3) {
    const resetPlayers = players.map((p) => ({
      ...p,
      vote: null,
      questCard: null,
      isLeader: false,
    }));
    const nextLeaderIndex =
      (state.players.findIndex((p) => p.isLeader) + 1) % state.players.length;
    const finalPlayers = resetPlayers.map((p, i) => ({
      ...p,
      isLeader: i === nextLeaderIndex,
    }));

    return {
      success: true,
      state: addLog(
        addLog(
          {
            ...state,
            players: finalPlayers,
            phase: "END",
            questTrack: newQuestTrack,
            questResultsShuffled: shuffled,
            proposedTeam: [],
            winner: "EVIL",
          },
          "사명 3번 실패 - 노론 벽파의 승리!",
        ),
        roundLog,
      ),
    };
  }

  // 퀘스트 3번 성공 → 암살 단계
  if (successCount >= 3) {
    const resetPlayers = players.map((p) => ({
      ...p,
      vote: null,
      questCard: null,
    }));

    return {
      success: true,
      state: addLog(
        addLog(
          {
            ...state,
            players: resetPlayers,
            phase: "JAGAP_PHASE",
            questTrack: newQuestTrack,
            questResultsShuffled: shuffled,
            proposedTeam: [],
          },
          "사명 3번 성공 - 암살 단계로 진입",
        ),
        roundLog,
      ),
    };
  }

  // 다음 라운드
  const nextRound = state.currentRound + 1;
  const resetPlayers = players.map((p) => ({
    ...p,
    vote: null,
    questCard: null,
    isLeader: false,
  }));
  const currentLeaderIndex = state.players.findIndex((p) => p.isLeader);
  const nextLeaderIndex = (currentLeaderIndex + 1) % state.players.length;
  const finalPlayers = resetPlayers.map((p, i) => ({
    ...p,
    isLeader: i === nextLeaderIndex,
  }));

  const nextRoundLog = `${nextRound}라운드 사명단 구성을 시작합니다.`;

  return {
    success: true,
    state: addLog(
      addLog(
        {
          ...state,
          players: finalPlayers,
          currentRound: nextRound,
          phase: "SIMYANGDAN_SETUP",
          questTrack: newQuestTrack,
          questResultsShuffled: shuffled,
          proposedTeam: [],
          lastVoteResult: undefined, // next round
        },
        nextRoundLog,
      ),
      roundLog,
    ),
  };
}

/**
 * Phase 4: 암살 - 암살자가 멀린 후보 1명 지목
 */
export function submitAssassination(
  state: AvalonMatchState,
  assassinId: string,
  targetId: string,
): { success: boolean; state: AvalonMatchState; error?: string } {
  if (state.phase !== "JAGAP_PHASE") {
    return { success: false, state, error: "암살 단계가 아닙니다." };
  }

  const assassin = state.players.find((p) => p.id === assassinId);
  if (!assassin || assassin.role !== "JAGAP") {
    return { success: false, state, error: "암살자만 지목할 수 있습니다." };
  }

  const target = state.players.find((p) => p.id === targetId);
  if (!target) {
    return { success: false, state, error: "유효하지 않은 타겟입니다." };
  }

  const isJungjo = target.role === "JUNGJO";
  const targetName = target.name;
  const resultLog = isJungjo
    ? "정조 암살 성공 - 노론 벽파의 승리!"
    : "정조 암살 실패 - 규장각의 승리!";

  return {
    success: true,
    state: addLog(
      addLog(
        {
          ...state,
          phase: "END",
          assassinationTarget: targetId,
          winner: isJungjo ? "EVIL" : "GOOD",
        },
        resultLog,
      ),
      `존현각 자객이 ${targetName}을(를) 지목했습니다.`,
    ),
  };
}

// ============ 클라이언트용 뷰 생성 ============

/**
 * 특정 플레이어에게 보여줄 공개 상태 (역할/팀 등 비공개)
 */
export function getPublicStateForPlayer(
  state: AvalonMatchState,
  playerId: string,
): {
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
} {
  const proposedSet = new Set(state.proposedTeam);
  const votesRevealed =
    state.phase !== "VOTING" || state.players.every((p) => p.vote !== null);
  const readySet = new Set(state.readyPlayerIds ?? []);

  const revealRoles = state.phase === "END";
  const players: AvalonPlayerPublic[] = state.players.map((p) => ({
    id: p.id,
    name: p.name,
    isLeader: p.isLeader,
    isOnQuest: proposedSet.has(p.id),
    vote: votesRevealed ? p.vote : null,
    isReady: state.phase === "LOBBY" ? readySet.has(p.id) : undefined,
    ...(revealRoles && { role: p.role, team: p.team }),
  }));

  const leader = state.players.find((p) => p.isLeader);
  const isLeader = leader?.id === playerId;
  const isOnQuest = proposedSet.has(playerId);
  const isAssassin =
    state.players.find((p) => p.id === playerId)?.role === "JAGAP";
  const hasVoted =
    state.phase === "VOTING" &&
    (state.players.find((p) => p.id === playerId)?.vote ?? null) !== null;
  const hasSubmittedQuestCard =
    state.phase === "SIMYANG" &&
    (state.players.find((p) => p.id === playerId)?.questCard ?? null) !== null;

  return {
    config: state.config,
    phase: state.phase,
    currentRound: state.currentRound,
    questTrack: state.questTrack,
    rejectTrack: state.rejectTrack,
    proposedTeam: state.proposedTeam,
    players,
    questResultsShuffled: state.questResultsShuffled,
    canProposeTeam: state.phase === "SIMYANGDAN_SETUP" && isLeader,
    canVote: state.phase === "VOTING",
    hasVoted,
    canSubmitQuestCard:
      state.phase === "SIMYANG" && isOnQuest && !hasSubmittedQuestCard,
    hasSubmittedQuestCard,
    canAssassinate: state.phase === "JAGAP_PHASE" && isAssassin,
    winner: state.winner,
    assassinationTarget: state.assassinationTarget,
    readyPlayerIds: state.phase === "LOBBY" ? state.readyPlayerIds : undefined,
    nightConfirmPlayerIds:
      state.phase === "NIGHT" ? state.nightConfirmPlayerIds : undefined,
    lastVoteResult: state.lastVoteResult,
    gameLog: state.gameLog ?? [],
  };
}

/**
 * 게임 설정 검증 (인원수)
 */
export function getConfigForPlayerCount(count: number): AvalonConfig | null {
  return AVALON_CONFIGS[count] ?? null;
}
