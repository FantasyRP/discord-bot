import {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionFlagsBits,
} from "discord.js";
import Config from "../../config.js";

class ReactionRolesInfoCommand {
	static data = new SlashCommandBuilder()
		.setName("reaction-roles-info")
		.setDescription("Toont informatie over de reaction roles")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	static ownerOnly = true;

	static slashData = new SlashCommandBuilder()
		.setName("reaction-roles-info")
		.setDescription("Toont informatie over de reaction roles")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	static async slashRun(interaction) {
		const guild = interaction.guild;

		const role = await guild.roles
			.fetch(Config.reactionRoles.roleId)
			.catch(() => null);

		const embed = new EmbedBuilder()
			.setTitle("Regels Acceptatie Informatie")
			.setColor(role ? "#57f287" : "#ed4245")
			.addFields(
				{
					name: "Status",
					value: role ? "Actief" : "Fout - Rol niet gevonden",
					inline: true,
				},
				{
					name: "Kanaal",
					value: `<#${Config.channels.reactionRoles}>`,
					inline: true,
				},
				{
					name: "Rol",
					value: role ? role.name : "Niet gevonden",
					inline: true,
				},
				{
					name: "Leden met rol",
					value: role ? role.members.size.toString() : "0",
					inline: true,
				},
				{
					name: "Emoji",
					value: Config.reactionRoles.emoji,
					inline: true,
				},
				{
					name: "Role ID",
					value: `\`${Config.reactionRoles.roleId}\``,
					inline: true,
				},
				{
					name: "Beschrijving",
					value: Config.reactionRoles.description,
					inline: false,
				}
			)
			.setFooter({
				text: interaction.client.user.username,
				iconURL: interaction.client.user.displayAvatarURL(),
			})
			.setTimestamp();

		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	}
}

export const commandBase = ReactionRolesInfoCommand;
