import { NextResponse } from "next/server";

import {
  handleTelegramUpdate,
  type TelegramUpdate,
} from "@/lib/telegram-commands";

export const runtime = "nodejs";

const verifyWebhookSecret = (request: Request): boolean => {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  const header = request.headers.get("x-telegram-bot-api-secret-token");
  return header === secret;
};

export const POST = async (request: Request) => {
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await handleTelegramUpdate(update);
  } catch (err) {
    console.error("Telegram webhook handler error:", err);
  }

  return NextResponse.json({ ok: true });
};
