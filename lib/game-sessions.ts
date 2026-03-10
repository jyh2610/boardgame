/**
 * Supabase 기반 게임 세션 저장소 (REST API용)
 */
import type { GameState } from "./game-engine";
import { supabase } from "./supabase-server";

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

export async function createSession(state: GameState): Promise<{
  gameId: string;
  code: string;
}> {
  const gameId = generateId();
  const code = generateCode();

  const { error } = await supabase.from("games").insert({
    id: gameId,
    code: code.toUpperCase(),
    state,
  });

  if (error) {
    if (error.code === "23505") {
      return createSession(state);
    }
    throw new Error(`세션 생성 실패: ${error.message}`);
  }

  return { gameId, code: code.toUpperCase() };
}

export async function getSession(gameId: string): Promise<GameState | null> {
  const { data, error } = await supabase
    .from("games")
    .select("state")
    .eq("id", gameId)
    .single();

  if (error || !data) return null;
  return data.state as GameState;
}

export async function updateSession(
  gameId: string,
  state: GameState
): Promise<void> {
  const { error } = await supabase
    .from("games")
    .update({ state })
    .eq("id", gameId);

  if (error) {
    throw new Error(`세션 업데이트 실패: ${error.message}`);
  }
}

export async function getGameIdByCode(code: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("games")
    .select("id")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !data) return null;
  return data.id;
}

export async function getCodeByGameId(gameId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("games")
    .select("code")
    .eq("id", gameId)
    .single();

  if (error || !data) return null;
  return data.code;
}

export async function deleteSession(gameId: string): Promise<void> {
  await supabase.from("games").delete().eq("id", gameId);
}
