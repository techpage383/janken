# Express API (`server/`)

- **`index.ts`** — DB migrate → seed → listen
- **`app.ts`** — すべての HTTP ルート + エラー処理
- **`db/repos.ts`** — MySQL（rooms / matches / players）
- **`db/`** — schema, migrate, seed, pool

新しい API を足すとき: `app.ts` にルートを追加 → `repos.ts` に SQL を追加 → `src/lib/api.ts` と `src/lib/queries.ts` を更新。

詳細は [docs/STUDY.md](../docs/STUDY.md)。
