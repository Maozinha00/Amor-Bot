// ==============================================================
// index.js - CÓDIGO PRINCIPAL DO DISCORD BO
// Desenvolvido para utilizar o arquivo separado "messages.js"
// ==============================================================

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  Events
} = require("discord.js");

// Importando as mensagens do arquivo separado!
const botData = require("./messages.js");

const TOKEN = process.env.TOKEN || "MTUyMDM5Njk2NTg5MDg4MzU4NA.GlEXZw.H6BdDD9HLPpjnqtjuKJil5-zDXfDQhFNEBfA38";

// ==============================
// CONFIGURAÇÕES DE ID (CONFIGURADAS NO DASHBOARD)
// ==============================
const CANAL_AMOR_ID = "1515125878097711244";
const AURORA_ID = "569766846056759300";
const CANAL_FILHOS_ID = "1515125881272795158";
const CARGO_FILHOS_ID = "1515125824796233778";

// Inicialização do cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Variável global para evitar múltiplos envios no mesmo dia
global.ultimoEnvioAmor = null;
global.ultimoEnvioFilhos = null;

// ==============================
// FUNÇÃO DE CÁLCULO DE DIAS JUNTOS
// ==============================
function calcularDias() {
  const hoje = new Date();
  const inicio = new Date(botData.DATA_INICIO);
  const diff = hoje - inicio;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ==============================
// ENVIAR MENSAGEM DE AMOR (AURORA)
// ==============================
async function enviarAmor() {
  try {
    const canal = await client.channels.fetch(CANAL_AMOR_ID);
    if (!canal) return console.log("Canal de Amor não encontrado.");

    const lista = botData.mensagensAmor;
    const msgRandom = lista[Math.floor(Math.random() * lista.length)];
    const dias = calcularDias();

    const embed = new EmbedBuilder()
      .setColor("#ff4d88")
      .setTitle("💌 Uma cartinha de amor do Henrique")
      .setDescription(
        botData.FRASE_GRANDE +
        "\n\n" +
        msgRandom +
        "\n\n💍 **Dias juntos:** " +
        dias +
        " dias ❤️"
      )
      .setFooter({ text: "❤️ Feito com todo amor para Aurora ❤️" })
      .setTimestamp();

    await canal.send({
      content: `🌹 <@${AURORA_ID}> ❤️ O Henrique te ama muito!`,
      embeds: [embed]
    });
    console.log("💌 Cartinha de amor enviada para Aurora com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar mensagem de amor:", error);
  }
}

// ==============================
// ENVIAR MENSAGEM DOS FILHOS
// ==============================
async function enviarFilhos() {
  try {
    const canal = await client.channels.fetch(CANAL_FILHOS_ID);
    if (!canal) return console.log("Canal dos Filhos não encontrado.");

    const lista = botData.mensagensFilhos;
    const msgRandom = lista[Math.floor(Math.random() * lista.length)];

    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle("🌟 Mensagem Especial de Bom Dia! 🌟")
      .setDescription(
        "👨‍👩‍👧‍👦 **Bom dia, família amada!**\n\n" +
        msgRandom +
        "\n\n❤️ **Papai e mamãe amam infinitamente cada um de vocês!** ❤️"
      )
      .setFooter({ text: "👨‍👩‍👧‍👦 Família Abençoada • Sempre Unidos" })
      .setTimestamp();

    await canal.send({
      content: `☀️ <@&${CARGO_FILHOS_ID}> Bom dia, meus amores! Papai e mamãe amam muito vocês! 👨‍👩‍👧‍👦`,
      embeds: [embed]
    });
    console.log("👨‍👩‍👧‍👦 Mensagem carinhosa de bom dia enviada para os filhos!");
  } catch (error) {
    console.error("Erro ao enviar mensagem para os filhos:", error);
  }
}

// ==============================
// EVENTO READY (INICIALIZAÇÃO DO BOT)
// ==============================
client.once(Events.ClientReady, () => {
  console.log(`💖 BOT AMOR E FILHOS ONLINE: ${client.user.tag}`);

  // Verificação periódica para enviar às 08:30 da manhã
  setInterval(() => {
    const now = new Date();
    // Ajuste opcional para fuso horário se necessário
    const hojeStr = now.toDateString();

    if (now.getHours() === 8 && now.getMinutes() === 30) {
      // Envio Aurora
      if (global.ultimoEnvioAmor !== hojeStr) {
        global.ultimoEnvioAmor = hojeStr;
        enviarAmor();
      }
      // Envio Filhos
      if (global.ultimoEnvioFilhos !== hojeStr) {
        global.ultimoEnvioFilhos = hojeStr;
        enviarFilhos();
      }
    }
  }, 45000); // Roda a cada 45 segundos para verificar o horário exato
});

// ==============================
// RECPÇÃO DE MENSAGENS (COMANDOS)
// ==============================
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  const content = message.content.trim().toLowerCase();

  // COMANDO !AMOR
  if (content === "!amor") {
    const lista = botData.mensagensAmor;
    const msgRandom = lista[Math.floor(Math.random() * lista.length)];
    const dias = calcularDias();

    const embed = new EmbedBuilder()
      .setColor("#ff4d88")
      .setTitle("💖 Mensagem de Amor 💖")
      .setDescription(
        botData.FRASE_GRANDE +
        "\n\n" +
        msgRandom +
        "\n\n💍 **Estamos juntos há:** " +
        dias +
        " dias ❤️"
      )
      .setFooter({ text: "❤️ Feito com todo amor para Aurora ❤️" })
      .setTimestamp();

    await message.channel.send({
      content: `🌹 <@${AURORA_ID}> 💖`,
      embeds: [embed]
    });

    await message.reply("💖 Mensagem de amor enviada com sucesso!");
  }

  // COMANDO !FILHOS (PEDIDO PELO CLIENTE)
  if (content === "!filhos") {
    const lista = botData.mensagensFilhos;
    const msgRandom = lista[Math.floor(Math.random() * lista.length)];

    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle("👨‍👩‍👧‍👦 Mensagem para os Filhos de Papai e Mamãe 🌟")
      .setDescription(
        msgRandom +
        "\n\n❤️ **Vocês são o nosso maior orgulho. O papai e a mamãe amam vocês infinitamente!**"
      )
      .setFooter({ text: "👨‍👩‍👧‍👦 Família Abençoada" })
      .setTimestamp();

    await message.channel.send({
      content: `☀️ <@&${CARGO_FILHOS_ID}> Olhem aqui, meus amores! Papai e mamãe mandaram uma mensagem! 💕`,
      embeds: [embed]
    });

    await message.reply("👨‍👩‍👧‍👦 Mensagem enviada para todos os filhos com menção ao cargo!");
  }
});

// Login do Bot
client.login(TOKEN);
