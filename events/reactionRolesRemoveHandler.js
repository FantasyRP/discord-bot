import { Events } from "discord.js";
import Config from "../config.js";

class ReactionRolesRemoveHandler {
	static name = Events.MessageReactionRemove;

	static async execute(reaction, user) {
		if (user.bot) return;

		if (reaction.message.channelId !== Config.channels.reactionRoles)
			return;

		const embed = reaction.message.embeds[0];
		if (!embed || !embed.title?.includes("Serverregels Accepteren")) return;

		return;
	}
}

export default ReactionRolesRemoveHandler;
