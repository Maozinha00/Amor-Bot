/**
 * ====================================================================
 * BOT DISCORD OFICIAL — CLASH OF CLÃS (FIVEM / DISCORD.JS V14)
 * ====================================================================
 * Servidor (GUILD_ID): 1456655598031601727
 * Canal Enquete (CHANNEL_ID): 1515125864033943712
 * ====================================================================
 */

require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
});

// Configurações dos IDs do Servidor e Canal
const CONFIG = {
  GUILD_ID: process.env.GUILD_ID || "1456655598031601727",
  CHANNEL_ID: process.env.CHANNEL_ID || "1515125864033943712",
  BOT_TOKEN: process.env.DISCORD_TOKEN
};

// Armazenamento local das lineups dos clãs
const clanData = new Map();

client.once(Events.ClientReady, (readyClient) => {
  console.log(`==================================================`);
  console.log(`✅ BOT CLASH OF CLÃS ONLINE COMO: ${readyClient.user.tag}`);
  console.log(`🏰 GUILD ID CONECTADO: ${CONFIG.GUILD_ID}`);
  console.log(`📢 CANAL DE ENQUETE ATIVO: ${CONFIG.CHANNEL_ID}`);
  console.log(`==================================================`);
});

/**
 * 1. ENVIAR A MENSAGEM DE ENQUETE OFICIAL (!enquete)
 */
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content === '!enquete' || message.content === '!clash') {
    if (message.channelId !== CONFIG.CHANNEL_ID && message.channel.type !== 1) {
      return message.reply(`⚠️ Utilize este comando no canal correto de inscrições: <#${CONFIG.CHANNEL_ID}>`);
    }

    const embed = new EmbedBuilder()
      .setTitle('📝 MODELO DE INSCRIÇÃO — CLASH OF CLÃS')
      .setColor(0xF59E0B) // Amarelo/Âmbar
      .setDescription(
        `🏰 **CLÃ: TAG + Nome por extenso**\n` +
        `Exemplo:\nUBC — UMBRELLA CORPORATION\n\n` +
        `📍 **COMANDO DE PUXADA:**\n` +
        `\`\`\`tptome 1; tptome 2; tptome 3; tptome 4; tptome 5; tptome 6; tptome 7; tptome 8; tptome 9; tptome 10;\`\`\`\n\n` +
        `⚠️ **ATENÇÃO:** Inscrições fora do padrão ou uso incorreto do comando podem gerar atraso ou até desclassificação do clã.\n` +
        `Siga corretamente o formato acima para confirmar a sua vaga.\n\n` +
        `👇 **CLIQUE NO BOTÃO ABAIXO OU REAGA COM 👍 PARA CONFIRMAR A PRESENÇA DO SEU JOGADOR/CLÃ**`
      )
      .setFooter({ text: 'Clash de Clãs — Bot Oficial de Puxada tptome' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_joia_registration')
        .setLabel('Confirmar Presença 👍 (Joia)')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('view_tptome_list')
        .setLabel('Ver Lista de Puxada (tptome)')
        .setStyle(ButtonStyle.Secondary)
    );

    const pollMessage = await message.channel.send({ embeds: [embed], components: [row] });
    await pollMessage.react('👍');
  }
});

/**
 * 2. MONITOR DE REAÇÕES 👍 NO CANAL ESPECÍFICO (1515125864033943712)
 */
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try { await reaction.fetch(); } catch (error) { return; }
  }

  // Verifica se a reação foi feita no canal do evento com o emoji 👍
  if (reaction.message.channelId === CONFIG.CHANNEL_ID && reaction.emoji.name === '👍') {
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle('👍 Confirmação de Presença — Clash de Clãs')
        .setColor(0xF59E0B)
        .setDescription(`Olá **${user.username}**! Você reagiu com 👍 na enquete do Clash de Clãs.\n\nPara cadastrar seu ID de puxada no comando \`tptome\`, clique no botão **Confirmar Presença 👍** na mensagem da enquete.`);

      await user.send({ embeds: [dmEmbed] });
    } catch (err) {
      console.log(`Não foi possível enviar mensagem privada para ${user.tag}.`);
    }
  }
});

/**
 * 3. PROCESSAMENTO DE FORMULÁRIOS (MODALS E BOTÕES)
 */
client.on(Events.InteractionCreate, async (interaction) => {
  
  if (interaction.isButton() && interaction.customId === 'confirm_joia_registration') {
    const modal = new ModalBuilder()
      .setCustomId('modal_registration')
      .setTitle('Inscrição no Clash de Clãs');

    const clanInput = new TextInputBuilder()
      .setCustomId('clan_tag')
      .setLabel('TAG do Clã (Ex: UBC)')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(10)
      .setRequired(true);

    const clanNameInput = new TextInputBuilder()
      .setCustomId('clan_name')
      .setLabel('Nome Extenso do Clã (Ex: UMBRELLA CORPORATION)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const ingameIdInput = new TextInputBuilder()
      .setCustomId('ingame_id')
      .setLabel('Seu ID Numérico no FiveM (Ex: 42)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(clanInput),
      new ActionRowBuilder().addComponents(clanNameInput),
      new ActionRowBuilder().addComponents(ingameIdInput)
    );

    await interaction.showModal(modal);
  }

  if (interaction.isButton() && interaction.customId === 'view_tptome_list') {
    if (clanData.size === 0) {
      return interaction.reply({ content: '⚠️ Nenhum clã cadastrado até o momento.', ephemeral: true });
    }

    let resultText = '📍 **COMANDOS DE PUXADA PARA A STAFF:**\n\n';
    clanData.forEach((clan, tag) => {
      const ids = clan.players.map(p => `tptome ${p.ingameId};`).join(' ');
      resultText += `🏰 **[${tag}] ${clan.clanName}** (${clan.players.length}/10 players):\n\`\`\`${ids}\`\`\`\n`;
    });

    await interaction.reply({ content: resultText, ephemeral: true });
  }

  if (interaction.isModalSubmit() && interaction.customId === 'modal_registration') {
    const tag = interaction.fields.getTextInputValue('clan_tag').toUpperCase().trim();
    const name = interaction.fields.getTextInputValue('clan_name').toUpperCase().trim() || tag;
    const ingameId = interaction.fields.getTextInputValue('ingame_id').trim();

    if (!clanData.has(tag)) {
      clanData.set(tag, { clanName: name, players: [] });
    }

    const clan = clanData.get(tag);
    if (!clan.players.some(p => p.ingameId === ingameId)) {
      clan.players.push({
        userId: interaction.user.id,
        userName: interaction.user.username,
        ingameId
      });
    }

    const tptomeLine = clan.players.map(p => `tptome ${p.ingameId};`).join(' ');

    const replyEmbed = new EmbedBuilder()
      .setTitle(`✅ Presença Confirmada — [${tag}]`)
      .setColor(0x10B981)
      .setDescription(
        `**Jogador:** ${interaction.user.username} (ID: ${ingameId})\n` +
        `**Clã:** ${tag} — ${name}\n` +
        `**Lineup:** ${clan.players.length}/10 Jogadores Cadastrados\n\n` +
        `📍 **Comando de Puxada Atualizado:**\n` +
        `\`\`\`${tptomeLine}\`\`\``
      );

    await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
  }
});

client.login(CONFIG.BOT_TOKEN);
