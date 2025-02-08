import TelegramBot from "node-telegram-bot-api";
import { handleSystemCommand } from "./commands/systemCommands.mjs";
import { handlePackageManagerCommand } from "./commands/packageManagerCommands.mjs";
import { handleClearCommand } from "./commands/clearCommand.mjs";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN);
export { bot };

async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text.trim();

  if (await handleSystemCommand(chatId, text, message)) return;
  if (await handlePackageManagerCommand(chatId, text, message)) return;
  if (await handleClearCommand(chatId, text, message)) return;
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
