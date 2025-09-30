import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "baileys";
import pino from "pino";
import fs from "fs/promises";
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import qrcode from "qrcode-terminal";
import readline from "readline";
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));

let phoneNumber = '';
let opcion = '2';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function connectBot() {
  if (opcion === '2' && !phoneNumber) {
    phoneNumber = await new Promise((resolve) => {
      rl.question('Ingrese su número de WhatsApp con código de país: ', (answer) => {
        resolve(answer);
      });
    });
  }

  const { state, saveCreds } = await useMultiFileAuthState("session");
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: opcion == '1' ? true : false,
    mobile: false,
    browser: opcion == '1' ? ['SimpleBot-MD', 'Edge', '20.0.04'] : ["Ubuntu", "Chrome", "20.0.04"],
  });

  // Guardar sesión
  sock.ev.on("creds.update", saveCreds);

  // Escuchar actualizaciones de conexión
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr && opcion == '1') {
      qrcode.generate(qr, { small: true }, (qrcode) => {
        console.log(chalk.yellow("📲 Escanea este QR con tu WhatsApp:\n"), qrcode);
      });
    }
    if (connection === "close") {
      if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectBot();
      }
    } else if (connection === "open") {
      console.log(chalk.green("✅ Bot conectado con éxito a WhatsApp!"));
      rl.close();
    }

    if (opcion === '2' && !sock.authState.creds.registered) {
      phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
      setTimeout(async () => {
        let codigo = await sock.requestPairingCode(phoneNumber);
        codigo = codigo?.match(/.{1,4}/g)?.join("-") || codigo;
        console.log(chalk.bold.white(chalk.bgMagenta(`🎀 CÓDIGO DE VINCULACIÓN 🎀`)), chalk.bold.white(chalk.white(codigo)));
      }, 3000);
    }
  });

  // Cargar plugins
  const plugins = {};
  const pluginPath = join(__dirname, "plugins");
  const files = await fs.readdir(pluginPath);
  console.log(chalk.yellow(`*╭━〘 Cargando Plugins 〙━⌬*`));
  for (const file of files) {
    if (file.endsWith(".js")) {
      const plugin = await import(join(pluginPath, file));
      if (plugin.default) {
        const handler = plugin.default.handler || plugin.default;
        const command = plugin.default.command;
        if (command) {
          if (Array.isArray(command)) {
            command.forEach(cmd => {
              plugins[cmd] = { handler, command };
            });
          } else {
            plugins[command] = { handler };
          }
        }
      } else if (plugin.handler && plugin.command) {
        const command = plugin.command;
        if (Array.isArray(command)) {
          command.forEach(cmd => {
            plugins[cmd] = { handler: plugin.handler, command };
          });
        } else {
          plugins[command] = { handler: plugin.handler };
        }
      }
      console.log(chalk.green(`┃ ➩ ${file.replace(".js", "")}`));
    }
  }
  console.log(chalk.yellow(`*╰━━━━━━━━━━━━━━━━━━━━━⌬*`));
  console.log(chalk.green(`Plugins cargados: ${Object.keys(plugins).length}`));

  let currentChat = null;

  // Escuchar mensajes
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    currentChat = m.key.remoteJid;
    const fecha = new Date().toLocaleString('es-ES', { hour12: false });
    if (!m.message) return;
    const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
    const prefix = /^[#.!?]/; // Define los prefijos permitidos
    const tipo = m.key.remoteJid.includes('@g.us') ? 'Grupo' : 'Privado';
    const usuario = m.pushName || m.key.participant;

    if (prefix.test(body)) {
      const command = body.slice(1).trim().split(" ")[0].toLowerCase(); // Elimina el prefijo y obtiene el comando
      const args = body.slice(1).trim().split(" ").slice(1).join(" "); // Obtiene los argumentos del comando
      console.log(chalk.blue(`[${fecha}] ${tipo} - ${usuario}: ${body} (Comando)`));
      if (plugins[command]) {
        try {
          await plugins[command].handler(m, { conn: sock, args });
        } catch (err) {
          console.error('Error en comando:', err);
          sock.sendMessage(m.key.remoteJid, { text: `Error en comando: ${err.message}` });
        }
      }
    } else {
      console.log(chalk.cyan(`[${fecha}] ${tipo} - ${usuario}: ${body}`));
    }
  });

  process.on('uncaughtException', (err) => {
    console.error('Error crítico:', err);
    if (currentChat) {
      sock.sendMessage(currentChat, { text: `Error crítico: ${err.message}` });
      process.exit(1);
    }
  });
}

connectBot();