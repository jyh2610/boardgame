-- 아발론 게임 채팅 테이블
CREATE TABLE IF NOT EXISTS avalon_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id BIGINT NOT NULL REFERENCES avalon_games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_avalon_chat_game_id ON avalon_chat(game_id);
CREATE INDEX IF NOT EXISTS idx_avalon_chat_created_at ON avalon_chat(created_at);

-- API 라우트에서 SUPABASE_SERVICE_ROLE_KEY 사용 시 RLS 우회됨
