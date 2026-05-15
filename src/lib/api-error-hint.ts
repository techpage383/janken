import { getApiBase } from "@/lib/api";
import { PLAYER_NAME } from "@/lib/player";

/** User-facing hint when TanStack Query reports a failed API request. */
export function describeApiFailure(error: unknown): string {
  const base = getApiBase();
  if (error instanceof Error) {
    const m = error.message;
    if (m.includes("404") && m.includes("/api/me")) {
      return `プレイヤー「${PLAYER_NAME}」が API で見つかりません（404）。DB をシードするか、.env の VITE_PLAYER_NAME を players テーブルの name に合わせてください。（API: ${base}）`;
    }
    if (m.includes("Failed to fetch") || m.includes("NetworkError")) {
      return `接続先 ${base} に到達できません。ターミナルで npm run dev:server を実行し、MySQL が起動しているか確認してください。ブラウザのアドレス（例: http://localhost:8080）が .env の CORS_ORIGIN に含まれている必要があります。`;
    }
    return `${m}（接続先: ${base}）`;
  }
  return `接続先 ${base} を確認してください。`;
}
