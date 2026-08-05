/**
 * ====================================================================
 * BOT DISCORD OFICIAL — FIVEM / DISCORD.JS V14 (MENU SELETOR MÚLTIPLO)
 * ====================================================================
 * ID da Staff de Permissão: 1515125822795546715
 * 
 * Funcionalidades Incluídas:
 * 1. Menu Interativo (!menu) — Permite escolher entre:
 *    - ⚔️ CLASH OF CLÃS (!clash)
 *    - 🔴 ÁREA VERMELHA (!areavermelha)
 *    - 🏆 EVENTO ESPECIAL (!evento)
 * 2. Atualização Automática — Atualiza o embed e o comando tptome em tempo real.
 * 3. Painel Staff (!painel / !staff) — Exclusivo para ID/Cargo Staff "1515125822795546715":
 *    - 📅 Arrumar Data do Evento
 *    - 🧹 Limpeza Geral dos IDs
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
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
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
  MY_CLAN_TAG: process.env.MY_CLAN_TAG || "HTR",
  MY_CLAN_NAME: process.env.MY_CLAN_NAME || "HUNTERS"
};

// Armazenamento em Memória
let customEventDate = null;
let currentMode = "CLASH_OF_CLAS"; // CLASH_OF_CLAS | AREA_VERMELHA | EVENTO
const registeredPlayers = new Map();

// Helper de verificação de permissão Staff (ID de usuário ou Cargo)
function checkIsStaff(member, user) {
  if (!CONFIG.STAFF_ROLE_ID) return true;
  if (user && user.id === CONFIG.STAFF_ROLE_ID) return true;
  if (member && member.roles && member.roles.cache && member.roles.cache.has(CONFIG.STAFF_ROLE_ID)) return true;
  return false;
}

// Helper para construir o Embed de acordo com o Modo Selecionado
function buildEventEmbed(mode = currentMode) {
  const todayFormatted = customEventDate || new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const nowTimestamp = Math.floor(Date.now() / 1000);

  const playerList = Array.from(registeredPlayers.values());
  const tptomeLine = playerList.length > 0 
    ? playerList.map(p => `tptome ${p.ingameId};`).join(' ')
    : 'tptome 1; tptome 2; tptome 3; tptome 4; tptome 5; tptome 6; tptome 7; tptome 8; tptome 9; tptome 10;';

  let titleText = '';
  let colorHex = 0xF59E0B;
  let maxTarget = 10;
  let categoryIcon = '⚔️';

  if (mode === 'CLASH_OF_CLAS') {
    titleText = `📝 INSCRIÇÃO EXCLUSIVA — CLÃ [${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}`;
    colorHex = 0xF59E0B;
    maxTarget = 10;
    categoryIcon = '🏰';
  } else if (mode === 'AREA_VERMELHA') {
    titleText = `🔴 INSCRIÇÃO — ÁREA VERMELHA [${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}`;
    colorHex = 0xEF4444;
    maxTarget = 15;
    categoryIcon = '💀';
  } else if (mode === 'EVENTO') {
    titleText = `🏆 EVENTO ESPECIAL — [${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}`;
    colorHex = 0x10B981;
    maxTarget = 20;
    categoryIcon = '🎁';
  }

  const embed = new EmbedBuilder()
    .setTitle(titleText)
    .setColor(colorHex)
    .setDescription(
      `${categoryIcon} **MODO ATIVO:** ${mode.replace(/_/g, ' ')}\n` +
      `🏰 **CLÃ / FACÇÃO:** ${CONFIG.MY_CLAN_TAG} — ${CONFIG.MY_CLAN_NAME}\n` +
      `📅 **DATA DO EVENTO:** ${todayFormatted} (<t:${nowTimestamp}:D>)\n\n` +
      `📍 **COMANDO DE PUXADA DA LINEUP (${playerList.length}/${maxTarget} PLAYERS - MUDA AUTOMÁTICO):**\n` +
      `\`\`\`${tptomeLine}\`\`\`\n\n` +
      `⚠️ **ATENÇÃO:** Mantenha os IDs corretos para evitar atrasos no evento.\n\n` +
      `👇 **CLIQUE NO BOTÃO OU REAGA COM 👍 PARA GARANTIR SUA VAGA NA LINEUP**`
    )
    .setFooter({ text: `Clash / FiveM — Bot Oficial [${CONFIG.MY_CLAN_TAG}] • ${playerList.length}/${maxTarget} Confirmados` })
    .setImage('https://i.imgur.com/o8iZdLr.jpeg')
    .setTimestamp();

  return embed;
}

function buildActionRow() {
  return new ActionRowBuilder().addComponents(
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
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`==================================================`);
  console.log(`✅ BOT CLASH & FIVEM ONLINE COMO: ${readyClient.user.tag}`);
  console.log(`👑 STAFF PERMISSION ID: ${CONFIG.STAFF_ROLE_ID}`);
  console.log(`🏰 GUILD ID: ${CONFIG.GUILD_ID}`);
  console.log(`📢 CANAL ENQUETE: ${CONFIG.CHANNEL_ID}`);
  console.log(`==================================================`);
});

/**
 * COMANDOS DE MENSAGEM (!menu, !clash, !areavermelha, !evento, !enquete, !painel, !staff, !limparids, !setdata)
 */
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // COMANDO !menu — SELETOR INTERATIVO DE MODO
  if (message.content === '!menu' || message.content === '!modos') {
    if (!checkIsStaff(message.member, message.author)) {
      return message.reply('❌ Apenas a Staff pode abrir o menu de seleção de anúncios.');
    }

    const menuEmbed = new EmbedBuilder()
      .setTitle('📋 SELECIONE O TIPO DE ANÚNCIO / LINEUP')
      .setColor(0x3B82F6)
      .setDescription(
        'Escolha abaixo qual tipo de anúncio/lineup você deseja publicar no canal:\n\n' +
        '1️⃣ **CLASH OF CLÃS** — Lineup oficial 10v10 para confronto de clãs.\n' +
        '2️⃣ **ÁREA VERMELHA** — Anúncio de dominação e combate armado.\n' +
        '3️⃣ **EVENTO** — Anúncio de evento especial com premiações.'
      )
      .setFooter({ text: 'Menu de Seleção FiveM' });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_event_mode')
      .setPlaceholder('Escolha uma opção...')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('CLASH OF CLÃS')
          .setDescription('Postar anúncio oficial de Clash de Clãs 10v10')
          .setValue('CLASH_OF_CLAS')
          .setEmoji('⚔️'),
        new StringSelectMenuOptionBuilder()
          .setLabel('ÁREA VERMELHA')
          .setDescription('Postar anúncio de ação em Área Vermelha')
          .setValue('AREA_VERMELHA')
          .setEmoji('🔴'),
        new StringSelectMenuOptionBuilder()
          .setLabel('EVENTO')
          .setDescription('Postar anúncio de Evento Especial da cidade')
          .setValue('EVENTO')
          .setEmoji('🏆')
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);
    return message.reply({ embeds: [menuEmbed], components: [row] });
  }

  // ATALHOS DIRETOS (!clash, !areavermelha, !evento, !enquete)
  if (
    message.content === '!clash' || 
    message.content === '!areavermelha' || 
    message.content === '!evento' || 
    message.content === '!enquete'
  ) {
    if (message.content === '!clash') currentMode = 'CLASH_OF_CLAS';
    if (message.content === '!areavermelha') currentMode = 'AREA_VERMELHA';
    if (message.content === '!evento') currentMode = 'EVENTO';

    const embed = buildEventEmbed(currentMode);
    const row = buildActionRow();

    const pollMessage = await message.channel.send({ embeds: [embed], components: [row] });
    await pollMessage.react('👍');
  }

  // PAINEL DA STAFF DA LINEUP
  if (message.content === '!painel' || message.content === '!staff') {
    if (!checkIsStaff(message.member, message.author)) {
      return message.reply(`❌ **Acesso Restrito.** Apenas a Staff (ID/Cargo \`${CONFIG.STAFF_ROLE_ID}\`) pode abrir o painel.`);
    }

    const staffEmbed = new EmbedBuilder()
      .setTitle('⚙️ PAINEL DE ADM / STAFF — FIVEM')
      .setColor(0xEF4444)
      .setDescription(
        `👑 **Permissão:** Staff (${CONFIG.STAFF_ROLE_ID})\n` +
        `🎯 **Modo Atual:** ${currentMode}\n` +
        `📅 **Data Atual:** ${customEventDate || 'Padrão (Hoje)'}\n` +
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
 * INTERAÇÕES COM SELECT MENU, BOTÕES E MODAIS
 */
client.on(Events.InteractionCreate, async (interaction) => {

  // Resposta ao Select Menu !menu
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_event_mode') {
    const selectedMode = interaction.values[0];
    currentMode = selectedMode;

    const embed = buildEventEmbed(currentMode);
    const row = buildActionRow();

    await interaction.update({ 
      content: `✅ **Modo selecionado:** ${selectedMode}`,
      embeds: [embed], 
      components: [row] 
    });
  }

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
      return interaction.reply({ content: `❌ **Acesso Negado.** Apenas a STAFF (ID \`${CONFIG.STAFF_ROLE_ID}\`) pode usar este painel.`, ephemeral: true });
    }

    const staffEmbed = new EmbedBuilder()
      .setTitle('⚙️ PAINEL DE CONTROLE DA STAFF')
      .setColor(0xEF4444)
      .setDescription(
        `👑 **Permissão:** Staff (${CONFIG.STAFF_ROLE_ID})\n` +
        `🎯 **Modo Atual:** ${currentMode}\n` +
        `📅 **Data Atual:** ${customEventDate || 'Padrão (Hoje)'}\n` +
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

    const updatedEmbed = buildEventEmbed(currentMode);

    if (interaction.message) {
      try {
        await interaction.message.edit({ embeds: [updatedEmbed] });
      } catch (e) {
        console.log('Aviso ao atualizar mensagem:', e);
      }
    }

    const playerList = Array.from(registeredPlayers.values());
    const tptomeLine = playerList.map(p => `tptome ${p.ingameId};`).join(' ');

    const replyEmbed = new EmbedBuilder()
      .setTitle(`✅ ID ${ingameId} Cadastrado na Lineup de [${CONFIG.MY_CLAN_TAG}]`)
      .setColor(0x10B981)
      .setDescription(
        `**Jogador:** ${interaction.user.username}\n` +
        `**ID FiveM:** ${ingameId}\n` +
        `**Total Cadastrados:** ${playerList.length}\n\n` +
        `📍 **Comando tptome do Clã:**\n` +
        `\`\`\`${tptomeLine}\`\`\``
      );

    await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
  }

  // Modal de Arrumar Data pela Staff
  if (interaction.isButton() && interaction.customId === 'staff_edit_date') {
    if (!checkIsStaff(interaction.member, interaction.user)) {
      return interaction.reply({ content: '❌ Apenas Staff pode alterar a data.', ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId('modal_staff_date')
      .setTitle('📅 Arrumar Data do Evento');

    const dateInput = new TextInputBuilder()
      .setCustomId('input_event_date')
      .setLabel('Informe a Nova Data e Horário')
      .setPlaceholder('Ex: Terça-feira, 05/08/2026 - 20:00')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(dateInput));
    await interaction.showModal(modal);
  }

  // Submissão da Nova Data
  if (interaction.isModalSubmit() && interaction.customId === 'modal_staff_date') {
    const newDate = interaction.fields.getTextInputValue('input_event_date').trim();
    if (newDate) {
      customEventDate = newDate;
      await interaction.reply({ content: `📅 **Data atualizada para:** \`${customEventDate}\``, ephemeral: true });
    }
  }

  // Limpeza dos IDs
  if (interaction.isButton() && interaction.customId === 'staff_clear_ids') {
    if (!checkIsStaff(interaction.member, interaction.user)) {
      return interaction.reply({ content: '❌ Apenas Staff pode realizar a limpeza.', ephemeral: true });
    }

    const totalRemoved = registeredPlayers.size;
    registeredPlayers.clear();
    await interaction.reply({ content: `🧹 **Limpeza Efetuada!** ${totalRemoved} IDs foram removidos.`, ephemeral: true });
  }

  // Ver tptome
  if (interaction.isButton() && interaction.customId === 'view_tptome_list') {
    if (registeredPlayers.size === 0) {
      return interaction.reply({ content: '⚠️ Nenhum jogador inseriu o ID ainda.', ephemeral: true });
    }

    const playerList = Array.from(registeredPlayers.values());
    const tptomeIds = playerList.map(p => `tptome ${p.ingameId};`).join(' ');

    const resultText = `🏰 **[${CONFIG.MY_CLAN_TAG}] ${CONFIG.MY_CLAN_NAME}** (${playerList.length} Jogadores):\n\n` +
                       `📍 **COMANDO DE PUXADA PARA A STAFF:**\n` +
                       `\`\`\`${tptomeIds}\`\`\``;

    await interaction.reply({ content: resultText, ephemeral: true });
  }
});

client.login(CONFIG.BOT_TOKEN);
