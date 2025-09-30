const handler = async (m, { conn }) => {
  const groupMetadata = await conn.groupMetadata(m.key.remoteJid);
  const participants = groupMetadata.participants.map((participant) => participant.id);
  const mention = participants.map((jid) => `@${jid.split('@')[0]}`).join(' ');

  await conn.sendMessage(m.key.remoteJid, { text: mention, mentions: participants }, { quoted: m });
};

handler.command = ["hidetag"];

export default { handler, command: handler.command };