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
"💖 Bom dia, Aurora! Henrique acordou pensando em você. Que seu dia seja tão lindo quanto o seu sorriso. ❤️",
"🌹 Aurora, amar você é a melhor escolha que Henrique fez na vida. 💕",
"🥰 Você é o primeiro pensamento do Henrique ao acordar e o último antes de dormir. ❤️",
"💞 Aurora, seu abraço é o lugar favorito do Henrique no mundo inteiro.",
"✨ Henrique ama cada detalhe em você e se apaixona um pouco mais todos os dias. 💖",
"🌸 Aurora, você é a paz que o coração do Henrique sempre procurou. ❤️",
"💘 Não importa o que aconteça, Henrique sempre vai escolher amar você. 💕",
"🌺 Aurora, sua felicidade é a maior felicidade do Henrique. ❤️",
"💕 Henrique tem orgulho de chamar você de amor da vida dele.",
"❤️ Aurora, você transformou a vida do Henrique em um lugar muito mais bonito.",
"💝 Henrique faria mil vezes o mesmo caminho só para encontrar você novamente.",
"🌷 Aurora, você é a razão dos melhores sorrisos do Henrique. ❤️",
"💖 Henrique acredita que o destino sorriu no dia em que colocou você em sua vida.",
"🥹 Aurora, seu carinho faz o coração do Henrique transbordar de felicidade. ❤️",
"🌹 Henrique promete amar você em todos os dias, nos bons e nos difíceis. 💕",
"💞 Aurora, seu amor é o maior presente que Henrique já recebeu.",
"✨ Henrique não precisa de mais nada quando tem você ao lado dele. ❤️",
"💕 Aurora, você é o sonho mais bonito que a vida realizou para Henrique.",
"❤️ Henrique ama seu jeitinho, sua voz, seu sorriso e tudo o que faz você ser única.",
"🌸 Aurora, você é a estrela mais brilhante no céu da vida do Henrique. 💖",
"💘 Henrique quer passar todos os amanheceres e entardeceres ao seu lado. ❤️",
"🌺 Aurora, você faz o mundo do Henrique ter mais cor e mais sentido. 💕",
"💝 Henrique nunca vai cansar de dizer o quanto ama você. ❤️",
"🥰 Aurora, cada 'eu te amo' do Henrique vem do fundo do coração. 💖",
"🌷 Você é a melhor companhia que Henrique poderia desejar para a vida inteira. ❤️",
"💞 Aurora, enquanto existir um amanhã, Henrique continuará amando você. 💕",
"✨ Henrique encontrou em você tudo o que sempre sonhou. ❤️",
"🌹 Aurora, seu sorriso é capaz de iluminar até os dias mais difíceis do Henrique. 💖",
"💕 Henrique ama construir lembranças ao seu lado e sonha com um futuro cheio de vocês dois. ❤️",
"❤️ Aurora, você é e sempre será o grande amor da vida do Henrique. 💍💕"
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
