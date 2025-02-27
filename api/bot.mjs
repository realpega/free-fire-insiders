import TelegramBot from "node-telegram-bot-api";
import { staticResponses, handleStatic, handleRmRf } from "./static.mjs";
import { handleApt } from "./apt.mjs";
import { directoryContents, handleFilesystem } from "./filesystem.mjs";
import { handleNeofetch } from "./neofetch.mjs";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let bot = new TelegramBot(TOKEN);

const lastCommand = new Map();
const messageHistory = new Map();
const userDirectories = new Map();

async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text.trim();
  const messageId = message.message_id;

  if (!messageHistory.has(chatId)) {
    messageHistory.set(chatId, []);
  }

  if (!userDirectories.has(chatId)) {
    userDirectories.set(chatId, "~");
  }

  // Handle 'clear' command
  if (text === "clear") {
    try { await bot.deleteMessage(chatId, messageId); } catch (e) {}
    await clearChat(chatId);
    return;
  }

  // Delegate to module handlers
  if (await handleNeofetch(bot, chatId, text, messageId, messageHistory)) return;
  if (await handleStatic(bot, chatId, text, messageId, messageHistory, lastCommand)) return;
  if (await handleRmRf(bot, chatId, text, messageId, messageHistory)) return;
  if (await handleApt(bot, chatId, text, messageId, messageHistory, lastCommand)) return;
  if (await handleFilesystem(bot, chatId, text, messageId, messageHistory, userDirectories)) return;
}

async function clearChat(chatId) {
  if (!messageHistory.has(chatId)) return;
  const history = messageHistory.get(chatId);
  for (const pair of history) {
    try { await bot.deleteMessage(chatId, pair.bot); } catch (e) {}
    try { await bot.deleteMessage(chatId, pair.user); } catch (e) {}
  }
  messageHistory.set(chatId, []);
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { message } = req.body;
    if (message && message.text) {
      await processMessage(message);
    }
    return res.status(200).send("OK");
  } else {
    return res.status(405).send("Method Not Allowed");
  }
}
