import express from 'express';
import fs from 'fs';
import {
    Client, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder,
    ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder,
    TextInputBuilder, TextInputStyle, Events, PermissionsBitField, ChannelType
} from "discord.js";

// ===============================
// CONFIGURAÇÃO E BANCO DE DADOS
// ===============================
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN || "SEU_DISCORD_BOT_TOKEN";

const CONFIG = {
    GUILD_ID: "1456655598031601727",
    CATEGORIA_RECRUTAMENTO: "1515125869968887868", // Onde os canais de entrevista serão criados
    CANAL_LOGS_GERAL: "",
    CANAL_RANKING: "ID_CANAL_RANKING",
    CARGO_STAFF: "ID_CARGO_STAFF", // Quem pode entrevistar
    CARGO_RECRUTA: "ID_CARGO_RECRUTA",
    CARGO_TESTE: "ID_CARGO_EM_TESTE",
    COLOR: "#2ECC71",
    COLOR_TRIAL: "#F1C40F",
    FOOTER: "Hunters Recruitment System v2.0"
};

// Simulação de Banco de Dados local
const dbPath = './database.json';
let DB = { users: {}, recruiters: {} };

if (fs.existsSync(dbPath)) {
    DB = JSON.parse(fs.readFileSync(dbPath));
}

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(DB, null, 4));
}

// ===============================
// INICIALIZAÇÃO
// ===============================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

// ===============================
// LOGICA DE RECRUTAMENTO
// ===============================

