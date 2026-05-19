# BLOCK-JANKEN — 学習用ガイド（簡略版）

## フォルダ構成

```
src/
  main.tsx          … ルーティング + レイアウト
  pages/            … 画面（5ページ）
  components/       … AppShell, RoomCard, Toaster
  lib/
    types.ts        … 型 + コイン表示
    api.ts          … fetch + エラーメッセージ
    queries.ts      … React Query（データ取得）
    player.ts       … プレイヤー名（.env）

server/
  index.ts          … 起動（DB → サーバー）
  app.ts            … Express + 全 API
  config.ts         … ポート・MySQL・CORS
  db/
    schema.sql      … テーブル定義
    migrate.ts      … マイグレーション
    seed.ts         … 初回データ投入
    seed-data.ts    … サンプルデータ
    repos.ts        … MySQL 読み書き
    pool.ts         … 接続
```

## データの流れ

1. ブラウザ `http://localhost:8080`（Vite）
2. `/api/*` は Vite が `http://localhost:3000`（Express）へ転送
3. Express → `repos.ts` → MySQL

## API 一覧

| メソッド | パス | 内容 |
|---------|------|------|
| GET | `/api/rooms` | ルーム一覧 |
| POST | `/api/rooms` | ルーム作成（stake: 10/20/50/100） |
| GET | `/api/rooms/:id` | ルーム詳細 |
| GET | `/api/matches` | 対戦履歴 |
| GET | `/api/me` | 自分のプロフィール（ヘッダ `X-Player-Name`） |
| GET | `/api/stats/dashboard` | トップ用まとめ |

## 仮想コイン

- ルームのベット: **10 / 20 / 50 / 100 コイン**
- プレイヤー残高は `players.balance`（サイト内通貨）

## 起動

```bash
# .env をコピーして MySQL で DB `janken` を作成
npm run dev
```

## デモの限界（意図的にシンプル）

- ルーム内のじゃんけん・着席は **画面だけ**（DB に保存しない）
- 残高はシード値；マイページのグラフは履歴からの試算
