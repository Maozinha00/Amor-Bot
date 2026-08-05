/**
 * ====================================================================
 * BOT DISCORD OFICIAL — CLASH OF CLÃS (FIVEM / DISCORD.JS V14)
 * ====================================================================
 * Clã: [HTR] HUNTERS
 * Servidor (GUILD_ID): 1456655598031601727
 * Canal Enquete (CHANNEL_ID): 1515125864033943712
 * 
 * Funcionalidades:
 * 1. Comando !enquete / !clash — Posta o anúncio com a data do dia.
 * 2. Atualização Automática — Quando o jogador digita o ID FiveM, o
 *    comando tptome atualiza na hora na mensagem do anúncio!
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

// Configurações Globais
const CONFIG = {
  GUILD_ID: process.env.GUILD_ID || "1456655598031601727",
  CHANNEL_ID: process.env.CHANNEL_ID || "1534389246868062330",
  BOT_TOKEN: process.env.DISCORD_TOKEN,
  IS_SINGLE_CLAN_MODE: true,
  MY_CLAN_TAG: "HTR",
  MY_CLAN_NAME: "HUNTERS"
};

// Armazenamento em memória dos jogadores da lineup
const registeredPlayers = new Map();

client.once(Events.ClientReady, (readyClient) => {
  console.log(`==================================================`);
  console.log(`✅ BOT HUNTERS ONLINE COMO: ${readyClient.user.tag}`);
  console.log(`🏰 GUILD ID: ${CONFIG.GUILD_ID}`);
  console.log(`📢 CANAL ENQUETE: ${CONFIG.CHANNEL_ID}`);
  console.log(`==================================================`);
});

/**
 * 1. COMANDO !enquete OU !clash
 */
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content === '!enquete' || message.content === '!clash') {
    if (message.channelId !== CONFIG.CHANNEL_ID && message.channel.type !== 1) {
      return message.reply(`⚠️ Use o comando no canal de enquete: <#${CONFIG.CHANNEL_ID}>`);
    }

    const todayFormatted = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const nowTimestamp = Math.floor(Date.now() / 1000);

    const embed = new EmbedBuilder()
      .setTitle(`📝 INSCRIÇÃO EXCLUSIVA — CLÃ [${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}`)
      .setColor(0xF59E0B) // Amarelo/Âmbar
      .setDescription(
        `🏰 **CLÃ:** ${CONFIG.MY_CLAN_TAG} — ${CONFIG.MY_CLAN_NAME}\n` +
        `📅 **DATA DO EVENTO:** ${todayFormatted} (<t:${nowTimestamp}:D>)\n\n` +
        `📍 **COMANDO DE PUXADA DA LINEUP (10 PLAYERS - MUDA AUTOMÁTICO):**\n` +
        `\`\`\`tptome 1; tptome 2; tptome 3; tptome 4; tptome 5; tptome 6; tptome 7; tptome 8; tptome 9; tptome 10;\`\`\`\n\n` +
        `⚠️ **ATENÇÃO:** Mantenha os 10 IDs corretos para evitar atrasos no evento.\n\n` +
        `👇 **CLIQUE NO BOTÃO ABAIXO PARA GARANTIR SUA VAGA NA LINEUP**`
      )
      .setFooter({ text: `Clash de Clãs — Bot Oficial [${CONFIG.MY_CLAN_TAG}]` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_joia_registration')
        .setLabel('Garantir Vaga na Lineup 👍')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('view_tptome_list')
        .setLabel('Ver Comando tptome Atualizado')
        .setStyle(ButtonStyle.Secondary)
    );

    const pollMessage = await message.channel.send({ embeds: [embed], components: [row] });
    await pollMessage.react('👍');
  }
});

/**
 * 2. MONITOR DE REAÇÕES 👍 NO CANAL
 */
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try { await reaction.fetch(); } catch (error) { return; }
  }

  if (reaction.message.channelId === CONFIG.CHANNEL_ID && reaction.emoji.name === '👍') {
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle(`👍 Presença Registrada — Clã [${CONFIG.MY_CLAN_TAG}]`)
        .setColor(0xF59E0B)
        .setDescription(`Olá **${user.username}**! Clique no botão de confirmação no canal <#${CONFIG.CHANNEL_ID}> para inserir seu ID do FiveM.`);

      await user.send({ embeds: [dmEmbed] });
    } catch (err) {
      console.log(`DM fechada para ${user.tag}`);
    }
  }
});

