import {
  getDefaultChatId,
  isUserAllowed,
  sendTelegramMessage,
} from "@/lib/telegram";

type TelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
};

type TelegramChat = {
  id: number;
  type: string;
};

type TelegramMessage = {
  message_id: number;
  chat: TelegramChat;
  from?: TelegramUser;
  text?: string;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

const helpText = `Personal bot — commands

/start — welcome
/id — show this chat id (for TELEGRAM_DEFAULT_CHAT_ID)
/ping — health check
/help — this message

Apps can POST to /api/notify with Bearer NOTIFY_API_SECRET.`;

export const handleTelegramUpdate = async (update: TelegramUpdate): Promise<void> => {
  const message = update.message;
  if (!message?.text || !message.from) return;

  const userId = message.from.id;
  if (!isUserAllowed(userId)) {
    await sendTelegramMessage(message.chat.id, "Unauthorized.");
    return;
  }

  const text = message.text.trim();
  const command = text.split(/\s+/)[0]?.toLowerCase();

  switch (command) {
    case "/start":
      await sendTelegramMessage(
        message.chat.id,
        "Personal hub online. Use /id to copy your chat id for Vercel env, /help for commands.",
      );
      break;
    case "/ping":
      await sendTelegramMessage(message.chat.id, "pong");
      break;
    case "/id":
      await sendTelegramMessage(
        message.chat.id,
        `chat_id: ${message.chat.id}\nuser_id: ${userId}\ndefault env: ${getDefaultChatId() ?? "(not set)"}`,
      );
      break;
    case "/help":
      await sendTelegramMessage(message.chat.id, helpText);
      break;
    default:
      if (command.startsWith("/")) {
        await sendTelegramMessage(message.chat.id, "Unknown command. Try /help");
      }
      break;
  }
};
