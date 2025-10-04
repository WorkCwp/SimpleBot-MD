import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs/promises";
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import qrcode from "qrcode-terminal";
import chalk from 'chalk';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadPlugins(pluginPath) {
  const plugins = {};
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
  return plugins;
}

async function connectBot(number) {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    number
  });

  // sesión
  sock.ev.on("creds.update", saveCreds);

  // conexión
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr, code } = update;
    if (qr) {
      qrcode.generate(qr, { small: true }, (qrcode) => {
        console.log(chalk.yellow("📲 Escanea este QR con tu WhatsApp:\n"), qrcode);
      });
    } else if (code) {
      console.log(chalk.yellow(`🔢 Ingresa este código en WhatsApp: ${code}`));
    }
    if (connection === "close") {
      if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectBot();
      }
    } else if (connection === "open") {
      console.log(chalk.green("✅ Bot conectado con éxito a WhatsApp!"));
    }
  });

  // plugins
  const plugins = await loadPlugins(join(__dirname, "plugins"));

  let currentChat = null;

  // Escuchar mensajes
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    currentChat = m.key.remoteJid;
    const fecha = new Date().toLocaleString('es-ES', { hour12: false });
    if (!m.message) return;
    const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
    const prefix = /^[#.!?]/; // prefijos
    const tipo = m.key.remoteJid.includes('@g.us') ? 'Grupo' : 'Privado';
    const usuario = m.pushName || m.key.participant;
    if (prefix.test(body)) {
      const command = body.slice(1).trim().split(" ")[0].toLowerCase(); 
      const args = body.slice(1).trim().split(" ").slice(1).join(" "); 
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

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('¿Cómo deseas vincular el bot? (1) QR Code, (2) Código de 8 dígitos: ', async (choice) => {
    if (choice === '1') {
      console.log('Vinculando con QR Code...');
      connectBot();
    } else if (choice === '2') {
      rl.question('Ingresa el número de WhatsApp al cual vincular (con código de país, por ejemplo: +1234567890): ', async (number) => {
        console.log(`Vinculando con el número: ${number}`);
        connectBot(number);
      });
    } else {
      console.log('Opción no válida. Por favor, elige 1 o 2.');
      rl.close();
    }
    rl.close();
  });
}

main();      console.log(chalk.green("✅ Bot conectado con éxito a WhatsApp!"))
    }
  })

        // conexión
        sock.ev.on("connection.update", (update) => {
          const { connection, lastDisconnect, qr, code } = update
          if (qr) {
            qrcode.generate(qr, { small: true }, (qrcode) => {
              console.log(chalk.yellow("📲 Escanea este QR con tu WhatsApp:\n"), qrcode)
            })
          } else if (code) {
            console.log(chalk.yellow(`🔢 Ingresa este código en WhatsApp: ${code}`))
          }
          if (connection === "close") {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
              connectBot()
            }
          } else if (connection === "open") {
            console.log(chalk.green("✅ Bot conectado con éxito a WhatsApp!"))
          }
        })

        // plugins
        const plugins = {}
        const pluginPath = join(__dirname, "plugins")
        const files = await fs.readdir(pluginPath)
        console.log(chalk.yellow(`*╭━〘 Cargando Plugins 〙━⌬*`))
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
            console.log(chalk.green(`┃ ➩ ${file.replace(".js", "")}`))
          }
        }
        console.log(chalk.yellow(`*╰━━━━━━━━━━━━━━━━━━━━━⌬*`))
        console.log(chalk.green(`Plugins cargados: ${Object.keys(plugins).length}`))

        let currentChat = null;

        // Escuchar mensajes
        sock.ev.on("messages.upsert", async ({ messages }) => {
          const m = messages[0]
          currentChat = m.key.remoteJid;
          const fecha = new Date().toLocaleString('es-ES', { hour12: false })
          if (!m.message) return
          const body = m.message.conversation || m.message.extendedTextMessage?.text || ""
          const prefix = /^[#.!?]/; // Define los prefijos permitidos
          const tipo = m.key.remoteJid.includes('@g.us') ? 'Grupo' : 'Privado'
          const usuario = m.pushName || m.key.participant
          if (prefix.test(body)) {
            const command = body.slice(1).trim().split(" ")[0].toLowerCase(); // Elimina el prefijo y obtiene el comando
            const args = body.slice(1).trim().split(" ").slice(1).join(" "); // Obtiene los argumentos del comando
            console.log(chalk.blue(`[${fecha}] ${tipo} - ${usuario}: ${body} (Comando)`))
            if (plugins[command]) {
              try {
                await plugins[command].handler(m, { conn: sock, args });
              } catch (err) {
                console.error('Error en comando:', err);
                sock.sendMessage(m.key.remoteJid, { text: `Error en comando: ${err.message}` });
              }
            }
          } else {
            console.log(chalk.cyan(`[${fecha}] ${tipo} - ${usuario}: ${body}`))
          }
        })

        process.on('uncaughtException', (err) => {
          console.error('Error crítico:', err);
          if (currentChat) {
            sock.sendMessage(currentChat, { text: `Error crítico: ${err.message}` });
            process.exit(1);
          }
        });
      });
    } else {
      console.log('Opción no válida. Por favor, elige 1 o 2.');
      rl.close();
    }
    rl.close();
  });
}

main();