client.on(Events.InteractionCreate, async (interaction) => {
    
    // 1. Botão de Iniciar Processo (Postado pelo !painel)
    if (interaction.isButton() && interaction.customId === 'start_recruitment') {
        const user = DB.users[interaction.user.id];
        
        if (!user?.regrasConfirmadas) {
            return interaction.reply({ 
                content: "⚠️ Você precisa confirmar as regras no seu **PV** antes de iniciar o recrutamento!", 
                ephemeral: true 
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_recrutamento_completo')
            .setTitle('Formulário de Ingresso - Hunters');

        const fields = [
            new TextInputBuilder().setCustomId('nome_id').setLabel('Nome RP e ID').setPlaceholder('Ex: Bruno Hunter | 4502').setStyle(TextInputStyle.Short).setRequired(true),
            new TextInputBuilder().setCustomId('idade').setLabel('Sua Idade').setPlaceholder('Ex: 22').setStyle(TextInputStyle.Short).setRequired(true),
            new TextInputBuilder().setCustomId('exp').setLabel('Tempo de FiveM e Clãs anteriores').setStyle(TextInputStyle.Paragraph).setRequired(true),
            new TextInputBuilder().setCustomId('tempo_diario').setLabel('Horas disponíveis por dia').setPlaceholder('Ex: 6 horas').setStyle(TextInputStyle.Short).setRequired(true),
            new TextInputBuilder().setCustomId('recrutador').setLabel('Quem te convidou?').setStyle(TextInputStyle.Short).setRequired(true),
        ];

        modal.addComponents(fields.map(f => new ActionRowBuilder().addComponents(f)));
        return interaction.showModal(modal);
    }

    // 2. Recebimento do Formulário -> Criação do Ticket
    if (interaction.isModalSubmit() && interaction.customId === 'modal_recrutamento_completo') {
        await interaction.deferReply({ ephemeral: true });

        const dados = {
            nome: interaction.fields.getTextInputValue('nome_id'),
            idade: interaction.fields.getTextInputValue('idade'),
            exp: interaction.fields.getTextInputValue('exp'),
            tempo: interaction.fields.getTextInputValue('tempo_diario'),
            recrutador: interaction.fields.getTextInputValue('recrutador')
        };

        const channel = await interaction.guild.channels.create({
            name: `recrutamento-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CONFIG.CATEGORIA_RECRUTAMENTO,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: CONFIG.CARGO_STAFF, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ],
        });

        const embedEntrevista = new EmbedBuilder()
            .setColor(CONFIG.COLOR)
            .setTitle('🎯 NOVO CANDIDATO - AGUARDANDO ENTREVISTA')
            .setDescription(`Olá <@${interaction.user.id}>, este é seu canal de entrevista. Aguarde um recrutador.`)
            .addFields(
                { name: '👤 Candidato', value: `${dados.nome} (Idade: ${dados.idade})`, inline: true },
                { name: '⏰ Disponibilidade', value: dados.tempo, inline: true },
                { name: '🤝 Convidado por', value: dados.recrutador, inline: true },
                { name: '📖 Experiência', value: dados.exp }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`app_${interaction.user.id}`).setLabel('Aprovar Recruta').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`trial_${interaction.user.id}`).setLabel('Colocar em Teste').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`rej_${interaction.user.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `<@&${CONFIG.CARGO_STAFF}>`, embeds: [embedEntrevista], components: [row] });
        
        // Salva no DB
        DB.users[interaction.user.id] = { ...DB.users[interaction.user.id], ...dados, status: 'Entrevista' };
        saveDB();

        return interaction.editReply(`✅ Canal de entrevista criado: ${channel}`);
    }

    // 3. Ações da Staff (Aprovar, Teste, Recusar)
    if (interaction.isButton() && (interaction.customId.startsWith('app_') || interaction.customId.startsWith('trial_') || interaction.customId.startsWith('rej_'))) {
        const [acao, alvoId] = interaction.customId.split('_');
        const membro = await interaction.guild.members.fetch(alvoId);
        const userDB = DB.users[alvoId];

        if (acao === 'app') {
            await membro.roles.add(CONFIG.CARGO_RECRUTA);
            await membro.roles.remove(CONFIG.CARGO_TESTE).catch(() => {});
            userDB.status = 'Membro';
            
            // Contabiliza para o recrutador
            const recNome = userDB.recrutador.toLowerCase();
            DB.recruiters[recNome] = (DB.recruiters[recNome] || 0) + 1;
            
            await interaction.channel.send(`✅ <@${alvoId}> foi aprovado como Recruta oficial!`);
        } 
        
        else if (acao === 'trial') {
            await membro.roles.add(CONFIG.CARGO_TESTE);
            userDB.status = 'Em Teste';
            userDB.inicioTeste = Date.now();
            await interaction.channel.send(`🟡 <@${alvoId}> agora está em **Período de Teste** (7 dias).`);
        }

        else if (acao === 'rej') {
            userDB.status = 'Reprovado';
            await interaction.channel.send(`❌ Candidatura de <@${alvoId}> recusada.`);
            setTimeout(() => interaction.channel.delete(), 5000);
        }

        saveDB();
    }
});

// ===============================
// COMANDOS SLASH (EXEMPLOS)
// ===============================

client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot) return;

    // Comando para avaliar (/avaliar @user nota)
    if (msg.content.startsWith('!avaliar')) {
        const mention = msg.mentions.users.first();
        const nota = msg.content.split(' ')[2];
        if (!mention || !nota) return msg.reply("Uso: !avaliar @user 10");

        if (!DB.users[mention.id]) DB.users[mention.id] = {};
        DB.users[mention.id].nota = nota;
        saveDB();
        msg.reply(`⭐ Nota ${nota} atribuída a <@${mention.id}>`);
    }

    // Comando de Perfil
    if (msg.content.startsWith('!perfil')) {
        const mention = msg.mentions.users.first() || msg.author;
        const u = DB.users[mention.id];

        if (!u) return msg.reply("Jogador não encontrado no sistema.");

        const embed = new EmbedBuilder()
            .setColor(CONFIG.COLOR)
            .setTitle(`📄 FICHA HUNTERS: ${u.nome || mention.username}`)
            .addFields(
                { name: 'Status', value: u.status || 'N/A', inline: true },
                { name: 'Recrutador', value: u.recrutador || 'N/A', inline: true },
                { name: 'Nota Final', value: u.nota || 'Sem nota', inline: true }
            );
        msg.channel.send({ embeds: [embed] });
    }

    // Comando de Ranking
    if (msg.content === '!ranking') {
        const sorted = Object.entries(DB.recruiters).sort((a, b) => b[1] - a[1]);
        const lista = sorted.map((r, i) => `${i+1}º **${r[0]}**: ${r[1]} recrutas`).join('\n');
        
        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setTitle('🏆 RANKING DE RECRUTADORES')
            .setDescription(lista || "Nenhum recrutamento registrado.");
        
        msg.channel.send({ embeds: [embed] });
    }

    // Postar Painel Inicial
    if (msg.content === '!postarrecrutamento') {
        const embed = new EmbedBuilder()
            .setColor(CONFIG.COLOR)
            .setTitle('🎯 RECRUTAMENTO CLÃ HUNTERS')
            .setDescription('Você acha que tem o que é preciso para ser um Hunter?\n\n1. Leia as regras no seu PV.\n2. Tenha microfone de qualidade.\n3. Esteja disposto a aprender.\n\nClique no botão abaixo para preencher o formulário!');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('start_recruitment').setLabel('Quero Entrar na Hunters').setStyle(ButtonStyle.Success).setEmoji('🏹')
        );

        msg.channel.send({ embeds: [embed], components: [row] });
    }
});

// Regras no PV (Igual ao anterior, mas salvando no DB)
client.on(Events.InteractionCreate, async (i) => {
    if (i.isButton() && i.customId === 'confirmar_regras') {
        if (!DB.users[i.user.id]) DB.users[i.user.id] = {};
        DB.users[i.user.id].regrasConfirmadas = true;
        saveDB();
        i.reply({ content: "✅ Regras confirmadas! Agora você pode clicar em 'Quero Entrar' no canal de recrutamento.", ephemeral: true });
    }
});

client.login(TOKEN);

// Servidor Keep-Alive
const app = express();
app.get('/', (req, res) => res.send('Hunters OS Online'));
app.listen(3000);
