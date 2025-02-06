import TelegramBot from "node-telegram-bot-api";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN);

// Global state to track whether the packages have been upgraded
let packagesUpgraded = false;

// Predefined responses for commands that are not dynamic
const staticResponses = {
  "uname -m": "amd64",
  "ls": "Documents  Downloads  Music  Pictures  Videos"
};

// Map to track the last command per chat
const lastCommand = new Map();

async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text.trim();

  // If the last command was "sudo apt upgrade" and the reply is "Y"
  if (lastCommand.get(chatId) === "sudo apt upgrade" && text.toLowerCase() === "y") {
    if (!packagesUpgraded) {
      // Simulate the upgrade output and mark packages as upgraded
      await bot.sendMessage(
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
      packagesUpgraded = true;
    } else {
      // If already upgraded, simply report that everything is up to date
      await bot.sendMessage(chatId, "All packages are up to date.");
    }
    lastCommand.delete(chatId);
    return;
  }

  // Process "sudo apt update" command
  if (text === "sudo apt update") {
    // If packages are upgraded, then update output shows "All packages are up to date."
    const updateOutput = packagesUpgraded
      ? `Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease
Get:2 http://security.ubuntu.com/ubuntu focal-security InRelease [114 kB]
Get:3 http://archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]
Get:4 http://archive.ubuntu.com/ubuntu focal-backports InRelease [108 kB]
Reading package lists... Done
Building dependency tree
Reading state information... Done
All packages are up to date.`
      : `Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease
Get:2 http://security.ubuntu.com/ubuntu focal-security InRelease [114 kB]
Get:3 http://archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]
Get:4 http://archive.ubuntu.com/ubuntu focal-backports InRelease [108 kB]
Reading package lists... Done
Building dependency tree
Reading state information... Done
2 packages can be upgraded: libc-bin and libc6.`;
    await bot.sendMessage(chatId, updateOutput);
    lastCommand.set(chatId, text);
    return;
  }

  // Process "sudo apt upgrade" command
  if (text === "sudo apt upgrade") {
    const upgradeOutput = packagesUpgraded
      ? `Reading package lists... Done  
Building dependency tree       
Reading state information... Done  
All packages are up to date.`
      : `Reading package lists... Done  
Building dependency tree       
Reading state information... Done  
Calculating upgrade... Done  
The following packages will be upgraded:  
  libc-bin libc6  
2 upgraded, 0 newly installed, 0 to remove, and 0 not upgraded.  
Need to get 5,632 kB of archives.  
After this operation, 1,024 KB of additional disk space will be used.  
Do you want to continue? [Y/n]`;
    await bot.sendMessage(chatId, upgradeOutput);
    lastCommand.set(chatId, text);
    return;
  }

  // Process any other static responses
  if (staticResponses[text]) {
    await bot.sendMessage(chatId, staticResponses[text]);
    lastCommand.set(chatId, text);
    return;
  }

  // If the command is unrecognized, you might want to do nothing or send a help message
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
  
