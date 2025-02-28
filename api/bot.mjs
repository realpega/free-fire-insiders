import TelegramBot from "node-telegram-bot-api";
import { staticResponses, handleStatic, handleRmRf } from "./static.mjs";
import { handleApt } from "./apt.mjs";
import { directoryContents, handleFilesystem } from "./filesystem.mjs";
import { handleNeofetch } from "./neofetch.mjs";

//hi

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let bot;

try {
  if (!TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
  bot = new TelegramBot(TOKEN);
} catch (error) {
  console.error("Failed to initialize bot:", error.message);
  throw error;
}

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

  try {
    if (text === "clear") {
      try { await bot.deleteMessage(chatId, messageId); } catch (e) { console.error("Error deleting message:", e.message); }
      await clearChat(chatId);
      return;
    }

    if (await handleNeofetch(bot, chatId, text, messageId, messageHistory)) return;
    if (await handleStatic(bot, chatId, text, messageId, messageHistory, lastCommand)) return;
    if (await handleRmRf(bot, chatId, text, messageId, messageHistory)) return;
    if (await handleApt(bot, chatId, text, messageId, messageHistory, lastCommand)) return;
    if (await handleFilesystem(bot, chatId, text, messageId, messageHistory, userDirectories)) return;

    // Optional: Handle unrecognized commands
    // const replyMessage = await bot.sendMessage(chatId, `Command '${text}' not recognized`);
    // messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
  } catch (error) {
    console.error(`Error processing message '${text}':`, error.message);
    // Optionally send an error response to the user
    // await bot.sendMessage(chatId, "An error occurred while processing your command.");
  }
}

async function clearChat(chatId) {
  if (!messageHistory.has(chatId)) return;
  const history = messageHistory.get(chatId);
  for (const pair of history) {
    try { await bot.deleteMessage(chatId, pair.bot); } catch (e) { console.error("Error deleting bot message:", e.message); }
    try { await bot.deleteMessage(chatId, pair.user); } catch (e) { console.error("Error deleting user message:", e.message); }
  }
  messageHistory.set(chatId, []);
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { message } = req.body;
    if (message && message.text) {
      try {
        await processMessage(message);
        return res.status(200).send("OK");
      } catch (error) {
        console.error("Handler error:", error.message);
        return res.status(500).send("Internal Server Error");
      }
    }
    return res.status(400).send("Bad Request: Missing message or text");
  } else {
    return res.status(405).send("Method Not Allowed");
  }
}
