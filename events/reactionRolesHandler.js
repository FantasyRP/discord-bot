import { Events } from "discord.js";
import Config from "../config.js";

class ReactionRolesHandler {
	static name = Events.MessageReactionAdd;

	static async execute(reaction, user) {
		if (user.bot) return;

		if (reaction.message.channelId !== Config.channels.reactionRoles)
			return;

		const embed = reaction.message.embeds[0];
		if (!embed || !embed.title?.includes("Serverregels Accepteren")) return;

		await this.handleReactionRole(reaction, user);
	}

	static async handleReactionRole(reaction, user) {
		const guild = reaction.message.guild;
		if (!guild) return;

		const member = await guild.members.fetch(user.id).catch(() => null);
		if (!member) return;

		if (reaction.emoji.name !== Config.reactionRoles.emoji) return;

		try {
			const role = await guild.roles.fetch(Config.reactionRoles.roleId);
			if (!role) {
				console.error(`Role not found: ${Config.reactionRoles.roleId}`);
				return;
			}

			if (!member.roles.cache.has(role.id)) {
				await member.roles.add(role);

				try {
					await user.send({
						content: `Welkom bij **${guild.name}**! Je hebt de regels geaccepteerd en toegang gekregen tot de server.`,
					});
				} catch (error) {}
			}
		} catch (error) {
			console.error(
				`Error handling reaction role for ${user.tag}:`,
				error
			);
		}
	}
}

export default ReactionRolesHandler;
