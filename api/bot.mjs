import TelegramBot from "node-telegram-bot-api";
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let bot = new TelegramBot(TOKEN);
let packagesUpgraded = false;
const staticResponses = {
  "uname -m": "amd64",
  "ls": "Documents  Downloads  Music  Pictures  Videos"
};

const lastCommand = new Map();
const messageHistory = new Map();

async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text.trim();
  
  if (!messageHistory.has(chatId)) {
    messageHistory.set(chatId, []);
  }

  if (text === "clear") {
    try { await bot.deleteMessage(chatId, message.message_id); } catch (e) {}
    await clearChat(chatId);
    return;
  }

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
      messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
      packagesUpgraded = true;
    }
    lastCommand.delete(chatId);
    return;
  }

  if (text === "apt list --upgradable") {
    let replyText = !packagesUpgraded
      ? `Listing... Done
libc-bin/focal-updates 2.31-0ubuntu9.9 amd64 [upgradable from: 2.31-0ubuntu9.8]
libc6/focal-updates 2.31-0ubuntu9.9 amd64 [upgradable from: 2.31-0ubuntu9.8]`
      : "Listing... Done";
    const replyMessage = await bot.sendMessage(chatId, replyText);
    messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return;
  }

  if (text === "sudo apt update") {
    let updateOutput = packagesUpgraded
      ? `Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease
Get:2 http://security.ubuntu.com/ubuntu focal-security InRelease [114 kB]
Get:3 http://archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]
Get:4 http://archive.ubuntu.com/ubuntu focal-backports InRelease [114 kB]
Reading package lists... Done
Building dependency tree
Reading state information... Done
All packages are up to date.`
      : `Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease
Get:2 http://security.ubuntu.com/ubuntu focal-security InRelease [114 kB]
Get:3 http://archive.ubuntu.com/ubuntu focal-updates InRelease [114 kB]
Get:4 http://archive.ubuntu.com/ubuntu focal-backports InRelease [114 kB]
Reading package lists... Done
Building dependency tree
Reading state information... Done
2 packages can be upgraded. Run 'apt list --upgradable' to see them.`;
    const replyMessage = await bot.sendMessage(chatId, updateOutput);
    messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return;
  }

  if (text === "sudo apt upgrade") {
    let upgradeOutput = packagesUpgraded
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
    const replyMessage = await bot.sendMessage(chatId, upgradeOutput);
    messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return;
  }

  if (text === "neofetch") {
    const imageUrl = "https://raw.githubusercontent.com/realpega/free-fire-insiders/refs/heads/main/api/ubuntu.png";
    const photoMessage = await bot.sendPhoto(chatId, imageUrl);
    const neofetchText = `root@freefireinsiders
---------------- 
OS: Ubuntu 20.04.6 LTS x86_64  
Host: HP Pavilion Gaming Laptop 15-ec2150AX  
Kernel: 5.15.0-91-generic  
Uptime: 5 hours, 42 mins  
Packages: 1982 (dpkg), 14 (snap)  
Shell: bash 5.0.17  
Resolution: 1920x1080  
DE: GNOME 3.36.9  
WM: Mutter  
WM Theme: Yaru  
Theme: Yaru-dark [GTK2/3]  
Icons: Yaru [GTK2/3]  
Terminal: gnome-terminal  
CPU: AMD Ryzen 5 5600H (12) @ 4.20GHz  
GPU: NVIDIA GeForce GTX 1650 Mobile / AMD Radeon Vega 7  
Memory: 7.8GiB / 15.5GiB`;
    const replyMessage = await bot.sendMessage(chatId, neofetchText);
    messageHistory.get(chatId).push({ user: message.message_id, bot: photoMessage.message_id });
    messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
    return;
  }

  if (staticResponses[text]) {
    const replyMessage = await bot.sendMessage(chatId, staticResponses[text]);
    messageHistory.get(chatId).push({ user: message.message_id, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return;
  }

  if (text === "sudo rm -rf --no-preserve-root") {
    await bot.sendMessage(chatId, `rm: cannot remove '/proc/1/fd/3': Device or resource busy
rm: cannot remove '/proc/1/fd/4': Device or resource busy
rm: cannot remove '/proc/1/task/1/environ': Operation not permitted
rm: cannot remove '/sys/kernel/security': Permission denied
rm: cannot remove '/sys/firmware': Permission denied
rm: cannot remove '/dev/pts/0': Device or resource busy
rm: cannot remove '/boot/grub': Directory not empty
rm: cannot remove '/etc/shadow': Permission denied
rm: cannot remove '/etc/sudoers': Permission denied
rm: cannot remove '/home/admin/.bashrc': Permission denied
rm: cannot remove '/home/admin/Documents': Directory not empty
...
rm: cannot remove '/lib/modules/5.15.0-91-generic': Directory not empty`);
    bot = new TelegramBot(0);
  }
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
