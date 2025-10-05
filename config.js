import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs';
import moment from 'moment-timezone';

global.botnumber = ""; 
global.confirmCode = "";
global.authFile = `Session`;

global.isBaileysFail = false;

global.defaultLenguaje = 'es';

global.owner = [
  ['573238031915', 'Owner', true] 
];

global.suittag = [];
global.prems = [];

// Api
global.BASE_API_DELIRIUS = "https://delirius-apiofc.vercel.app";

global.packname = 'Sticker';
global.author = 'WorkCwp';
global.wm = 'Criwilop-MD';
global.titulowm = 'Criwilop-MD';
global.titulowm2 = `Criwilop-MD`;
global.igfg = 'Criwilop-MD';
global.wait = '*_⏳ Cargando..._*';

global.imagen1 = fs.readFileSync('./src/menu.png'); 

global.mods = [];

// Time
global.d = new Date(new Date + 3600000);
global.locale = 'es';
global.dia = d.toLocaleDateString(locale, { weekday: 'long' });
global.fecha = d.toLocaleDateString('es', { day: 'numeric', month: 'numeric', year: 'numeric' });
global.mes = d.toLocaleDateString('es', { month: 'long' });
global.año = d.toLocaleDateString('es', { year: 'numeric' });
global.tiempo = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
//* ****************************
global.wm2 = `${dia} ${fecha}\nCriwilop-MD`;
global.gt = 'Criwilop-MD';
global.mysticbot = 'Criwilop-MD';
global.channel = 'https://whatsapp.com/channel/0029Var8MeMFcow0snkoLy2R';
global.md = 'https://github.com/WorkCwp/Criwilop-MD';
global.mysticbot = 'https://github.com/WorkCwp/Criwilop-MD';
global.waitt = '*_⏳ Cargando..._*';
global.waittt = '*_⏳ Cargando..._*';
global.waitttt = '*_⏳ Cargando..._*';
global.nomorown = '573238031915';
global.pdoc = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/msword', 'application/pdf', 'text/rtf'];
global.botdate = `*📅 Fecha:*  ${moment.tz('America/Mexico_City').format('DD/MM/YY')}`;
global.bottime = `*⏳ Hora:* ${moment.tz('America/Mexico_City').format('HH:mm:ss')}`;
global.fgif = { key: { participant: '0@s.whatsapp.net' }, message: { 'videoMessage': { 'title': wm, 'h': `Hmm`, 'seconds': '999999999', 'gifPlayback': 'true', 'caption': bottime, 'jpegThumbnail': fs.readFileSync('./src/menu.png')}}};
global.multiplier = 99;

const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright('Update \'config.js\''));
  import(`${file}?update=${Date.now()}`);
});
