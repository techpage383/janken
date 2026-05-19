CREATE TABLE IF NOT EXISTS players (
  name VARCHAR(128) NOT NULL PRIMARY KEY,
  wallet VARCHAR(256) NOT NULL,
  balance DECIMAL(12, 2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  host VARCHAR(128) NOT NULL,
  max_players TINYINT NOT NULL DEFAULT 2,
  stake TINYINT NOT NULL,
  status VARCHAR(32) NOT NULL,
  players TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  CONSTRAINT chk_rooms_stake CHECK (stake IN (10, 20, 50, 100)),
  CONSTRAINT chk_rooms_status CHECK (status IN ('waiting', 'playing', 'finished')),
  KEY idx_rooms_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  room_id VARCHAR(128) NOT NULL,
  room_name VARCHAR(200) NOT NULL,
  stake INT NOT NULL,
  winner VARCHAR(128) NOT NULL,
  loser VARCHAR(128) NOT NULL,
  winner_hand VARCHAR(16) NOT NULL,
  loser_hand VARCHAR(16) NOT NULL,
  payout DECIMAL(12, 2) NOT NULL,
  finished_at BIGINT NOT NULL,
  CONSTRAINT fk_matches_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
  CONSTRAINT chk_winner_hand CHECK (winner_hand IN ('rock', 'paper', 'scissors')),
  CONSTRAINT chk_loser_hand CHECK (loser_hand IN ('rock', 'paper', 'scissors')),
  KEY idx_matches_finished_at (finished_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
