-- 아발론 게임 접속 중인 플레이어 (슬롯 점유 추적)
CREATE TABLE IF NOT EXISTS avalon_connected_players (
  game_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (game_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_avalon_connected_game_id ON avalon_connected_players(game_id);
