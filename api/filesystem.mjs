export const directoryContents = new Map([
  ["~", "Documents  Downloads  Music  Pictures  Videos"],
  ["~/Documents", "File1.txt  File2.docx  Notes.pdf"],
  ["~/Downloads", "Setup.exe  Movie.mp4  Image.png"],
  ["~/Music", "Song1.mp3  Song2.wav  Playlist.m3u"],
  ["~/Pictures", "Photo1.jpg  Wallpaper.png  Screenshot.png"],
  ["~/Videos", "Clip1.mp4  Clip2.avi  Movie.mkv"]
]);

export async function handleFilesystem(bot, chatId, text, messageId, messageHistory, userDirectories, lastCommand) {
  let currentDirectory = userDirectories.get(chatId);

  if (text.startsWith("mkdir ")) {
    const newDirName = text.split("mkdir ")[1].trim();
    if (!newDirName) {
      const replyMessage = await bot.sendMessage(chatId, "mkdir: missing operand");
      messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
      lastCommand.set(chatId, text);
      return true;
    }

    const newDirPath = currentDirectory === "~" 
      ? `~/${newDirName}` 
      : `${currentDirectory}/${newDirName}`;

    if (directoryContents.has(newDirPath)) {
      const replyMessage = await bot.sendMessage(chatId, `mkdir: cannot create directory '${newDirName}': File exists`);
      messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
      lastCommand.set(chatId, text);
      return true;
    }

    directoryContents.set(newDirPath, "");
    const currentContents = directoryContents.get(currentDirectory) || "";
    const updatedContents = currentContents ? `${currentContents}  ${newDirName}` : newDirName;
    directoryContents.set(currentDirectory, updatedContents);

    const replyMessage = await bot.sendMessage(chatId, `Created directory '${newDirName}'`);
    messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return true;
  }

  if (text.startsWith("rmdir ")) {
    const dirName = text.split("rmdir ")[1].trim();
    if (!dirName) {
      const replyMessage = await bot.sendMessage(chatId, "rmdir: missing operand");
      messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
      lastCommand.set(chatId, text);
      return true;
    }

    const dirPath = currentDirectory === "~" 
      ? `~/${dirName}` 
      : `${currentDirectory}/${dirName}`;

    if (!directoryContents.has(dirPath)) {
      const replyMessage = await bot.sendMessage(chatId, `rmdir: failed to remove '${dirName}': No such directory`);
      messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
      lastCommand.set(chatId, text);
      return true;
    }

    const dirContents = directoryContents.get(dirPath);
    if (dirContents !== "") {
      const replyMessage = await bot.sendMessage(chatId, `rmdir: failed to remove '${dirName}': Directory not empty`);
      messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
      lastCommand.set(chatId, text);
      return true;
    }

    directoryContents.delete(dirPath);
    const currentContents = directoryContents.get(currentDirectory);
    const contentsArray = currentContents.split("  ").filter(item => item !== dirName);
    const updatedContents = contentsArray.join("  ").trim();
    directoryContents.set(currentDirectory, updatedContents);

    const replyMessage = await bot.sendMessage(chatId, `Removed directory '${dirName}'`);
    messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return true;
  }

  if (text.startsWith("cd ")) {
    const newDir = text.split("cd ")[1].trim();
    let targetDirectory;
    if (newDir === "..") {
      targetDirectory = currentDirectory.includes("/") 
        ? currentDirectory.substring(0, currentDirectory.lastIndexOf("/")) || "~"
        : "~";
    } else if (newDir === "~") {
      targetDirectory = "~";
    } else if (newDir.startsWith("/")) {
      targetDirectory = newDir;
    } else {
      targetDirectory = currentDirectory === "~" 
        ? `~/${newDir}`
        : `${currentDirectory}/${newDir}`;
    }

    if (!directoryContents.has(targetDirectory) && targetDirectory !== "~") {
      const replyMessage = await bot.sendMessage(chatId, `cd: ${newDir}: No such directory`);
      messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
      lastCommand.set(chatId, text);
      return true;
    }

    userDirectories.set(chatId, targetDirectory);
    const replyMessage = await bot.sendMessage(chatId, `Changed directory to ${targetDirectory}`);
    messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return true;
  }

  if (text === "ls") {
    const contents = directoryContents.get(currentDirectory) || "Empty directory";
    const replyMessage = await bot.sendMessage(chatId, contents);
    messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
    lastCommand.set(chatId, text);
    return true;
  }

  return false;
                                                 }
