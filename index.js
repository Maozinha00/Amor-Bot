// ==============================================================
// index.js - CÓDIGO PRINCIPAL DO DISCORD BOT
// ==============================================================

try {
  require("dotenv").config();
} catch (e) {}

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  Events
} = require("discord.js");

const botData = require("./messages.js");

function limparToken(tokenCru) {
  if (!tokenCru) return "";
  let tokenLimpo = tokenCru.trim();
  if ((tokenLimpo.startsWith('"') && tokenLimpo.endsWith('"')) || 
      (tokenLimpo.startsWith("'") && tokenLimpo.endsWith("'"))) {
    tokenLimpo = tokenLimpo.slice(1, -1).trim();
  }
  return tokenLimpo;
}

const TOKEN = limparToken(process.env.TOKEN);

if (!TOKEN || TOKEN.trim() === "") {
  console.error("ERRO: TOKEN não configurado!");
  process.exit(1);
}

// ==============================
// CONFIGURAÇÕES DE ID
// ==============================
const CANAL_AMOR_ID = "1515125878097711244";
const AURORA_ID = "569766846056759300";
const CANAL_FILHOS_ID = "1515125881272795158";
const CARGO_FILHOS_ID = "1515125824796233778";

// ID QUE SERÁ BLOQUEADO DE USAR O BOT
const ID_BLOQUEADO = "1170916691199414314"; 

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

global.ultimoEnvioAmor = null;
global.ultimoEnvioFilhos = null;

function calcularDias() {
  const hoje = new Date();
  const inicio = new Date(botData.DATA_INICIO);
  const diff = hoje - inicio;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

async function enviarAmor() {
  try {
    const canal = await client.channels.fetch(CANAL_AMOR_ID);
    if (!canal) return;
    const lista = botData.mensagensAmor;
    const msgRandom = lista[Math.floor(Math.random() * lista.length)];
    const dias = calcularDias();
    const embed = new EmbedBuilder()
      .setColor("#ff4d88")
      .setTitle("💌 Uma cartinha de amor do Henrique")
      .setDescription(botData.FRASE_GRANDE + "\n\n" + msgRandom + "\n\n💍 **Dias juntos:** " + dias + " dias ❤️")
      .setFooter({ text: "❤️ Feito com todo amor para Aurora ❤️" })
      .setTimestamp();
    await canal.send({ content: `🌹 <@${AURORA_ID}> ❤️ O Henrique te ama muito!`, embeds: [embed] });
  } catch (error) { console.error(error); }
}

async function enviarFilhos() {
  try {
    const canal = await client.channels.fetch(CANAL_FILHOS_ID);
    if (!canal) return;
    const lista = botData.mensagensFilhos;
    const msgRandom = lista[Math.floor(Math.random() * lista.length)];
    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle("🌟 Mensagem Especial de Bom Dia! 🌟")
      .setDescription("👨‍👩‍👧‍👦 **Bom dia, família amada!**\n\n" + msgRandom + "\n\n❤️ **Papai e mamãe amam infinitamente cada um de vocês!** ❤️")
      .setFooter({ text: "👨‍👩‍👧‍👦 Família Abençoada" })
      .setTimestamp();
    await canal.send({ content: `☀️ <@&${CARGO_FILHOS_ID}> Bom dia!`, embeds: [embed] });
  } catch (error) { console.error(error); }
}

client.once(Events.ClientReady, () => {
  console.log(`💖 BOT ONLINE: ${client.user.tag}`);
  setInterval(() => {
    const now = new Date();
    const hojeStr = now.toDateString();
    if (now.getHours() === 8 && now.getMinutes() === 30) {
      if (global.ultimoEnvioAmor !== hojeStr) { global.ultimoEnvioAmor = hojeStr; enviarAmor(); }
      if (global.ultimoEnvioFilhos !== hojeStr) { global.ultimoEnvioFilhos = hojeStr; enviarFilhos(); }
    }
  }, 45000);
});

// ==============================
// RECPÇÃO DE MENSAGENS (COMANDOS)
// ==============================
client.on(Events.MessageCreate, async message => {
  // 1. Ignora se for outro bot
  if (message.author.bot) return;

  // 2. BLOQUEIO: Se o ID do usuário for o ID bloqueado, o bot ignora completamente
  if (message.author.id === ID_BLOQUEADO) {
    return; // O bot não responde e não processa nada para este usuário
  }

  const content = message.content.trim().toLowerCase();

  if (content === "!amor") {
    try {
      const canal = await client.channels.fetch(CANAL_AMOR_ID).catch(() => null);
      if (!canal) return message.reply("❌ Canal não encontrado!");
      const lista = botData.mensagensAmor;
      const msgRandom = lista[Math.floor(Math.random() * lista.length)];
      const dias = calcularDias();
      const embed = new EmbedBuilder()
        .setColor("#ff4d88")
        .setTitle("💖 Mensagem de Amor 💖")
        .setDescription(botData.FRASE_GRANDE + "\n\n" + msgRandom + "\n\n💍 **Juntos há:** " + dias + " dias ❤️")
        .setFooter({ text: "❤️ Aurora ❤️" }).setTimestamp();
      await canal.send({ content: `🌹 <@${AURORA_ID}> 💖`, embeds: [embed] });
      await message.reply("💖 Enviada!");
    } catch (error) { console.error(error); }
  }

  if (content === "!filhos") {
    try {
      const canal = await client.channels.fetch(CANAL_FILHOS_ID).catch(() => null);
      if (!canal) return message.reply("❌ Canal não encontrado!");
      const lista = botData.mensagensFilhos;
      const msgRandom = lista[Math.floor(Math.random() * lista.length)];
      const embed = new EmbedBuilder()
        .setColor("#3498db")
        .setTitle("👨‍👩‍👧‍👦 Mensagem para os Filhos 🌟")
        .setDescription(msgRandom + "\n\n❤️ Papai e Mamãe amam vocês!")
        .setFooter({ text: "👨‍👩‍👧‍👦 Família" }).setTimestamp();
      await canal.send({ content: `☀️ <@&${CARGO_FILHOS_ID}>`, embeds: [embed] });
      await message.reply("👨‍👩‍👧‍👦 Enviada!");
    } catch (error) { console.error(error); }
  }
});

client.login(TOKEN);
