# Data Migrations

## Message Normalization
Adds missing fields and aligns message documents with current API expectations.

What it does:
- Adds `readBy: [senderId]` when `readBy` is missing
- Adds `type: "text"` when `type` is missing
- Backfills `createdAt` and `updatedAt` from `sentAt` if timestamps are missing

Safe to re-run. Only updates documents missing these fields.

### Run
```powershell
# From E:\grownet\GrowNet\backend
npm run migrate:messages
```

Requires `MONGODB_URI` in `backend/.env` to point at the database you want to migrate.

### Verify
- `GET http://localhost:4000/api/chats` (Bearer token)
- `GET http://localhost:4000/api/chats/{{chatId}}/messages?limit=50`

### Rollback
This migration is additive and idempotent. If needed, you can manually unset fields via Mongo shell for specific documents.
