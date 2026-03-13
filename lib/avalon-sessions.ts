/**
 * Supabase 기반 아발론 게임 세션 저장소
 */
import type { AvalonMatchState } from "./avalon-engine";
import { supabase } from "./supabase-server";

/** bigint 호환 숫자 ID 생성 (DB id 컬럼이 bigint인 경우) */
function generateId(): string {
  const num = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  return String(num);
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createAvalonSession(
  state: AvalonMatchState,
): Promise<{ gameId: string; code: string }> {
  const gameId = generateId();
  const code = generateCode();

  const { error } = await supabase.from("avalon_games").insert({
    id: gameId,
    code: code.toUpperCase(),
    state,
  });

  if (error) {
    if (error.code === "23505") {
      return createAvalonSession(state);
    }
    throw new Error(`세션 생성 실패: ${error.message}`);
  }

  return { gameId, code: code.toUpperCase() };
}

export async function getAvalonSession(
  gameId: string,
): Promise<AvalonMatchState | null> {
  const { data, error } = await supabase
    .from("avalon_games")
    .select("state")
    .eq("id", gameId)
    .single();

  if (error || !data) return null;
  return data.state as AvalonMatchState;
}

export async function updateAvalonSession(
  gameId: string,
  state: AvalonMatchState,
): Promise<void> {
  const { error } = await supabase
    .from("avalon_games")
    .update({ state })
    .eq("id", gameId);

  if (error) {
    throw new Error(`세션 업데이트 실패: ${error.message}`);
  }
}

export async function getAvalonGameIdByCode(
  code: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("avalon_games")
    .select("id")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !data) return null;
  return data.id;
}

export async function getAvalonCodeByGameId(
  gameId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("avalon_games")
    .select("code")
    .eq("id", gameId)
    .single();

  if (error || !data) return null;
  return data.code;
}
