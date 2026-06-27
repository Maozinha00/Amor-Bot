const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  Events
} = require("discord.js");

const TOKEN = process.env.TOKEN;

// ==============================
// IDS
// ==============================
const CANAL_AMOR_ID = "1515125878097711244";
const AURORA_ID = "569766846056759300";

// ==============================
// DATA DO INÍCIO DO RELACIONAMENTO
// ==============================
const DATA_INICIO = new Date("2026-01-22");

// ==============================
// FRASE GRANDE FIXA
// ==============================
const FRASE_GRANDE = `
💖💖💖💖💖💖💖💖💖💖💖💖💖

🌹 AURORA, ISSO É IMPORTANTE:

O HENRIQUE TE AMA DE UMA FORMA QUE NÃO CABE EM PALAVRAS.
DESDE O PRIMEIRO DIA ATÉ HOJE, VOCÊ É O AMOR DA VIDA DELE.

💖💖💖💖💖💖💖💖💖💖💖💖💖
`;

// ==============================
// MENSAGENS DE AMOR (SUAS)
// ==============================
const mensagensAmor = [
  "💖 Bom dia, Aurora! O Henrique quer que você saiba que ele te ama mais do que qualquer coisa neste mundo. ❤️",
  "🌹 Aurora, você ilumina todos os dias do Henrique. Ele te ama infinitamente. 💕",
  "🥰 Henrique é apaixonado por você e agradece todos os dias por ter você em sua vida. ❤️",
  "💞 Aurora, você é o motivo do sorriso do Henrique. Nunca esqueça que ele te ama muito.",
  "✨ Você é a pessoa mais especial da vida do Henrique. Te amo para sempre, Aurora. ❤️",
  "🌸 Aurora, cada segundo ao seu lado vale uma eternidade. Henrique ama você demais. 💖",
  "💘 Henrique ama você hoje, amanhã e por toda a vida. ❤️",
  "🌺 Aurora, você faz o coração do Henrique bater mais forte todos os dias.",
  "💕 O amor do Henrique por você cresce a cada amanhecer. Tenha um dia maravilhoso, Aurora!",
  "❤️ Henrique só queria lembrar que você é o amor da vida dele.",
  "💝 Aurora, você é linda, incrível e perfeita aos olhos do Henrique.",
  "🌷 Henrique sempre vai cuidar de você com todo carinho do mundo. ❤️",
  "💖 Você é o sonho realizado do Henrique, Aurora.",
  "🥹 Henrique agradece a Deus todos os dias por ter encontrado você.",
  "❤️ Não existe distância, tempo ou dificuldade que diminua o amor que Henrique sente por você.",
  "🌹 Aurora, você é a melhor parte da vida do Henrique.",
  "💕 Henrique ama seu sorriso, seu jeito e tudo o que faz você ser especial.",
  "💞 Você é o presente mais precioso que a vida deu ao Henrique.",
  "✨ Aurora, nunca duvide: Henrique ama você de todo coração.",
  "❤️ Que seu dia seja lindo, meu amor. Henrique sempre estará ao seu lado."
];

// ==============================
// CLIENT
// ==============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ==============================
// CALCULAR DIAS JUNTOS
// ==============================
function calcularDias() {
  const hoje = new Date();
  const diff = hoje - DATA_INICIO;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ==============================
// ENVIAR AMOR
// ==============================
async function enviarAmor() {
  const canal = await client.channels.fetch(CANAL_AMOR_ID).catch(() => null);
  if (!canal) return;

  const msg =
    mensagensAmor[Math.floor(Math.random() * mensagensAmor.length)];

  const dias = calcularDias();

  const embed = new EmbedBuilder()
    .setColor("#ff4d88")
    .setTitle("💖 Amor do Henrique 💖")
    .setDescription(
      FRASE_GRANDE +
      "\n\n" +
      msg +
      "\n\n💍 **Dias juntos:** " +
      dias +
      " dias ❤️"
    )
    .setTimestamp();

  await canal.send({
    content: `🌹 <@${AURORA_ID}> ❤️ O Henrique te ama muito!`,
    embeds: [embed]
  });
}

// ==============================
// READY
// ==============================
client.once(Events.ClientReady, () => {
  console.log(`💖 BOT AMOR ONLINE: ${client.user.tag}`);

  setInterval(() => {
    const now = new Date();
    const today = now.toDateString();

    if (
      now.getHours() === 8 &&
      now.getMinutes() === 30 &&
      global.ultimoEnvio !== today
    ) {
      global.ultimoEnvio = today;
      enviarAmor();
    }
  }, 30000);
});

// ==============================
// COMANDO !AMOR
// ==============================
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  if (message.content === "!amor") {
    const canal = await client.channels.fetch(CANAL_AMOR_ID).catch(() => null);
    if (!canal) return;

    const msg =
      mensagensAmor[Math.floor(Math.random() * mensagensAmor.length)];

    const dias = calcularDias();

    const embed = new EmbedBuilder()
      .setColor("#ff4d88")
      .setTitle("💖 Mensagem de Amor 💖")
      .setDescription(
        FRASE_GRANDE +
        "\n\n" +
        msg +
        "\n\n💍 **Estamos juntos há:** " +
        dias +
        " dias ❤️"
      )
      .setTimestamp();

    await canal.send({
      content: `🌹 <@${AURORA_ID}> 💖`,
      embeds: [embed]
    });

    message.reply("💖 Mensagem enviada!");
  }
});

// ==============================
// LOGIN
// ==============================
client.login(TOKEN);
