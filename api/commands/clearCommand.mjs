import { bot } from "../bot.mjs";

const messageHistory = new Map();

export async function handleClearCommand(chatId, text, message) {
  if (text === "clear") {
    try { await bot.deleteMessage(chatId, message.message_id); } catch (e) {}
    if (!messageHistory.has(chatId)) return true;

    for (const msgId of messageHistory.get(chatId)) {
      try { await bot.deleteMessage(chatId, msgId); } catch (e) {}
    }
    messageHistory.set(chatId, []);
    return true;
  }
  return false;
}
