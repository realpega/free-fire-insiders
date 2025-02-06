import TelegramBot from "node-telegram-bot-api";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN);

const responses = {
  "sudo apt update": `Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease
Get:2 http://security.ubuntu.com/ubuntu focal-security InRelease [114 kB]
Get:3 http://archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]
Get:4 http://archive.ubuntu.com/ubuntu focal-backports InRelease [108 kB]
Reading package lists... Done
Building dependency tree
Reading state information... Done
All packages are up to date.`,
  
  "sudo apt upgrade": `Reading package lists... Done  
Building dependency tree       
Reading state information... Done  
Calculating upgrade... Done  
The following packages will be upgraded:  
  libc-bin libc6  
2 upgraded, 0 newly installed, 0 to remove, and 0 not upgraded.  
Need to get 5,632 kB of archives.  
After this operation, 1,024 KB of additional disk space will be used.  
Do you want to continue? [Y/n]`,
  
  "uname -m": "amd64",
  "ls": "Documents  Downloads  Music  Pictures  Videos"
};

const lastCommand = new Map();

async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text.trim();

  if (lastCommand.get(chatId) === "sudo apt upgrade" && text.toLowerCase() === "y") {
    await bot.sendMessage(chatId, "All packages are up to date.");
    lastCommand.delete(chatId);
    return;
  }

  if (responses[text]) {
    await bot.sendMessage(chatId, responses[text]);
    lastCommand.set(chatId, text);
  }
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
