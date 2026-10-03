# personal-telegram

One **personal** Telegram bot for you—not Jarvis driver dispatch, not HR PTO groups.

## What exists today (elsewhere)

| System | Bot role |
|--------|-----------|
| **provision-admin** | `TELEGRAM_*` fleet alerts → your ops chat |
| **heys3xy** | Same tokens today; contact form → Telegram |
| **Jarvis** | `hr_telegram_settings`, `@velocity_dispatch_bot`, `TELEGRAM_ERROR_*`, daily digest via `user_telegram_links` |
| **OpenClaw** | Separate Telegram → Cursor agent ([docs in jarvis](https://github.com/draydir/jarvis/blob/main/docs/setup/openclaw-telegram-cursor.md)) |

This repo is the **hub** for a new `@…_bot` you own: inbound commands + a single authenticated HTTP API every small app can call.

## Setup

1. **BotFather** → `/newbot` → save token.
2. Deploy to Vercel (team `drayage`, project `personal-telegram` or similar).
3. Set env from `.env.example`.
4. Register webhook:

```bash
TELEGRAM_BOT_TOKEN=... \
WEBHOOK_BASE_URL=https://your-deployment.vercel.app \
TELEGRAM_WEBHOOK_SECRET=choose-a-long-random-string \
node scripts/set-telegram-webhook.mjs
```

5. Message the bot **`/id`** → put `chat_id` in `TELEGRAM_DEFAULT_CHAT_ID` on Vercel.
6. Lock commands: set `TELEGRAM_ALLOWED_USERNAMES=theBulgar82` or `TELEGRAM_ALLOWED_USER_IDS` from `/id`.

## Notify from other apps

```bash
curl -sS -X POST "https://your-deployment.vercel.app/api/notify" \
  -H "Authorization: Bearer $NOTIFY_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from heys3xy","source":"heys3xy"}'
```

Later: point **heys3xy** / **provision-admin** at this URL instead of embedding `TELEGRAM_BOT_TOKEN` in every project (one rotation point).

## Commands

- `/start` `/help` `/ping` `/id`

## Security

- Never commit tokens. Rotate if leaked in chat.
- Always set `NOTIFY_API_SECRET` and `TELEGRAM_ALLOWED_USER_IDS` in production.
