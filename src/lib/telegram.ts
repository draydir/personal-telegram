const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

export type TelegramSendResult =
  | { ok: true; messageId: number }
  | { ok: false; error: string };

export const isTelegramConfigured = (): boolean => Boolean(BOT_TOKEN);

export const sendTelegramMessage = async (
  chatId: string | number,
  text: string,
  options?: { parseMode?: "HTML" | "MarkdownV2"; disablePreview?: boolean },
): Promise<TelegramSendResult> => {
  if (!BOT_TOKEN) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN not set" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode,
        disable_web_page_preview: options?.disablePreview ?? true,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    const payload = (await res.json().catch(() => null)) as {
      ok?: boolean;
      description?: string;
      result?: { message_id?: number };
    };

    if (!res.ok || !payload?.ok) {
      return { ok: false, error: payload?.description ?? `HTTP ${res.status}` };
    }

    const messageId = payload.result?.message_id;
    if (messageId === undefined) {
      return { ok: false, error: "Missing message_id in Telegram response" };
    }

    return { ok: true, messageId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "network error",
    };
  }
};

export const getDefaultChatId = (): string | null => {
  const raw = process.env.TELEGRAM_DEFAULT_CHAT_ID?.trim();
  return raw || null;
};

export const getAllowedUserIds = (): Set<number> => {
  const raw = process.env.TELEGRAM_ALLOWED_USER_IDS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n)),
  );
};

const normalizeUsername = (username: string): string =>
  username.trim().replace(/^@/, "").toLowerCase();

export const getAllowedUsernames = (): Set<string> => {
  const raw = process.env.TELEGRAM_ALLOWED_USERNAMES?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => normalizeUsername(s))
      .filter(Boolean),
  );
};

export const isUserAllowed = (
  telegramUserId: number,
  username?: string | null,
): boolean => {
  const allowedIds = getAllowedUserIds();
  const allowedNames = getAllowedUsernames();

  if (allowedIds.size === 0 && allowedNames.size === 0) return true;

  if (allowedIds.has(telegramUserId)) return true;

  const normalized = username ? normalizeUsername(username) : "";
  if (normalized && allowedNames.has(normalized)) return true;

  return false;
};
