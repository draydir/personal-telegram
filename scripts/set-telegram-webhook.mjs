#!/usr/bin/env node
/**
 * Register Telegram webhook for this deployment.
 *
 *   TELEGRAM_BOT_TOKEN=... \
 *   WEBHOOK_BASE_URL=https://your-app.vercel.app \
 *   TELEGRAM_WEBHOOK_SECRET=optional-secret \
 *   node scripts/set-telegram-webhook.mjs
 */

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const base = process.env.WEBHOOK_BASE_URL?.trim().replace(/\/$/, "");
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

if (!token || !base) {
  console.error("Set TELEGRAM_BOT_TOKEN and WEBHOOK_BASE_URL");
  process.exit(1);
}

const url = `${base}/api/telegram/webhook`;

const body = {
  url,
  allowed_updates: ["message"],
  drop_pending_updates: true,
  ...(secret ? { secret_token: secret } : {}),
};

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const json = await res.json();
console.log(JSON.stringify(json, null, 2));
process.exit(json.ok ? 0 : 1);
