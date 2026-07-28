// ==============================================================
// index.js - CÓDIGO ATUALIZADO COM COMANDO DE MÚSICA
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

// Importando DisTube e Plugins
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YouTubePlugin } = require("@distube/youtube");

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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates // NECESSÁRIO PARA MÚSICA
  ],
  partials: [Partials.Channel]
});

// Configuração do DisTube
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

// IDs CONFIGURADOS
const CANAL_AMOR_ID = "1515125878097711244";
const AURORA_ID = "569766846056759300";
const CANAL_FILHOS_ID = "1515125881272795158";
const CARGO_FILHOS_ID = "1515125824796233778";
const ID_BLOQUEADO = "1170916691199414314"; 

// --- FUNÇÕES DE AMOR E FILHOS (MANTIDAS) ---
function calcularDias() {
  const hoje = new Date();
  const inicio = new Date(botData.DATA_INICIO);
  const diff = hoje - inicio;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// --- EVENTOS DO DISTUBE (Para avisar quando a música toca) ---
distube.on("playSong", (queue, song) => {
  const embed = new EmbedBuilder()
    .setColor("#9b59b6")
    .setTitle("🎶 Tocando agora")
    .setDescription(`[${song.name}](${song.url})`)
    .addFields(
      { name: "Duração", value: song.formattedDuration, inline: true },
      { name: "Pedido por", value: song.user.tag, inline: true }
    )
    .setThumbnail(song.thumbnail);
  
  queue.textChannel.send({ embeds: [embed] });
});

distube.on("addSong", (queue, song) => {
  queue.textChannel.send(`✅ Adicionado à fila: **${song.name}**`);
});

// --- CLIENT READY ---
client.once(Events.ClientReady, () => {
  console.log(`💖 BOT ONLINE E MUSICAL: ${client.user.tag}`);
});

// --- PROCESSAMENTO DE MENSAGENS ---
client.on(Events.MessageCreate, async message => {
  if (message.author.bot || message.author.id === ID_BLOQUEADO) return;

  const args = message.content.trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // COMANDO !AURAPLAY
  if (command === "!auraplay") {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) return message.reply("❌ Você precisa estar em um canal de voz!");

    const musica = args.join(" ");
    if (!musica) return message.reply("❌ Digite o nome da música ou o link (YouTube, Spotify, SoundCloud)!");

    try {
      await distube.play(voiceChannel, musica, {
        message,
        textChannel: message.channel,
        member: message.member,
      });
    } catch (e) {
      console.error(e);
      message.reply("❌ Ocorreu um erro ao tentar tocar a música.");
    }
  }

  // COMANDO !AURASTOP
  if (command === "!aurastop") {
    distube.stop(message);
    message.reply("⏹️ Música parada e fila limpa!");
  }

  // COMANDO !AURASKIP
  if (command === "!auraskip") {
    distube.skip(message);
    message.reply("⏭️ Pulando música!");
  }

  // COMANDOS ORIGINAIS (!amor e !filhos)
  if (command === "!amor") {
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
  }

  if (command === "!filhos") {
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
  }
});

client.login(TOKEN);
