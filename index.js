// ==============================================================
// index.js - BOT COM SISTEMA DE MÚSICA (AURA)
// ==============================================================

require("dotenv").config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, Events } = require("discord.js");
const { DisTube } = require("distube");
const { YouTubePlugin } = require("@distube/youtube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const botData = require("./messages.js");

// --- CONFIGURAÇÕES DO CLIENTE ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates // Obrigatório para música
  ],
  partials: [Partials.Channel]
});

// --- CONFIGURAÇÃO DO DISTUBE (O Motor da Música) ---
const distube = new DisTube(client, {
  plugins: [
    new YouTubePlugin(),
    new SpotifyPlugin(),
    new SoundCloudPlugin()
  ],
  leaveOnEmpty: true,
  leaveOnFinish: false,
  emitNewSongOnly: true,
});

// --- IDs (Mantidos do seu código) ---
const CANAL_AMOR_ID = "1515125878097711244";
const AURORA_ID = "569766846056759300";
const CANAL_FILHOS_ID = "1515125881272795158";
const CARGO_FILHOS_ID = "1515125824796233778";
const ID_BLOQUEADO = "1170916691199414314";

// --- EVENTOS DA MÚSICA (Avisos no chat) ---
distube.on("playSong", (queue, song) => {
  const embed = new EmbedBuilder()
    .setColor("#ff4d88")
    .setTitle("🎶 Tocando Agora")
    .setDescription(`**[${song.name}](${song.url})**`)
    .addFields(
      { name: "Duração", value: song.formattedDuration, inline: true },
      { name: "Pedido por", value: `${song.user}`, inline: true }
    )
    .setThumbnail(song.thumbnail);
  
  queue.textChannel.send({ embeds: [embed] });
});

distube.on("addSong", (queue, song) => {
  queue.textChannel.send(`✅ **${song.name}** adicionada à fila por ${song.user}!`);
});

distube.on("error", (channel, e) => {
  console.error(e);
  channel.send(`❌ Erro: ${e.message.slice(0, 1900)}`);
});

// --- LOGICA DE MENSAGENS AUTOMÁTICAS (Mantida) ---
function calcularDias() {
  const inicio = new Date(botData.DATA_INICIO);
  const diff = new Date() - inicio;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// --- COMANDOS ---
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || message.author.id === ID_BLOQUEADO) return;

  const args = message.content.trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // COMANDO DE MÚSICA PRINCIPAL
  if (command === "!auraplay") {
    const busca = args.join(" ");
    const voiceChannel = message.member?.voice.channel;

    if (!voiceChannel) return message.reply("❌ Você precisa entrar em um canal de voz primeiro!");
    if (!busca) return message.reply("❌ Diga o nome da música ou cole um link do YouTube/Spotify!");

    try {
      await distube.play(voiceChannel, busca, {
        message,
        textChannel: message.channel,
        member: message.member,
      });
    } catch (e) {
      message.reply("❌ Não consegui tocar essa música.");
    }
  }

  // OUTROS COMANDOS DE MÚSICA
  if (command === "!aurastop") {
    const queue = distube.getQueue(message);
    if (!queue) return message.reply("❌ Não tem nada tocando!");
    distube.stop(message);
    message.reply("⏹️ Música parada e saí do canal.");
  }

  if (command === "!auraskip") {
    const queue = distube.getQueue(message);
    if (!queue) return message.reply("❌ Não há mais músicas na fila!");
    try {
      await distube.skip(message);
      message.reply("⏭️ Pulada!");
    } catch { message.reply("❌ Não consegui pular."); }
  }

  // --- SEUS COMANDOS ORIGINAIS ---
  if (command === "!amor") {
    const lista = botData.mensagensAmor;
    const msgRandom = lista[Math.floor(Math.random() * lista.length)];
    const embed = new EmbedBuilder()
      .setColor("#ff4d88")
      .setTitle("💖 Mensagem de Amor")
      .setDescription(`${botData.FRASE_GRANDE}\n\n${msgRandom}\n\n💍 Juntos há: ${calcularDias()} dias`)
      .setTimestamp();
    message.channel.send({ content: `🌹 <@${AURORA_ID}>`, embeds: [embed] });
  }

  if (command === "!filhos") {
    const lista = botData.mensagensFilhos;
    const msgRandom = lista[Math.floor(Math.random() * lista.length)];
    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle("👨‍👩‍👧‍👦 Para meus filhos")
      .setDescription(msgRandom)
      .setTimestamp();
    message.channel.send({ content: `☀️ <@&${CARGO_FILHOS_ID}>`, embeds: [embed] });
  }
});

// Limpeza de Token e Login
const TOKEN = process.env.TOKEN?.replace(/['"]/g, "").trim();
client.login(TOKEN);
