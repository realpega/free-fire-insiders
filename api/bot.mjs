import TelegramBot from "node-telegram-bot-api";

// Initialize your bot without polling (webhook mode)
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN);

// Predefined responses
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
  
  "uname -m": "aarch64",
  "ls": "Documents  Downloads  Music  Pictures  Videos"
};

// Map to track the last command per chat (or user)
const lastCommand = new Map();

// Helper function to process incoming messages
async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text.trim();

  // If the previous command was "sudo apt upgrade" and user responds with "Y"
  if (lastCommand.get(chatId) === "sudo apt upgrade" && text.toLowerCase() === "y") {
    await bot.sendMessage(chatId, "All packages are up to date.");
    lastCommand.delete(chatId); // Reset the last command
    return;
  }

  // If the text exactly matches one of the predefined commands
  if (responses[text]) {
    await bot.sendMessage(chatId, responses[text]);
    lastCommand.set(chatId, text);
  }
}

// Vercel webhook handler
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
      
