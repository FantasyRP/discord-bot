import {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionFlagsBits,
} from "discord.js";
import Config from "../../config.js";

class SetupReactionRolesCommand {
	static data = new SlashCommandBuilder()
		.setName("setup-reaction-roles")
		.setDescription("Stuurt de reaction roles embed")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	static ownerOnly = true;

	static slashData = new SlashCommandBuilder()
		.setName("setup-reaction-roles")
		.setDescription(
			"Stuurt de reaction roles embed handmatig (gebeurt normaal automatisch)"
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	static async slashRun(interaction) {
		const channel = interaction.client.channels.cache.get(
			Config.channels.reactionRoles
		);
		if (!channel) {
			return interaction.reply({
				content: `Reaction roles kanaal niet gevonden: ${Config.channels.reactionRoles}`,
				ephemeral: true,
			});
		}

		try {
			const messages = await channel.messages.fetch({ limit: 100 });
			await channel.bulkDelete(messages);

			const embed = new EmbedBuilder()
				.setTitle("Serverregels Accepteren")
				.setDescription(
					"Welkom op onze server! Voordat je kunt beginnen, moet je eerst onze regels accepteren."
				)
				.addFields(
					{
						name: "Beschrijving",
						value: Config.reactionRoles.description,
						inline: false,
					},
					{
						name: "Actie",
						value: `Reageer met ${Config.reactionRoles.emoji} om de regels te accepteren en toegang te krijgen tot de server.`,
						inline: false,
					}
				)
				.setColor("#5865f2")
				.setFooter({
					text: `${interaction.client.user.username}`,
					iconURL: interaction.client.user.displayAvatarURL(),
				})
				.setTimestamp();

			const message = await channel.send({ embeds: [embed] });

			try {
				await message.react(Config.reactionRoles.emoji);
			} catch (error) {
				console.error(
					`Could not add reaction ${Config.reactionRoles.emoji}:`,
					error
				);
			}

			await interaction.reply({
				content:
					"Reaction roles embed handmatig verzonden! (Dit gebeurt normaal automatisch bij het opstarten van de bot)",
				ephemeral: true,
			});
		} catch (error) {
			console.error("Error sending reaction roles embed:", error);
			await interaction.reply({
				content:
					"Er is een fout opgetreden bij het verzenden van de embed.",
				ephemeral: true,
			});
		}
	}
}

export const commandBase = SetupReactionRolesCommand;
