

    /**
 * ====================================================================
 * BOT DISCORD OFICIAL — CLASH OF CLÃS (FIVEM / DISCORD.JS V14)
 * ====================================================================
 * ID da Staff de Permissão: 1515125822795546715
 * 
 * Funcionalidades:
 * 1. Comando !enquete — Posta o anúncio padronizado com botão e reação 👍.
 * 2. Atualização Automática — Atualiza o embed e o comando `tptome` em tempo real conforme os jogadores inserem o ID.
 * 3. Painel Staff (!painel / !staff) — Exclusivo para ID/Cargo Staff "1515125822795546715":
 *    - 📅 Arrumar Data do Evento (Modal ou !setdata <data>)
 *    - 🧹 Limpeza Geral dos IDs (Reseta a lineup ou !limparids)
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

// Configurações Globais (.env)
const CONFIG = {
  GUILD_ID: process.env.GUILD_ID || "1456655598031601727",
  CHANNEL_ID: process.env.CHANNEL_ID || "1534389246868062330",
  STAFF_ROLE_ID: process.env.STAFF_ROLE_ID || "1515125822795546715",
  BOT_TOKEN: process.env.DISCORD_TOKEN,
  IS_SINGLE_CLAN_MODE: true,
  MY_CLAN_TAG: "HTR",
  MY_CLAN_NAME: "HUNTERS"
};

// Armazenamento em Memória
let customEventDate = null;
const registeredPlayers = new Map();

// Helper de verificação de permissão Staff (ID de usuário ou Cargo)
function checkIsStaff(member, user) {
  if (!CONFIG.STAFF_ROLE_ID) return true;
  if (user && user.id === CONFIG.STAFF_ROLE_ID) return true;
  if (member && member.roles && member.roles.cache && member.roles.cache.has(CONFIG.STAFF_ROLE_ID)) return true;
  return false;
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`==================================================`);
  console.log(`✅ BOT CLASH ONLINE COMO: ${readyClient.user.tag}`);
  console.log(`👑 STAFF PERMISSION ID: ${CONFIG.STAFF_ROLE_ID}`);
  console.log(`🏰 GUILD ID: ${CONFIG.GUILD_ID}`);
  console.log(`📢 CANAL ENQUETE: ${CONFIG.CHANNEL_ID}`);
  console.log(`==================================================`);
});

/**
 * 1. COMANDOS DE MENSAGEM (!enquete, !painel, !staff, !limparids, !setdata)
 */
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // POSTAR MENSAGEM DE ENQUETE
  if (message.content === '!enquete' || message.content === '!clash') {
    if (message.channelId !== CONFIG.CHANNEL_ID && message.channel.type !== 1) {
      return message.reply(`⚠️ Use o comando no canal de enquete: <#${CONFIG.CHANNEL_ID}>`);
    }

    const todayFormatted = customEventDate || new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const nowTimestamp = Math.floor(Date.now() / 1000);

    const titleText = CONFIG.IS_SINGLE_CLAN_MODE 
      ? `📝 INSCRIÇÃO EXCLUSIVA — CLÃ [${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}`
      : '📝 MODELO DE INSCRIÇÃO — CLASH OF CLÃS';

    const embed = new EmbedBuilder()
      .setTitle(titleText)
      .setColor(0xF59E0B)
      .setDescription(
        `🏰 **CLÃ:** ${CONFIG.MY_CLAN_TAG} — ${CONFIG.MY_CLAN_NAME}\n` +
        `📅 **DATA DO EVENTO:** ${todayFormatted} (<t:${nowTimestamp}:D>)\n\n` +
        `📍 **COMANDO DE PUXADA DA LINEUP (10 PLAYERS - MUDA AUTOMÁTICO):**\n` +
        `\`\`\`tptome 1; tptome 2; tptome 3; tptome 4; tptome 5; tptome 6; tptome 7; tptome 8; tptome 9; tptome 10;\`\`\`\n\n` +
        `⚠️ **ATENÇÃO:** Mantenha os 10 IDs corretos para evitar atrasos no evento.\n\n` +
        `👇 **CLIQUE NO BOTÃO OU REAGA COM 👍 PARA GARANTIR SUA VAGA NA LINEUP**`
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
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('open_staff_panel')
        .setLabel('⚙️ Painel Staff')
        .setStyle(ButtonStyle.Danger)
    );

    const pollMessage = await message.channel.send({ embeds: [embed], components: [row] });
    await pollMessage.react('👍');
  }

  // PAINEL DA STAFF DA LINEUP
  if (message.content === '!painel' || message.content === '!staff') {
    if (!checkIsStaff(message.member, message.author)) {
      return message.reply(`❌ **Acesso Restrito.** Apenas a Staff (ID/Cargo \`${CONFIG.STAFF_ROLE_ID}\`) pode abrir o painel.`);
    }

    const staffEmbed = new EmbedBuilder()
      .setTitle('⚙️ PAINEL DE ADM / STAFF — CLASH OF CLÃS')
      .setColor(0xEF4444)
      .setDescription(
        `👑 **Permissão:** Staff (${CONFIG.STAFF_ROLE_ID})\n` +
        `📅 **Data Atual do Evento:** ${customEventDate || 'Padrão (Hoje)'}\n` +
        `👥 **IDs Registrados:** ${registeredPlayers.size} jogador(es)\n\n` +
        `Escolha uma das ações abaixo:`
      )
      .setFooter({ text: 'Painel Administrativo Clash of Clãs' });

    const staffRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('staff_edit_date')
        .setLabel('📅 Arrumar Data do Evento')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('staff_clear_ids')
        .setLabel('🧹 Limpeza Geral dos IDs')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('view_tptome_list')
        .setLabel('📍 Ver tptome Atual')
        .setStyle(ButtonStyle.Secondary)
    );

    await message.reply({ embeds: [staffEmbed], components: [staffRow] });
  }

  // ATALHO DIRETO: !limparids
  if (message.content === '!limparids') {
    if (!checkIsStaff(message.member, message.author)) {
      return message.reply('❌ Apenas Staff pode executar a limpeza de IDs.');
    }
    const count = registeredPlayers.size;
    registeredPlayers.clear();
    await message.reply(`🧹 **Limpeza Efetuada!** ${count} IDs foram removidos do sistema.`);
  }

  // ATALHO DIRETO: !setdata <nova data>
  if (message.content.startsWith('!setdata ')) {
    if (!checkIsStaff(message.member, message.author)) {
      return message.reply('❌ Apenas Staff pode alterar a data do evento.');
    }
    const newDate = message.content.replace('!setdata ', '').trim();
    if (newDate) {
      customEventDate = newDate;
      await message.reply(`📅 **Data do Evento Alterada para:** \`${customEventDate}\``);
    }
  }
});

