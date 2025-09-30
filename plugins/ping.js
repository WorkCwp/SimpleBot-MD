import { proto } from "baileys";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const handler = async (m, { conn }) => {
  try {
    const chatId = m.key.remoteJid;
    const isGroup = chatId.endsWith("@g.us");
    const start = Date.now();
    const sent = await conn.sendMessage(
      chatId,
      { text: "🏓 Pong..." },
      { quoted: m }
    );
    const ping = Date.now() - start;
    const resultText = `🏓 Pong\n\n✅ Ping: ${ping} ms`;
    if (isGroup) {
      await sleep(100);
      try {
        await conn.relayMessage(
          chatId,
          {
            protocolMessage: {
              key: sent.key,
              type: 14,
              editedMessage: proto.Message.fromObject({
                conversation: resultText
              })
            }
          },
          { messageId: sent.key.id }
        );
      } catch {
        await conn.sendMessage(chatId, { text: resultText }, { quoted: m });
      }
    } else {
      await conn.sendMessage(chatId, { text: resultText }, { quoted: m });
    }
  } catch {
    await conn.sendMessage(
      m.key.remoteJid,
      { text: "Error calculando el ping." },
      { quoted: m }
    );
  }
};

handler.command = ["ping"];

export default { handler, command: handler.command };