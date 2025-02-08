import { bot } from "../bot.mjs";

let packagesUpgraded = false;
const lastCommand = new Map();

export async function handlePackageManagerCommand(chatId, text, message) {
  if (text === "apt list --upgradable") {
    let response = packagesUpgraded ? "Listing... Done" : 
    `Listing... Done
libc-bin/focal-updates 2.31-0ubuntu9.9 amd64 [upgradable from: 2.31-0ubuntu9.8]
libc6/focal-updates 2.31-0ubuntu9.9 amd64 [upgradable from: 2.31-0ubuntu9.8]`;
    await bot.sendMessage(chatId, response);
    return true;
  }

  if (text === "sudo apt update") {
    let response = packagesUpgraded 
      ? "All packages are up to date."
      : "2 packages can be upgraded. Run 'apt list --upgradable' to see them.";
    await bot.sendMessage(chatId, response);
    return true;
  }

  if (text === "sudo apt upgrade") {
    let response = packagesUpgraded
      ? "All packages are up to date."
      : "Do you want to continue? [Y/n]";
    await bot.sendMessage(chatId, response);
    lastCommand.set(chatId, text);
    return true;
  }

  if (lastCommand.get(chatId) === "sudo apt upgrade" && text.toLowerCase() === "y") {
    if (!packagesUpgraded) {
      await bot.sendMessage(chatId, "Upgrading packages...");
      packagesUpgraded = true;
    }
    lastCommand.delete(chatId);
    return true;
  }

  return false;
}
