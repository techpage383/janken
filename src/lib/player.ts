/** Display name sent as X-Player-Name and used when creating rooms. Must match a row in DB `players` (seed default: Player_404). */
export const PLAYER_NAME = import.meta.env.VITE_PLAYER_NAME ?? "Player_404";
