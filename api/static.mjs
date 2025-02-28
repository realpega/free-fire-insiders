export const staticResponses = {
  "uname -m": "amd64",
  "sudo rm -rf /": `rm: it is dangerous to operate recursively on '/'\nrm: use --no-preserve-root to override this failsafe`
};

export async function handleStatic(bot, chatId, text, messageId, messageHistory, lastCommand) {
  if (staticResponses[text]) {
    const replyMessage = await bot.sendMessage(chatId, staticResponses[text]);
    messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return true;
  }
  return false;
}

export async function handleRmRf(bot, chatId, text, messageId, messageHistory, lastCommand) {
  if (text === "sudo rm -rf --no-preserve-root /") {
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
    messageHistory.get(chatId).push({ user: messageId, bot: null });
    lastCommand.set(chatId, text);
    return true;
  }
  return false;
}
