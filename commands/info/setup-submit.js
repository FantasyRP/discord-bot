import {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	PermissionFlagsBits,
} from "discord.js";
import Config from "../../config.js";

class SetupSubmitCommand {
	static data = new SlashCommandBuilder()
		.setName("setup-submit")
		.setDescription("Stuurt de submit embed opnieuw")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	static ownerOnly = true;

	static slashData = new SlashCommandBuilder()
		.setName("setup-submit")
		.setDescription(
			"Stuurt de submit embed handmatig (gebeurt normaal automatisch)"
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	static async slashRun(interaction) {
		const channel = interaction.client.channels.cache.get(
			Config.channels.submitEmbed
		);
		if (!channel) {
			return interaction.reply({
				content: `❌ Submit embed kanaal niet gevonden: ${Config.channels.submitEmbed}`,
				ephemeral: true,
			});
		}

		try {
			const messages = await channel.messages.fetch({ limit: 100 });
			await channel.bulkDelete(messages);

			const embed = new EmbedBuilder()
				.setTitle("Indienen")
				.setDescription(
					"In dit kanaal kun je suggesties en bug reports indienen. Dus heb jij een suggestie voor een feature, een voertuig of kleding? Of heb je zelfs een bug gevonden? Dien ze in, want wij ontvangen ze graag! Om dit te kunnen doen met je het volgende doen."
				)
				.setColor("#00b0f4")
				.setFooter({
					text: client.user.username,
					iconURL: client.user.displayAvatarURL(),
				})
				.setTimestamp();

			const buttons = [];
			const submissions = Config.channels.submit.submissions;

			Object.entries(submissions).forEach(([type, submissionConfig]) => {
				buttons.push(
					new ButtonBuilder()
						.setCustomId(`submit_${type}`)
						.setLabel(
							`Submit ${submissionConfig.label.slice(0, -1)}`
						)
						.setStyle(ButtonStyle.Secondary)
				);
			});

			const row = new ActionRowBuilder().addComponents(...buttons);

			await channel.send({ embeds: [embed], components: [row] });

			await interaction.reply({
				content: "Submit embed succesvol verzonden!",
				ephemeral: true,
			});
		} catch (error) {
			console.error("Error sending submit embed:", error);
			await interaction.reply({
				content:
					"Er is een fout opgetreden bij het verzenden van de embed.",
				ephemeral: true,
			});
		}
	}
}

export const commandBase = SetupSubmitCommand;
