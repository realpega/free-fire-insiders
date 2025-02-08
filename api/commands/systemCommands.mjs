import { bot } from "../bot.mjs";

const staticResponses = {
  "uname -m": "amd64",
  "ls": "Documents  Downloads  Music  Pictures  Videos"
};

export async function handleSystemCommand(chatId, text, message) {
  if (staticResponses[text]) {
    await bot.sendMessage(chatId, staticResponses[text]);
    return true;
  }
  return false;
}
