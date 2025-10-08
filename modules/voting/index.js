import {
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} from "discord.js";

class VotingManager {
	static instance = null;

	constructor() {
		// In production, you would use a database for persistent storage
		this.votes = new Map(); // messageId -> { upvotes: Set(userIds), downvotes: Set(userIds) }
	}

	/**
	 * Get singleton instance
	 * @returns {VotingManager} - The singleton instance
	 */
	static getInstance() {
		if (!VotingManager.instance) {
			VotingManager.instance = new VotingManager();
		}
		return VotingManager.instance;
	}

	/**
	 * Initialize voting for a message
	 * @param {string} messageId - The message ID
	 */
	initializeVoting(messageId) {
		if (!this.votes.has(messageId)) {
			this.votes.set(messageId, {
				upvotes: new Set(),
				downvotes: new Set(),
			});
		}
	}

	/**
	 * Add a vote (updated to handle boolean)
	 * @param {string} messageId - The message ID
	 * @param {string} userId - The user ID
	 * @param {boolean} isUpvote - true for upvote, false for downvote
	 * @param {string} type - The submission type
	 * @returns {Object} - { success: boolean, message: string, counts: { up: number, down: number } }
	 */
	async addVote(messageId, userId, isUpvote, type) {
		this.initializeVoting(messageId);
		const messageVotes = this.votes.get(messageId);

		messageVotes.upvotes.delete(userId);
		messageVotes.downvotes.delete(userId);

		if (isUpvote) {
			messageVotes.upvotes.add(userId);
		} else {
			messageVotes.downvotes.add(userId);
		}

		return {
			success: true,
			message: `Je hebt ${isUpvote ? "👍" : "👎"} gestemd!`,
			counts: {
				up: messageVotes.upvotes.size,
				down: messageVotes.downvotes.size,
			},
		};
	}

	/**
	 * Remove a vote
	 * @param {string} messageId - The message ID
	 * @param {string} userId - The user ID
	 * @returns {Object} - { success: boolean, message: string, counts: { up: number, down: number } }
	 */
	async removeVote(messageId, userId) {
		this.initializeVoting(messageId);
		const messageVotes = this.votes.get(messageId);

		const hadUpvote = messageVotes.upvotes.delete(userId);
		const hadDownvote = messageVotes.downvotes.delete(userId);

		return {
			success: true,
			message:
				hadUpvote || hadDownvote
					? "Je vote is ingetrokken!"
					: "Je had nog geen vote!",
			counts: {
				up: messageVotes.upvotes.size,
				down: messageVotes.downvotes.size,
			},
		};
	}

	/**
	 * Get vote counts
	 * @param {string} messageId - The message ID
	 * @returns {Object} - { up: number, down: number }
	 */
	getVoteCounts(messageId) {
		this.initializeVoting(messageId);
		const messageVotes = this.votes.get(messageId);
		return {
			up: messageVotes.upvotes.size,
			down: messageVotes.downvotes.size,
		};
	}

	/**
	 * Check if a user has voted
	 * @param {string} messageId - The message ID
	 * @param {string} userId - The user ID
	 * @returns {string|null} - 'up', 'down', or null
	 */
	getUserVote(messageId, userId) {
		this.initializeVoting(messageId);
		const messageVotes = this.votes.get(messageId);

		if (messageVotes.upvotes.has(userId)) return "up";
		if (messageVotes.downvotes.has(userId)) return "down";
		return null;
	}

	/**
	 * Create vote buttons with current counts
	 * @param {string} messageId - The message ID
	 * @param {string} type - The submission type ('suggestions' or 'bugs')
	 * @returns {ActionRowBuilder} - The action row with buttons
	 */
	createVoteButtons(messageId, type) {
		const counts = this.getVoteCounts(messageId);

		return new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(`vote_up_${type}_${messageId}`)
				.setLabel(`👍 ${counts.up}`)
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId(`vote_down_${type}_${messageId}`)
				.setLabel(`👎 ${counts.down}`)
				.setStyle(ButtonStyle.Danger)
		);
	}

	/**
	 * Update vote buttons on a message and update the embed
	 * @param {Message} message - The Discord message
	 * @param {string} type - The submission type
	 */
	async updateVoteButtons(message, type) {
		const newRow = this.createVoteButtons(message.id, type);
		const counts = this.getVoteCounts(message.id);

		const embed = message.embeds[0];
		if (embed) {
			const updatedEmbed = new EmbedBuilder(embed.data);

			const voteFieldIndex = embed.fields.findIndex(
				(field) =>
					field.name.includes("🗳️") || field.name.includes("Stemmen")
			);

			if (voteFieldIndex !== -1) {
				updatedEmbed.spliceFields(voteFieldIndex, 1, {
					name: "🗳️ Stemmen",
					value: `👍 **${counts.up}** Upvotes\n👎 **${counts.down}** Downvotes\n\nStem hieronder met de reactions of buttons!`,
					inline: false,
				});
			}

			await message.edit({
				embeds: [updatedEmbed],
				components: [newRow],
			});
		} else {
			await message.edit({
				embeds: message.embeds,
				components: [newRow],
			});
		}
	}

	/**
	 * Sync votes from reactions to the voting system
	 * @param {Message} message - The Discord message
	 * @param {string} type - The submission type
	 */
	async syncReactionVotes(message, type) {
		try {
			const upReaction = message.reactions.cache.get("👍");
			const downReaction = message.reactions.cache.get("👎");

			this.initializeVoting(message.id);
			const messageVotes = this.votes.get(message.id);

			messageVotes.upvotes.clear();
			messageVotes.downvotes.clear();

			if (upReaction) {
				const upUsers = await upReaction.users.fetch();
				upUsers.forEach((user) => {
					if (!user.bot) {
						messageVotes.upvotes.add(user.id);
					}
				});
			}

			if (downReaction) {
				const downUsers = await downReaction.users.fetch();
				downUsers.forEach((user) => {
					if (!user.bot) {
						messageVotes.downvotes.add(user.id);
					}
				});
			}

			await this.updateVoteButtons(message, type);
		} catch (error) {
			console.error("Error syncing reaction votes:", error);
		}
	}
}

const votingManager = VotingManager.getInstance();

export { VotingManager };
export default votingManager;
