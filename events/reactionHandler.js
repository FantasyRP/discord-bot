import { Events, EmbedBuilder } from "discord.js";
import Config from "../config.js";

class ReactionHandler {
	static name = Events.MessageReactionAdd;

	/**
	 * @param {import('discord.js').MessageReaction} reaction
	 * @param {import('discord.js').User} user
	 */
	static async execute(reaction, user) {
		if (user.bot) return;

		if (["👍", "👎"].includes(reaction.emoji.name)) {
			await this.handleVotingReaction(reaction, user);
			return;
		}

		if (["✅", "❌"].includes(reaction.emoji.name)) {
			if (!Config.owners.includes(user.id)) return;
			await this.handleApprovalReaction(reaction, user);
			return;
		}

		if (["🐛", "❓"].includes(reaction.emoji.name)) {
			if (!Config.owners.includes(user.id)) {
				try {
					await reaction.users.remove(user.id);
				} catch (error) {
					console.error("Could not remove reaction:", error);
				}
				return;
			}
			await this.handleStatusReaction(reaction, user);
			return;
		}
	}

	/**
	 * @param {import('discord.js').MessageReaction} reaction
	 * @param {import('discord.js').User} user
	 */
	static async handleVotingReaction(reaction, user) {
		const embed = reaction.message.embeds[0];
		if (!embed) return;

		const isSuggestion = embed.footer?.text?.includes("Ingediend door");
		if (!isSuggestion) return;
	}

	/**
	 * @param {import('discord.js').MessageReaction} reaction
	 * @param {import('discord.js').User} user
	 */
	static async handleApprovalReaction(reaction, user) {
		const action = reaction.emoji.name === "✅" ? "approved" : "rejected";
		const message = reaction.message;
		const embed = message.embeds[0];
		if (!embed) return;

		const isSuggestion = embed.footer?.text?.includes("Ingediend door");
		if (!isSuggestion) return;

		await this.updateSuggestionStatus(message, action, user);
	}

	/**
	 * @param {import('discord.js').Message} message
	 * @param {import('discord.js').User} user
	 * @param {string} action
	 */
	static async lockThreadAfterApproval(message, user, action) {
		try {
			if (message.channel.isThread()) {
				const restrictionEmbed = new EmbedBuilder()
					.setColor(action === "approved" ? "#57f287" : "#ed4245")
					.setTitle(`🔒 Thread Beperkt`)
					.setDescription(
						`Deze thread is ${
							action === "approved" ? "goedgekeurd" : "afgewezen"
						} door ${
							user.displayName
						}.\nAlleen owners kunnen nu nog reageren.`
					)
					.setTimestamp();

				await message.channel.send({ embeds: [restrictionEmbed] });
			}
		} catch (error) {
			console.error("Error managing thread after approval:", error);
		}
	}

	/**
	 * @param {import('discord.js').MessageReaction} reaction
	 * @param {import('discord.js').User} user
	 */
	static async handleStatusReaction(reaction, user) {
		const message = reaction.message;
		const embed = message.embeds[0];
		if (!embed) return;

		const isSuggestion = embed.footer?.text?.includes("Ingediend door");
		if (!isSuggestion) return;

		if (reaction.emoji.name === "🐛") {
			await this.updateSuggestionStatus(message, "bug", user);
		}

		if (reaction.emoji.name === "❓") {
			await this.updateSuggestionStatus(message, "question", user);
		}
	}

	/**
	 * @param {import('discord.js').Message} message
	 * @param {import('discord.js').User} user
	 * @param {string} statusType
	 */
	static async updateToInServer(message, user, statusType) {
		if (statusType === "bug") {
			await this.moveToBugsChannel(message, user);
		} else {
			await this.updateStatusOnly(message, user);
		}
	}

	/**
	 * @param {import('discord.js').Message} message
	 * @param {string} status
	 * @param {import('discord.js').User} user
	 */
	static async updateSuggestionStatus(message, status, user) {
		const embed = message.embeds[0];
		if (!embed) return;

		const newEmbed = EmbedBuilder.from(embed);

		let statusText = "";
		let color = "";

		switch (status) {
			case "approved":
				statusText = `Gemarkeerd als Goedgekeurd door ${user.displayName}`;
				color = "#57f287";
				break;
			case "rejected":
				statusText = `Gemarkeerd als Afgewezen door ${user.displayName}`;
				color = "#ed4245";
				break;
			case "bug":
				statusText = `Gemarkeerd als Bug door ${user.displayName}`;
				color = "#9b59b6";
				break;
			case "question":
				statusText = `Gemarkeerd als In Server door ${user.displayName}`;
				color = "#FFFFFF";
				break;
			default:
				return;
		}

		newEmbed.setColor(color);

		const fields = newEmbed.data.fields || [];
		const statusFieldIndex = fields.findIndex((field) =>
			field.name.toLowerCase().includes("status")
		);

		if (statusFieldIndex !== -1) {
			fields[statusFieldIndex] = {
				name: "Status",
				value: statusText,
				inline: false,
			};
		} else {
			fields.push({
				name: "Status",
				value: statusText,
				inline: false,
			});
		}

		newEmbed.setFields(fields);

		try {
			await message.edit({ embeds: [newEmbed] });
		} catch (error) {
			console.error("Error updating suggestion status:", error);
		}
	}
}

export default ReactionHandler;
