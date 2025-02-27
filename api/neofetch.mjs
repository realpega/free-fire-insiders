export async function handleNeofetch(bot, chatId, messageId, messageHistory) {
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
  messageHistory.get(chatId).push({ user: messageId, bot: photoMessage.message_id });
  messageHistory.get(chatId).push({ user: messageId, bot: replyMessage.message_id });
  return true; // Indicates handled
}
