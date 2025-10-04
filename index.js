import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import cfonts from 'cfonts';
import readline from 'readline';
import yargs from 'yargs';
import chalk from 'chalk';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { say } = cfonts;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let isRunning = false;
let childProcess = null;

const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

console.log(chalk.yellow.bold('—◉ㅤIniciando sistema Criwilop-MD...'));

function verificarOCrearCarpetaAuth() {
  const authPath = join(__dirname, global.authFile);
  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }
}

function verificarCredsJson() {
  const credsPath = join(__dirname, global.authFile, 'creds.json');
  return fs.existsSync(credsPath);
}

function formatearNumeroTelefono(numero) {
  let formattedNumber = numero.replace(/[^\d+]/g, '');
  if (formattedNumber.startsWith('+52') && !formattedNumber.startsWith('+521')) {
    formattedNumber = formattedNumber.replace('+52', '+521');
  } else if (formattedNumber.startsWith('52') && !formattedNumber.startsWith('521')) {
    formattedNumber = `+521${formattedNumber.slice(2)}`;
  } else if (formattedNumber.startsWith('52') && formattedNumber.length >= 12) {
    formattedNumber = `+${formattedNumber}`;
  } else if (!formattedNumber.startsWith('+')) {
    formattedNumber = `+${formattedNumber}`;
  }
  return formattedNumber;
}

function esNumeroValido(numeroTelefono) {
  const regex = /^\+\d{7,15}$/;
  return regex.test(numeroTelefono);
}

async function start(file) {
  if (isRunning) return;
  isRunning = true;

  say('Criwilop-MD\nBot', {
    font: 'chrome',
    align: 'center',
    gradient: ['blue', 'cyan'],
  });

  say(`Bot creado por [Tu Nombre]`, {
    font: 'console',
    align: 'center',
    gradient: ['blue', 'cyan'],
  });

  verificarOCrearCarpetaAuth();

  if (verificarCredsJson()) {
    const args = [join(__dirname, file), ...process.argv.slice(2)];
    setupMaster({ exec: args[0], args: args.slice(1) });
    forkProcess(file);
    return;
  }

  const opcion = await question(chalk.yellowBright.bold('—◉ㅤSeleccione una opción (solo el numero):\n') + chalk.white.bold('1. Con código QR\n2. Con código de texto de 8 dígitos\n—> '));

  if (opcion === '2') {
    const phoneNumber = await question(chalk.yellowBright.bold('\n—◉ㅤEscriba su número de WhatsApp:\n') + chalk.white.bold('◉ㅤEjemplo: +5219992095479\n—> '));
    const numeroTelefono = formatearNumeroTelefono(phoneNumber);

    if (!esNumeroValido(numeroTelefono)) {
      console.log(chalk.bgRed(chalk.white.bold('[ ERROR ] Número inválido. Asegúrese de haber escrito su numero en formato internacional y haber comenzado con el código de país.\n—◉ㅤEjemplo:\n◉ +5219992095479\n')));
      process.exit(0);
    }

    process.argv.push('--phone=' + numeroTelefono);
    process.argv.push('--method=code');
  } else if (opcion === '1') {
    process.argv.push('--method=qr');
  }

  const args = [join(__dirname, file), ...process.argv.slice(2)];
  setupMaster({ exec: args[0], args: args.slice(1) });
  forkProcess(file);
}

function forkProcess(file) {
  childProcess = fork();

  childProcess.on('message', (data) => {
    console.log(chalk.green.bold('—◉ㅤRECIBIDO:'), data);
    switch (data) {
      case 'reset':
        console.log(chalk.yellow.bold('—◉ㅤSolicitud de reinicio recibida...'));
        childProcess.removeAllListeners();
        childProcess.kill('SIGTERM');
        isRunning = false;
        setTimeout(() => start(file), 1000);
        break;
      case 'uptime':
        childProcess.send(process.uptime());
        break;
    }
  });

  childProcess.on('exit', (code, signal) => {
    console.log(chalk.yellow.bold(`—◉ㅤProceso secundario terminado (${code || signal})`));
    isRunning = false;
    childProcess = null;

    if (code !== 0 || signal === 'SIGTERM') {
      console.log(chalk.yellow.bold('—◉ㅤReiniciando proceso...'));
      setTimeout(() => start(file), 1000);
    }
  });

  const opts = yargs(process.argv.slice(2)).argv;
  if (!opts.test) {
    rl.on('line', (line) => {
      childProcess.emit('message', line.trim());
    });
  }
}

try {
  start('main.js');
} catch (error) {
  console.error(chalk.red.bold('[ ERROR CRÍTICO ]:'), error);
  process.exit(1);
    }    }
    if (connection === "close") {
      if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectBot();
      }
    } else if (connection === "open") {
      console.log(chalk.green("✅ Bot conectado con éxito a WhatsApp!"));
    }
  });

  // Cargar plugins
  const plugins = await loadPlugins(join(__dirname, "plugins"));

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

main();
