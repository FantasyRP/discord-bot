import { SlashCommandBuilder } from "@discordjs/builders";

class PingCommand {
	static slashData = new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Controleer bot responsiviteit");

	static cooldown = 5000;
	static ownerOnly = false;

	static async slashRun(interaction) {
		await interaction.reply("Pong 🏓");
	}
}

export const commandBase = PingCommand;
