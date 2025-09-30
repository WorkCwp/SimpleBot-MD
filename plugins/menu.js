import fs from 'fs/promises';
import path from 'path';
import process from 'process';

const handler = async (m, { conn }) => {
  const pluginsPath = path.join(process.cwd(), 'plugins');
  const files = await fs.readdir(pluginsPath);
  const comandos = [];
  let comandoCount = 0;
  for (const file of files) {
    if (file.endsWith('.js') && file !== 'menu.js') {
      comandoCount++;
      const comando = file.replace('.js', '');
      comandos.push(`!${comando}`);
    }
  }

  const uptime = process.uptime();
  const horas = Math.floor(uptime / 3600);
  const minutos = Math.floor((uptime % 3600) / 60);
  const segundos = Math.floor(uptime % 60);
  const uptimeString = `${horas}h ${minutos}m ${segundos}s`;

  const menu = `*╭━〘 Criwilop-MD v2.0 ☆ 〙━⌬*\n┃ ✎ *Nombre:* ${m.pushName}\n┃ ✎ *Uptime:* ${uptimeString}\n┃ ✎ *Comandos:* ${comandoCount}\n*╰━━━━━━━━━━━━━━━━━━━━━⌬*\n*⌬* 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒↷↷\n${comandos.sort().join('\n')}`;

  await conn.sendMessage(m.key.remoteJid, { 
    image: { url: './src/menu.png' }, 
    caption: menu 
  }, { quoted: m });
};

handler.command = ["menu", "comandos"];

export default { handler, command: handler.command };