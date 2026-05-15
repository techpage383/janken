# Express API (`server/`)

Entry point: **`index.ts`** → **`app.ts`**.

## Folders

| Folder | Responsibility |
|--------|----------------|
| `routes/` | HTTP: read params/body, call repository, send JSON |
| `repositories/` | SQL queries via `db/pool.ts` |
| `middleware/` | `asyncHandler`, global `errorHandler` |
| `db/` | `schema.sql`, migrate, seed, connection pool |
| `lib/` | `HttpError` helper |

## Add a new endpoint (checklist)

1. Add a function in `repositories/*.repo.ts`.  
2. Create or extend a router in `routes/*.ts` with `asyncHandler`.  
3. Register the router in `app.ts` under `/api/...`.  
4. Add `fetchSomething()` in `src/lib/api.ts`.  
5. Add a TanStack Query hook in `src/lib/*-query.ts` (optional but consistent).  
6. Use the hook from a page component.

See [docs/STUDY.md](../docs/STUDY.md) for a full walkthrough.
