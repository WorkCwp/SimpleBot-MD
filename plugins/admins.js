const handler = async (m, { conn }) => {
  const groupMetadata = await conn.groupMetadata(m.key.remoteJid);
  const admins = groupMetadata.participants.filter((participant) => participant.admin !== null).map((admin) => `@${admin.id.split('@')[0]}`).join(' ');

  if (admins.length === 0) {
    await conn.sendMessage(m.key.remoteJid, { text: "No hay administradores en este grupo." });
  } else {
    await conn.sendMessage(m.key.remoteJid, { text: `Administradores del grupo:\n${admins}`, mentions: groupMetadata.participants.filter((participant) => participant.admin !== null).map((admin) => admin.id) }, { quoted: m });
  }
};

handler.command = ["admins"];

export default { handler, command: handler.command };