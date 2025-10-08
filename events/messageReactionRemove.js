import { Events } from "discord.js";
import Config from "../config.js";

class MessageReactionRemoveEvent {
	static name = Events.MessageReactionRemove;

	static async execute(reaction, user) {
		if (user.bot) return;

		if (["👍", "👎"].includes(reaction.emoji.name)) {
			await this.handleVotingReactionRemoval(reaction, user);
			return;
		}
	}

	static async handleVotingReactionRemoval(reaction, user) {
		const { VotingManager } = await import("../modules/voting/index.js");
		const votingManager = VotingManager.getInstance();

		const embed = reaction.message.embeds[0];
		if (!embed) return;

		const isSuggestion = embed.footer?.text?.includes("💡");
		if (!isSuggestion) return;

		await votingManager.removeVote(reaction.message.id, user.id);
		await votingManager.updateVoteButtons(reaction.message, "suggestions");
	}
}

export default MessageReactionRemoveEvent;
