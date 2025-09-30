import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://api.thedogapi.com/v1/images/search');                                       
    const img = await res.json();
    const caption = `*_By: WorkCwp_*`.trim();
    await conn.sendMessage(m.key.remoteJid, { image: { url: img[0].url }, caption }, { quoted: m });
  } catch {
    throw '*Error!*';
  }
};

handler.command = ['dog'];

export default handler;