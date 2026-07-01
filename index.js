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
const FRASE_GRANDE = `
💖━━━━━━━━━━━━━━━━━━━━━━━━━━━━💖

🌹 Meu amor Aurora...

Se você estiver lendo isso agora, quero que saiba de uma coisa:

Você é o melhor presente que a vida já me deu.
Desde que você entrou na minha vida, tudo ganhou mais cor, mais paz e mais sentido.

Obrigado por existir.
Obrigado por cuidar do meu coração.
Obrigado por ser exatamente quem você é.

Eu prometo continuar escolhendo você todos os dias.
Nos dias fáceis.
Nos difíceis.
Nos momentos felizes.
E até quando a vida tentar nos testar.

Você é meu lar, meu sorriso favorito, minha paz e o amor da minha vida.

Eu te amo hoje.
Vou te amar amanhã.
E vou continuar te amando por toda a minha vida. ❤️

💖━━━━━━━━━━━━━━━━━━━━━━━━━━━━💖
`;

// ==============================
// MENSAGENS DE AMOR (SUAS)
// ==============================
const mensagensAmor = [

"🌹 Bom dia, meu amor. Espero que seu dia seja tão lindo quanto o sorriso que você coloca no rosto do Henrique todos os dias. Eu te amo infinitamente. ❤️",

"💖 Aurora, não existe um único dia em que Henrique não agradeça por ter você na vida dele. Você é seu maior presente. ❤️",

"🥹 Henrique ama cada pedacinho de você. Seu sorriso, sua voz, seu jeitinho... tudo faz o coração dele bater mais forte. 💕",

"🌸 Aurora, você é o motivo pelo qual Henrique acredita que o amor verdadeiro realmente existe. ❤️",

"💞 O maior sonho do Henrique é construir uma vida inteira ao seu lado e continuar fazendo você sorrir todos os dias. 💖",

"❤️ Henrique só precisa de uma coisa para ser feliz: você. Todo o resto é detalhe. 🌹",

"🌷 Aurora, você é o lugar onde o coração do Henrique sempre encontra paz. ❤️",

"💕 Henrique se apaixonaria por você mil vezes, em qualquer vida, em qualquer universo. Você sempre seria sua escolha. 💖",

"✨ Você faz Henrique querer ser uma pessoa melhor todos os dias. Obrigado por existir. ❤️",

"🥰 Henrique ama quando você sorri, porque naquele momento parece que o mundo inteiro fica mais bonito. 💕",

"🌹 Aurora, não importa quanto tempo passe, Henrique sempre vai olhar para você com o mesmo brilho nos olhos do primeiro dia. ❤️",

"💖 Você é o pensamento mais bonito do Henrique ao acordar e a melhor lembrança antes de dormir. ❤️",

"🌸 Henrique nunca imaginou que alguém pudesse fazer o coração dele transbordar tanto amor... até conhecer você. 💞",

"❤️ Aurora, você é o abraço que Henrique sempre quer encontrar depois de um dia difícil. 💕",

"💝 Henrique ama fazer planos para o futuro, porque em todos eles você está ao lado dele. ❤️",

"🌷 O coração do Henrique sorri toda vez que lembra que tem você. 💖",

"🥹 Aurora, você é muito mais do que um amor... você é a pessoa que dá sentido à vida do Henrique. ❤️",

"💞 Henrique prometeu amar você todos os dias, e essa promessa fica mais forte a cada amanhecer. 💖",

"🌹 Não importa onde Henrique esteja... uma parte do coração dele sempre estará com você. ❤️",

"💕 Aurora, você é a melhor parte de todos os dias do Henrique. ❤️",

"✨ Henrique ama ouvir sua voz, ver seu sorriso e simplesmente saber que você existe. 💖",

"❤️ Se Henrique pudesse fazer um pedido para a vida inteira, pediria apenas para continuar segurando sua mão. 🌹",

"🌸 Aurora, você é a definição de felicidade para Henrique. 💕",

"🥰 Henrique nunca vai se cansar de dizer o quanto ama você, porque esse amor só cresce. ❤️",

"💖 O tempo passa, mas o amor do Henrique por você fica cada dia maior. 🌷",

"🌹 Henrique quer envelhecer ao seu lado, rir das mesmas piadas bobas e continuar chamando você de amor para sempre. ❤️",

"💞 Aurora, você faz Henrique acreditar que o destino escreveu a história mais bonita quando colocou vocês dois juntos. 💖",

"❤️ Henrique ama você muito mais do que qualquer palavra conseguiria explicar. 💕",

"🥹 Se o coração do Henrique pudesse falar, ele repetiria o seu nome o dia inteiro. ❤️",

"💍 Aurora... você sempre será o amor da vida do Henrique, hoje, amanhã e para sempre. Eu te amo infinitamente. ❤️"
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
.setTitle("💌 Uma cartinha de amor do Henrique")
.setFooter({
    text: "❤️ Feito com todo amor para Aurora ❤️"
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

if (message.content.trim().toLowerCase() === "!amor") {
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
