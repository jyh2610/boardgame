/**
 * 조선비사 - 정조 시대 (규장각 vs 노론 벽파) 배경 테마
 * 역할 표시명 및 게임 용어
 */

import type { Role } from "./avalon-engine";

/** 게임 타이틀 */
export const GAME_TITLE = "조선비사";

/** 역할 → 정조 시대 인물 표시명 */
export const ROLE_NAMES: Record<Role, string> = {
  JUNGJO: "정조",
  JUNGYAKYONG: "정약용",
  GYUJANGGAK: "규장각 각신",
  JAGAP: "존현각 자객",
  SIMHWANJI: "심환지",
  JEONGSUNWANGHU: "정순왕후",
  HONGGUKYEONG: "홍국영",
  NORON_BYOKPA: "노론 벽파",
};

/** 게임 용어 */
export const TERMS = {
  mission: "사명",
  missionTeam: "사명단",
  missionLeader: "사명장",
  good: "규장각",
  evil: "노론 벽파",
  goodForce: "규장각",
  evilForce: "노론 벽파",
  merlinCandidate: "정조 후보",
  assassination: "암살",
  assassinName: "존현각 자객",
} as const;
