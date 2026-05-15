# Study guide

This file is a reading order for the codebase. The main setup steps are in [README.md](../README.md).

## 1. Boot sequence

Read in this order:

1. `server/index.ts` — migrate, seed, start listening  
2. `server/app.ts` — CORS, JSON body, mount routers, static `dist/` in production  
3. `src/main.tsx` — React root, React Query, router  

## 2. One feature end-to-end: room list

| Step | File | What to notice |
|------|------|----------------|
| UI | `src/pages/RoomsPage.tsx` | Calls `useRoomsList()` |
| Cache | `src/lib/rooms-query.ts` | `queryKey`, `queryFn`, `staleTime` |
| HTTP | `src/lib/api.ts` | `fetchRooms()` → `GET /api/rooms` |
| Route | `server/routes/rooms.ts` | `roomsRouter.get("/")` |
| SQL | `server/repositories/rooms.repo.ts` | `findAllRooms()` |

## 3. Patterns used (standard React + Express)

### Express

- **Router per resource** under `server/routes/`  
- **`asyncHandler`** wraps async route functions so errors reach `errorHandler`  
- **`HttpError`** for 4xx responses with a message  
- **Zod** validates `POST` bodies before touching the DB  
- **Repository layer** keeps SQL out of route files  

### React

- **React Router** — layout route in `RootLayout`, pages as children  
- **TanStack Query** — server state (loading/error/refetch), not `useEffect` + `useState` for every fetch  
- **`api.ts`** — single place for `fetch` URLs and headers (e.g. `X-Player-Name` on `/api/me`)  

### Dev vs production

| Mode | React | API | How `/api` works |
|------|-------|-----|------------------|
| `npm run dev` | Vite `:8080` | Express `:3000` | Vite **proxy** |
| `npm start` | Static `dist/` | Express `:3000` | Same host, no proxy |

## 4. Shared types

`server/tsconfig.json` includes `src/lib/janken-types.ts` so the API can share `Room`, `Match`, and `Hand` types with the frontend without duplicating definitions.

## 5. Suggested exercises

1. **Health check UI** — show `/health` status on the home page.  
2. **Filter rooms** — query param `?status=waiting` on `GET /api/rooms`.  
3. **Join room** — `POST /api/rooms/:id/join` and refresh the room detail query.  
4. **Play round** — persist hands and winner in MySQL instead of local-only simulation in `RoomDetailPage.tsx`.

## 6. Troubleshooting

| Symptom | Check |
|---------|--------|
| `API接続エラー` / fetch failed | Is `npm run dev:server` running? MySQL up? |
| CORS error in browser | Use empty `VITE_API_URL` and open `:8080`, or add your origin to `CORS_ORIGIN` |
| `EADDRINUSE` on 3000 | Change `PORT` in `.env` and restart both processes |
| Wrong player data | `VITE_PLAYER_NAME` must match a seeded `players.name` |
