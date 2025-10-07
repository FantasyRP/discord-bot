import { SlashCommandBuilder } from "@discordjs/builders";

export const commandBase = {
    slashData: new SlashCommandBuilder().setName("ping").setDescription("JEEEMADRE!"),
    cooldown: 5000,
    ownerOnly: false,
    async slashRun(interaction) {
        await interaction.reply("Pong 🏓");
    },
};