/**
 * 3. INTERAÇÕES DE BOTÕES E FORMULÁRIO (MODAL)
 */
client.on(Events.InteractionCreate, async (interaction) => {
  
  // Abrir Formulário do ID
  if (interaction.isButton() && interaction.customId === 'confirm_joia_registration') {
    const modal = new ModalBuilder()
      .setCustomId('modal_registration')
      .setTitle(`Inscrição — ${CONFIG.MY_CLAN_NAME}`);

    const ingameIdInput = new TextInputBuilder()
      .setCustomId('ingame_id')
      .setLabel('Seu ID Numérico no FiveM (Ex: 42)')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(8)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(ingameIdInput)
    );

    await interaction.showModal(modal);
  }

  // Ver lista ephemeral
  if (interaction.isButton() && interaction.customId === 'view_tptome_list') {
    if (registeredPlayers.size === 0) {
      return interaction.reply({ content: '⚠️ Nenhum jogador inseriu o ID ainda.', ephemeral: true });
    }

    const playerList = Array.from(registeredPlayers.values());
    const tptomeIds = playerList.map(p => `tptome ${p.ingameId};`).join(' ');

    const resultText = `🏰 **CLÃ [${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}** (${playerList.length}/10 Players):\n\n` +
                       `📍 **COMANDO DE PUXADA:**\n\`\`\`${tptomeIds}\`\`\``;

    await interaction.reply({ content: resultText, ephemeral: true });
  }

  // Submissão do ID FiveM
  if (interaction.isModalSubmit() && interaction.customId === 'modal_registration') {
    const ingameId = interaction.fields.getTextInputValue('ingame_id').trim().replace(/\D/g, '');

    if (!ingameId) {
      return interaction.reply({ content: '⚠️ Digite apenas números no seu ID.', ephemeral: true });
    }

    registeredPlayers.set(interaction.user.id, {
      userId: interaction.user.id,
      userName: interaction.user.username,
      ingameId,
      clanTag: CONFIG.MY_CLAN_TAG,
      clanName: CONFIG.MY_CLAN_NAME
    });

    const playerList = Array.from(registeredPlayers.values());
    const tptomeLine = playerList.map(p => `tptome ${p.ingameId};`).join(' ');

    // ⚡ ATUALIZAÇÃO AUTOMÁTICA DA MENSAGEM DO DISCORD EM TEMPO REAL
    if (interaction.message) {
      try {
        const todayFormatted = new Date().toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const nowTimestamp = Math.floor(Date.now() / 1000);

        const updatedEmbed = new EmbedBuilder()
          .setTitle(`📝 INSCRIÇÃO EXCLUSIVA — CLÃ [${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}`)
          .setColor(0xF59E0B)
          .setDescription(
            `🏰 **CLÃ:** ${CONFIG.MY_CLAN_TAG} — ${CONFIG.MY_CLAN_NAME}\n` +
            `📅 **DATA DO EVENTO:** ${todayFormatted} (<t:${nowTimestamp}:D>)\n\n` +
            `📍 **COMANDO DE PUXADA DA LINEUP (${playerList.length}/10 PLAYERS - MUDA AUTOMÁTICO):**\n` +
            `\`\`\`${tptomeLine}\`\`\`\n\n` +
            `⚠️ **ATENÇÃO:** Mantenha os 10 IDs corretos para evitar atrasos no evento.\n\n` +
            `👇 **CLIQUE NO BOTÃO ABAIXO PARA GARANTIR SUA VAGA NA LINEUP**`
          )
          .setFooter({ text: `Clash de Clãs — Bot Oficial [${CONFIG.MY_CLAN_TAG}] • ${playerList.length}/10 Confirmados` })
          .setTimestamp();

        await interaction.message.edit({ embeds: [updatedEmbed] });
      } catch (e) {
        console.log('Erro ao atualizar a mensagem:', e);
      }
    }

    const replyEmbed = new EmbedBuilder()
      .setTitle(`✅ ID ${ingameId} Cadastrado na Lineup de [${CONFIG.MY_CLAN_TAG}]`)
      .setColor(0x10B981)
      .setDescription(
        `**Jogador:** ${interaction.user.username}\n` +
        `**ID FiveM:** ${ingameId}\n` +
        `**Vagas Preenchidas:** ${playerList.length}/10\n\n` +
        `📍 **Comando tptome (Atualizado na Enquete):**\n` +
        `\`\`\`${tptomeLine}\`\`\``
      );

    await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
  }
});

client.login(CONFIG.BOT_TOKEN);
