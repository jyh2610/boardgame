/**
 * 아발론 게임 채팅 저장소 (Supabase)
 */
import { supabase } from "./supabase-server";

export interface ChatMessage {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  message: string;
  createdAt: string;
}

export async function getChatMessages(
  gameId: string,
  limit = 100
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("avalon_chat")
    .select("id, game_id, player_id, player_name, message, created_at")
    .eq("game_id", gameId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`채팅 로드 실패: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    gameId: row.game_id,
    playerId: row.player_id,
    playerName: row.player_name,
    message: row.message,
    createdAt: row.created_at,
  }));
}

export async function sendChatMessage(
  gameId: string,
  playerId: string,
  playerName: string,
  message: string
): Promise<ChatMessage> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("메시지를 입력하세요.");
  }

  const { data, error } = await supabase
    .from("avalon_chat")
    .insert({
      game_id: gameId,
      player_id: playerId,
      player_name: playerName,
      message: trimmed,
    })
    .select("id, game_id, player_id, player_name, message, created_at")
    .single();

  if (error) {
    throw new Error(`채팅 전송 실패: ${error.message}`);
  }

  return {
    id: data.id,
    gameId: data.game_id,
    playerId: data.player_id,
    playerName: data.player_name,
    message: data.message,
    createdAt: data.created_at,
  };
}
