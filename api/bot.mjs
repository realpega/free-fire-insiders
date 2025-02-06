import TelegramBot from "node-telegram-bot-api";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN);

const responses = {
  "sudo apt update": `Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease\n 
    Get:2 http://security.ubuntu.com/ubuntu focal-security InRelease [114 kB]\n
Get:3 http://archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]\n
Get:4 http://archive.ubuntu.com/ubuntu focal-backports InRelease [108 kB]\n
Reading package lists... Done\n
Building dependency tree\n
Reading state information... Done\n
All packages are up to date.`,
  "uname -m": "aarch64",
  "ls": "Documents  Downloads  Music  Pictures  Videos",
};

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
