import { Events } from "discord.js";
import Config from "../config.js";
import { VotingManager } from "../modules/voting/index.js";

class MessageReactionAddEvent {
	static name = Events.MessageReactionAdd;

	static async execute(reaction, user) {
		if (user.bot) return;

		if (["👍", "👎"].includes(reaction.emoji.name)) {
			await this.handleVotingReaction(reaction, user);
			return;
		}
	}

	static async handleVotingReaction(reaction, user) {
		const votingManager = VotingManager.getInstance();

		const embed = reaction.message.embeds[0];
		if (!embed) return;

		const isSuggestion = embed.footer?.text?.includes("💡");
		if (!isSuggestion) return;

		const isApproved = embed.fields?.some(
			(field) =>
				field.value?.includes("Goedgekeurd") ||
				field.value?.includes("✅")
		);

		if (!isApproved) return;

		const isUpvote = reaction.emoji.name === "👍";
		await votingManager.addVote(
			reaction.message.id,
			user.id,
			isUpvote,
			"suggestions"
		);
		await votingManager.updateVoteButtons(reaction.message, "suggestions");
	}
}

export default MessageReactionAddEvent;