/**
 * 2. MONITOR DE REAÇÃO 👍
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
        .setDescription(`Olá **${user.username}**! Você reagiu com 👍 na enquete do clã \`${CONFIG.MY_CLAN_TAG}\`.\n\nPara incluir seu ID no comando \`tptome\`, clique no botão ou abra o formulário com seu **ID do FiveM**.`);

      await user.send({ embeds: [dmEmbed] });
    } catch (err) {
      console.log(`Aviso: Não foi possível enviar DM para ${user.tag}`);
    }
  }
});

/**
 * 3. INTERAÇÕES COM BOTÕES E MODAIS
 */
client.on(Events.InteractionCreate, async (interaction) => {
  
  // Botão de Inscrição 👍
  if (interaction.isButton() && interaction.customId === 'confirm_joia_registration') {
    const modal = new ModalBuilder()
      .setCustomId('modal_registration')
      .setTitle(`Inscrição no Clã ${CONFIG.MY_CLAN_TAG}`);

    const ingameIdInput = new TextInputBuilder()
      .setCustomId('ingame_id')
      .setLabel('Seu ID Numérico no FiveM (Ex: 42)')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(8)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(ingameIdInput));
    await interaction.showModal(modal);
  }

  // Abrir Painel Staff via Botão
  if (interaction.isButton() && interaction.customId === 'open_staff_panel') {
    if (!checkIsStaff(interaction.member, interaction.user)) {
      return interaction.reply({ content: `❌ **Acesso Negado.** Apenas a STAFF (\`${CONFIG.STAFF_ROLE_ID}\`) pode usar este painel.`, ephemeral: true });
    }

    const staffEmbed = new EmbedBuilder()
      .setTitle('⚙️ PAINEL DE CONTROLE DA STAFF')
      .setColor(0xEF4444)
      .setDescription(
        `👑 **Permissão:** Staff (${CONFIG.STAFF_ROLE_ID})\n` +
        `📅 **Data Atual do Evento:** ${customEventDate || 'Padrão (Hoje)'}\n` +
        `👥 **IDs Registrados:** ${registeredPlayers.size} jogador(es)\n\n` +
        `Escolha uma das ações abaixo:`
      );

    const staffRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('staff_edit_date')
        .setLabel('📅 Arrumar Data do Evento')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('staff_clear_ids')
        .setLabel('🧹 Limpeza dos IDs')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('view_tptome_list')
        .setLabel('📍 Ver tptome Atual')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [staffEmbed], components: [staffRow], ephemeral: true });
  }

  // Modal de Arrumar Data da Staff
  if (interaction.isButton() && interaction.customId === 'staff_edit_date') {
    if (!checkIsStaff(interaction.member, interaction.user)) {
      return interaction.reply({ content: '❌ Apenas Staff pode alterar a data.', ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId('modal_staff_date')
      .setTitle('📅 Arrumar Data do Evento');

    const dateInput = new TextInputBuilder()
      .setCustomId('input_event_date')
      .setLabel('Informe a Nova Data e Horário do Evento')
      .setPlaceholder('Ex: Terça-feira, 05/08/2026 - 20:00')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(dateInput));
    await interaction.showModal(modal);
  }

  // Submissão da Nova Data pela Staff
  if (interaction.isModalSubmit() && interaction.customId === 'modal_staff_date') {
    const newDate = interaction.fields.getTextInputValue('input_event_date').trim();
    if (newDate) {
      customEventDate = newDate;
      await interaction.reply({ content: `📅 **Data do evento atualizada para:** \`${customEventDate}\``, ephemeral: true });
    }
  }

  // Botão Limpeza dos IDs pela Staff
  if (interaction.isButton() && interaction.customId === 'staff_clear_ids') {
    if (!checkIsStaff(interaction.member, interaction.user)) {
      return interaction.reply({ content: '❌ Apenas Staff pode realizar a limpeza.', ephemeral: true });
    }

    const totalRemoved = registeredPlayers.size;
    registeredPlayers.clear();
    await interaction.reply({ content: `🧹 **Limpeza Efetuada!** ${totalRemoved} IDs foram removidos do sistema.`, ephemeral: true });
  }

  // Botão Ver Comando tptome
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

  // Submissão do Modal do ID de Jogador
  if (interaction.isModalSubmit() && interaction.customId === 'modal_registration') {
    const ingameId = interaction.fields.getTextInputValue('ingame_id').trim().replace(/\D/g, '');

    if (!ingameId) {
      return interaction.reply({ content: '⚠️ Por favor informe apenas números no seu ID.', ephemeral: true });
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

    // ATUALIZA O EMBED AUTOMATICAMENTE NA MENSAGEM DO DISCORD
    if (interaction.message) {
      try {
        const todayFormatted = customEventDate || new Date().toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const nowTimestamp = Math.floor(Date.now() / 1000);

        const titleText = CONFIG.IS_SINGLE_CLAN_MODE 
          ? `📝 INSCRIÇÃO EXCLUSIVA — CLÃ [${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}`
          : '📝 MODELO DE INSCRIÇÃO — CLASH OF CLÃS';

        const updatedEmbed = new EmbedBuilder()
          .setTitle(titleText)
          .setColor(0xF59E0B)
          .setDescription(
            `🏰 **CLÃ:** ${CONFIG.MY_CLAN_TAG} — ${CONFIG.MY_CLAN_NAME}\n` +
            `📅 **DATA DO EVENTO:** ${todayFormatted} (<t:${nowTimestamp}:D>)\n\n` +
            `📍 **COMANDO DE PUXADA DA LINEUP (${playerList.length}/10 PLAYERS - MUDA AUTOMÁTICO):**\n` +
            `\`\`\`${tptomeLine}\`\`\`\n\n` +
            `⚠️ **ATENÇÃO:** Mantenha os 10 IDs corretos para evitar atrasos no evento.\n\n` +
            `👇 **CLIQUE NO BOTÃO OU REAGA COM 👍 PARA GARANTIR SUA VAGA NA LINEUP**`
          )
          .setFooter({ text: `Clash de Clãs — Bot Oficial [${CONFIG.MY_CLAN_TAG}] • ${playerList.length}/10 Confirmados` })
          .setTimestamp();

        await interaction.message.edit({ embeds: [updatedEmbed] });
      } catch (e) {
        console.log('Aviso: Não foi possível atualizar o embed:', e);
      }
    }

    const replyEmbed = new EmbedBuilder()
      .setTitle(`✅ ID ${ingameId} Cadastrado na Lineup de [${CONFIG.MY_CLAN_TAG}]`)
      .setColor(0x10B981)
      .setDescription(
        `**Jogador:** ${interaction.user.username}\n` +
        `**ID FiveM:** ${ingameId}\n` +
        `**Vagas Preenchidas:** ${playerList.length}/10\n\n` +
        `📍 **Comando tptome do Clã (Atualizado Automático no Discord):**\n` +
        `\`\`\`${tptomeLine}\`\`\``
      );

    await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
  }
});

// Autenticação com o Discord
client.login(CONFIG.BOT_TOKEN);
  
