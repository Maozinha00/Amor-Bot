const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");

const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    plugins: [
        new YtDlpPlugin()
    ]
});

client.on("ready", () => {
    console.log(`${client.user.tag} online.`);
});

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    const prefix = "!";

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);

    const cmd = args.shift().toLowerCase();

    if (cmd === "play") {

        const voiceChannel = message.member.voice.channel;

        const busca = args.join(" ");

        if (!voiceChannel)
            return message.reply("❌ Entre em um canal de voz.");

        if (!busca)
            return message.reply("❌ Informe uma música.");

        try {

            await client.distube.play(
                voiceChannel,
                busca,
                {
                    member: message.member,
                    textChannel: message.channel,
                    message
                }
            );

        } catch (err) {

            console.log(err);

            message.reply("❌ Não consegui tocar essa música.");

        }

    }

    if (cmd === "skip") {

        const queue = client.distube.getQueue(message);

        if (!queue)
            return message.reply("❌ Nada tocando.");

        queue.skip();

        message.reply("⏭ Música pulada.");

    }

    if (cmd === "stop") {

        const queue = client.distube.getQueue(message);

        if (!queue)
            return message.reply("❌ Nada tocando.");

        queue.stop();

        message.reply("⏹ Reprodução encerrada.");

    }

    if (cmd === "pause") {

        const queue = client.distube.getQueue(message);

        if (!queue)
            return message.reply("❌ Nada tocando.");

        queue.pause();

        message.reply("⏸ Música pausada.");

    }

    if (cmd === "resume") {

        const queue = client.distube.getQueue(message);

        if (!queue)
            return message.reply("❌ Nada tocando.");

        queue.resume();

        message.reply("▶ Música retomada.");

    }

});

client.distube
.on("playSong", (queue, song) => {

    queue.textChannel.send(
        `🎵 Tocando agora:\n**${song.name}**`
    );

})
.on("addSong", (queue, song) => {

    queue.textChannel.send(
        `➕ Adicionada à fila:\n**${song.name}**`
    );

});

client.login("SEU_TOKEN");
