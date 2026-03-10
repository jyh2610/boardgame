/**
 * 인메모리 게임 세션 저장소 (REST API용)
 * 개발 시 핫 리로드해도 세션 유지 (globalThis 사용)
 */
import type { GameState } from "./game-engine";

const globalForGames = globalThis as unknown as {
  games: Map<string, GameState>;
  codeToId: Map<string, string>;
  idToCode: Map<string, string>;
};

if (!globalForGames.games) {
  globalForGames.games = new Map();
  globalForGames.codeToId = new Map();
  globalForGames.idToCode = new Map();
}

const games = globalForGames.games;
const codeToId = globalForGames.codeToId;
const idToCode = globalForGames.idToCode;

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createSession(state: GameState): {
  gameId: string;
  code: string;
} {
  let gameId = generateId();
  while (games.has(gameId)) gameId = generateId();

  let code = generateCode();
  while (codeToId.has(code)) code = generateCode();

  games.set(gameId, state);
  codeToId.set(code, gameId);
  idToCode.set(gameId, code);
  return { gameId, code };
}

export function getSession(gameId: string): GameState | null {
  return games.get(gameId) ?? null;
}

export function updateSession(gameId: string, state: GameState): void {
  games.set(gameId, state);
}

export function getGameIdByCode(code: string): string | null {
  return codeToId.get(code.toUpperCase()) ?? null;
}

export function getCodeByGameId(gameId: string): string | null {
  return idToCode.get(gameId) ?? null;
}

export function deleteSession(gameId: string): void {
  const code = idToCode.get(gameId);
  if (code) {
    codeToId.delete(code);
    idToCode.delete(gameId);
  }
  games.delete(gameId);
}
