import TelegramBot from "node-telegram-bot-api";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN);

let packagesUpgraded = false;

const staticResponses = {
  "uname -m": "amd64",
  "ls": "Documents  Downloads  Music  Pictures  Videos"
};

const lastCommand = new Map();
// For each chat, store an array of objects of the form { user: <userMsgId>, bot: <botMsgId> }
const messageHistory = new Map();

async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text.trim();

  // Ensure we have a history array for this chat.
  if (!messageHistory.has(chatId)) {
    messageHistory.set(chatId, []);
  }

  // The "clear" command deletes only those messages that the bot has replied to.
  if (text === "clear") {
    await clearChat(chatId);
    return;
  }

  // Check if the last command was "sudo apt upgrade" and the reply is "y".
  if (lastCommand.get(chatId) === "sudo apt upgrade" && text.toLowerCase() === "y") {
    if (!packagesUpgraded) {
      const replyMessage = await bot.sendMessage(
        chatId,
        `Get:1 http://archive.ubuntu.com/ubuntu focal-updates/main amd64 libc6 amd64 2.31-0ubuntu9.9 [2,760 kB]
Get:2 http://archive.ubuntu.com/ubuntu focal-updates/main amd64 libc-bin amd64 2.31-0ubuntu9.9 [1,312 kB]
Fetched 5,632 kB in 2s (3,215 kB/s)
Preconfiguring packages ...

(Reading database ... 210384 files and directories currently installed.)
Preparing to unpack .../libc6_2.31-0ubuntu9.9_amd64.deb ...
Unpacking libc6:amd64 (2.31-0ubuntu9.9) over (2.31-0ubuntu9.8) ...
Setting up libc6:amd64 (2.31-0ubuntu9.9) ...

Preparing to unpack .../libc-bin_2.31-0ubuntu9.9_amd64.deb ...
Unpacking libc-bin (2.31-0ubuntu9.9) over (2.31-0ubuntu9.8) ...
Setting up libc-bin (2.31-0ubuntu9.9) ...
Processing triggers for man-db (2.9.1-1) ...`
      );
      // Store the pair (user message and bot reply)
      messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
      packagesUpgraded = true;
    } else {
      const replyMessage = await bot.sendMessage(chatId, "All packages are up to date.");
      messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
    }
    lastCommand.delete(chatId);
    return;
  }

  // Process "apt list --upgradable"
  if (text === "apt list --upgradable") {
    let replyText;
    if (!packagesUpgraded) {
      replyText = `Listing... Done
libc-bin/focal-updates 2.31-0ubuntu9.9 amd64 [upgradable from: 2.31-0ubuntu9.8]
libc6/focal-updates 2.31-0ubuntu9.9 amd64 [upgradable from: 2.31-0ubuntu9.8]`;
    } else {
      replyText = "Listing... Done";
    }
    const replyMessage = await bot.sendMessage(chatId, replyText);
    messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return;
  }

  // Process "sudo apt update"
  if (text === "sudo apt update") {
    let updateOutput;
    if (packagesUpgraded) {
      updateOutput = `Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease
Get:2 http://security.ubuntu.com/ubuntu focal-security InRelease [114 kB]
Get:3 http://archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]
Get:4 http://archive.ubuntu.com/ubuntu focal-backports InRelease [114 kB]
Reading package lists... Done
Building dependency tree
Reading state information... Done
All packages are up to date.`;
    } else {
      updateOutput = `Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease
Get:2 http://security.ubuntu.com/ubuntu focal-security InRelease [114 kB]
Get:3 http://archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]
Get:4 http://archive.ubuntu.com/ubuntu focal-backports InRelease [114 kB]
Reading package lists... Done
Building dependency tree
Reading state information... Done
2 packages can be upgraded. Run 'apt list --upgradable' to see them.`;
    }
    const replyMessage = await bot.sendMessage(chatId, updateOutput);
    messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return;
  }

  // Process "sudo apt upgrade"
  if (text === "sudo apt upgrade") {
    let upgradeOutput;
    if (packagesUpgraded) {
      upgradeOutput = `Reading package lists... Done  
Building dependency tree       
Reading state information... Done  
All packages are up to date.`;
    } else {
      upgradeOutput = `Reading package lists... Done  
Building dependency tree       
Reading state information... Done  
Calculating upgrade... Done  
The following packages will be upgraded:  
  libc-bin libc6  
2 upgraded, 0 newly installed, 0 to remove, and 0 not upgraded.  
Need to get 5,632 kB of archives.  
After this operation, 1,024 KB of additional disk space will be used.  
Do you want to continue? [Y/n]`;
    }
    const replyMessage = await bot.sendMessage(chatId, upgradeOutput);
    messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return;
  }

  // Process static commands (e.g. "uname -m" or "ls")
  if (staticResponses[text]) {
    const replyMessage = await bot.sendMessage(chatId, staticResponses[text]);
    messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return;
  }
}

// Deletes only the messages that the bot replied to (and the corresponding user commands)
async function clearChat(chatId) {
  if (!messageHistory.has(chatId)) return;
  const history = messageHistory.get(chatId);
  for (const pair of history) {
    try {
      // Delete the bot's reply
      await bot.deleteMessage(chatId, pair.bot);
    } catch (error) {
      console.error(`Failed to delete bot message ${pair.bot}:`, error.message);
    }
    try {
      // Delete the user's command message that triggered the reply
      await bot.deleteMessage(chatId, pair.user);
    } catch (error) {
      console.error(`Failed to delete user message ${pair.user}:`, error.message);
    }
  }
  // Clear the stored history for this chat.
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
  
