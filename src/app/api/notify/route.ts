import { NextResponse } from "next/server";

import { notifySchema } from "@/lib/notify-schema";
import {
  getDefaultChatId,
  isTelegramConfigured,
  sendTelegramMessage,
} from "@/lib/telegram";

export const runtime = "nodejs";

const authorize = (request: Request): boolean => {
  const secret = process.env.NOTIFY_API_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
};

export const POST = async (request: Request) => {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isTelegramConfigured()) {
    return NextResponse.json({ error: "Telegram not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = notifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const chatId = parsed.data.chatId ?? getDefaultChatId();
  if (chatId === null || chatId === undefined || chatId === "") {
    return NextResponse.json({ error: "No chatId and TELEGRAM_DEFAULT_CHAT_ID unset" }, { status: 400 });
  }

  const prefix = parsed.data.source ? `[${parsed.data.source}]\n` : "";
  const result = await sendTelegramMessage(chatId, `${prefix}${parsed.data.text}`);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, messageId: result.messageId });
};
