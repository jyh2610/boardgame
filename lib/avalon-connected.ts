/**
 * 아발론 게임 접속 플레이어 (슬롯 점유) 관리
 */
import { supabase } from "./supabase-server";
import { getAvalonSession, updateAvalonSession } from "./avalon-sessions";
import type { AvalonMatchState } from "./avalon-engine";

export async function getConnectedPlayerIds(gameId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("avalon_connected_players")
    .select("player_id")
    .eq("game_id", gameId);

  if (error) return [];
  return (data ?? []).map((r) => r.player_id);
}

export async function isPlayerClaimed(
  gameId: string,
  playerId: string,
): Promise<boolean> {
  const ids = await getConnectedPlayerIds(gameId);
  return ids.includes(playerId);
}

export async function claimPlayerSlot(
  gameId: string,
  playerId: string,
  displayName: string,
): Promise<{ success: boolean; error?: string }> {
  const state = await getAvalonSession(gameId);
  if (!state) {
    return { success: false, error: "게임을 찾을 수 없습니다." };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return { success: false, error: "유효하지 않은 플레이어입니다." };
  }

  const connected = await getConnectedPlayerIds(gameId);
  if (connected.includes(playerId)) {
    return { success: false, error: "이미 선택된 플레이어입니다." };
  }

  const playerCount = state.config.playerCount;
  if (connected.length >= playerCount) {
    return { success: false, error: "방이 가득 찼습니다." };
  }

  const trimmedName = displayName.trim() || player.name;

  const { error: insertError } = await supabase
    .from("avalon_connected_players")
    .insert({
      game_id: gameId,
      player_id: playerId,
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return { success: false, error: "이미 선택된 플레이어입니다." };
    }
    return { success: false, error: insertError.message };
  }

  const updatedPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, name: trimmedName } : p,
  );
  const updatedState: AvalonMatchState = {
    ...state,
    players: updatedPlayers,
  };

  await updateAvalonSession(gameId, updatedState);

  return { success: true };
}
