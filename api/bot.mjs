import TelegramBot from "node-telegram-bot-api";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;  // Use environment variables for security
const bot = new TelegramBot(TOKEN);

// Predefined responses
const responses = {
  "sudo apt update": "apt updated",
  "uname -m": "aarch64",
  "ls": "Documents  Downloads  Music  Pictures  Videos",
};

// Webhook handler
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { message } = req.body;
    if (message && message.text && responses[message.text]) {
      await bot.sendMessage(message.chat.id, responses[message.text]);
    }
    res.status(200).send("OK");
  } else {
    res.status(405).send("Method Not Allowed");
  }
      }
