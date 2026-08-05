/**
 * ====================================================================
 * BOT DISCORD OFICIAL — CLASH OF CLÃS (FIVEM / DISCORD.JS V14)
 * ====================================================================
 * EXCLUSIVO PARA O CLÃ: [HTR] HUNTERS
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

// Configurações do Servidor e Clã Hunters
const CONFIG = {
  GUILD_ID: process.env.GUILD_ID || "1456655598031601727",
  CHANNEL_ID: process.env.CHANNEL_ID || "1515125864033943712",
  BOT_TOKEN: process.env.DISCORD_TOKEN,
  MY_CLAN_TAG: "HTR",
  MY_CLAN_NAME: "HUNTERS"
};

// Armazenamento em memória dos jogadores inscritos na lineup
// Map<userId, { userName, ingameId }>
const registeredPlayers = new Map();

client.once(Events.ClientReady, (readyClient) => {
  console.log(`==================================================`);
  console.log(`✅ BOT HUNTERS ONLINE COMO: ${readyClient.user.tag}`);
  console.log(`🏰 GUILD ID: ${CONFIG.GUILD_ID}`);
  console.log(`📢 CANAL ENQUETE: ${CONFIG.CHANNEL_ID}`);
  console.log(`🛡️ CLÃ CONFIGURADO: [${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}`);
  console.log(`==================================================`);
});

/**
 * 1. COMANDO !enquete OU !clash NO CANAL
 */
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content === '!enquete' || message.content === '!clash') {
    if (message.channelId !== CONFIG.CHANNEL_ID && message.channel.type !== 1) {
      return message.reply(`⚠️ Use o comando no canal correto de enquetes: <#${CONFIG.CHANNEL_ID}>`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`📝 INSCRIÇÃO EXCLUSIVA — CLÃ [${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}`)
      .setColor(0xF59E0B) // Cor Amarelo/Âmbar
      .setDescription(
        `🏰 **CLÃ:** ${CONFIG.MY_CLAN_TAG} — ${CONFIG.MY_CLAN_NAME}\n\n` +
        `📍 **COMANDO DE PUXADA DA LINEUP (10 PLAYERS):**\n` +
        `\`\`\`tptome 1; tptome 2; tptome 3; tptome 4; tptome 5; tptome 6; tptome 7; tptome 8; tptome 9; tptome 10;\`\`\`\n\n` +
        `⚠️ **ATENÇÃO:** Mantenha os 10 IDs numéricos atualizados para a STAFF realizar a puxada rápida.\n\n` +
        `👇 **CLIQUE NO BOTÃO ABAIXO OU REAGA COM 👍 PARA INSERIR SEU ID NA LINEUP DO CLÃ**`
      )
      .setFooter({ text: `Clash de Clãs — Bot Oficial [${CONFIG.MY_CLAN_TAG}] Hunters` })
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
 * 2. MONITOR DE REAÇÃO 👍 NO CANAL DA ENQUETE (1515125864033943712)
 */
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try { await reaction.fetch(); } catch (error) { return; }
  }

  if (reaction.message.channelId === CONFIG.CHANNEL_ID && reaction.emoji.name === '👍') {
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle(`👍 Presença Registrada — Clã Hunters [${CONFIG.MY_CLAN_TAG}]`)
        .setColor(0xF59E0B)
        .setDescription(`Olá **${user.username}**! Você reagiu com 👍 na enquete do clã **Hunters**.\n\nClique no botão **"Garantir Vaga na Lineup"** no canal <#${CONFIG.CHANNEL_ID}> para cadastrar seu ID do FiveM.`);

      await user.send({ embeds: [dmEmbed] });
    } catch (err) {
      console.log(`Aviso: DMs do usuário ${user.tag} estão fechadas.`);
    }
  }
});

/**
 * 3. INTERAÇÃO COM BOTÕES E FORMULÁRIO (MODAL)
 */
client.on(Events.InteractionCreate, async (interaction) => {
  
  // Botão de Cadastrar ID na Lineup
  if (interaction.isButton() && interaction.customId === 'confirm_joia_registration') {
    const modal = new ModalBuilder()
      .setCustomId('modal_registration')
      .setTitle(`Inscrição Lineup — [${CONFIG.MY_CLAN_TAG}] Hunters`);

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

  // Botão para Ver Comando de Puxada
  if (interaction.isButton() && interaction.customId === 'view_tptome_list') {
    if (registeredPlayers.size === 0) {
      return interaction.reply({ content: '⚠️ Nenhum jogador inseriu o ID ainda.', ephemeral: true });
    }

    const playerList = Array.from(registeredPlayers.values());
    const tptomeIds = playerList.map(p => `tptome ${p.ingameId};`).join(' ');

    const resultText = `🏰 **CLÃ [${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}** (${playerList.length}/10 Jogadores):\n\n` +
                       `📍 **COMANDO DE PUXADA PARA A STAFF:**\n` +
                       `\`\`\`${tptomeIds}\`\`\``;

    await interaction.reply({ content: resultText, ephemeral: true });
  }

  // Envio do ID pelo Modal
  if (interaction.isModalSubmit() && interaction.customId === 'modal_registration') {
    const ingameId = interaction.fields.getTextInputValue('ingame_id').trim().replace(/\D/g, '');

    if (!ingameId) {
      return interaction.reply({ content: '⚠️ Por favor informe apenas números no seu ID.', ephemeral: true });
    }

    registeredPlayers.set(interaction.user.id, {
      userId: interaction.user.id,
      userName: interaction.user.username,
      ingameId
    });

    const playerList = Array.from(registeredPlayers.values());
    const tptomeLine = playerList.map(p => `tptome ${p.ingameId};`).join(' ');

    const replyEmbed = new EmbedBuilder()
      .setTitle(`✅ ID ${ingameId} Cadastrado na Lineup dos Hunters [${CONFIG.MY_CLAN_TAG}]`)
      .setColor(0x10B981)
      .setDescription(
        `**Jogador:** ${interaction.user.username}\n` +
        `**ID FiveM:** ${ingameId}\n` +
        `**Vagas Preenchidas:** ${playerList.length}/10\n\n` +
        `📍 **Comando tptome do Clã:**\n` +
        `\`\`\`${tptomeLine}\`\`\``
      );

    await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
  }
});

// Autenticação no Discord
client.login(CONFIG.BOT_TOKEN);
