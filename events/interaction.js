import {
	Collection,
	Events,
	InteractionType,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import Config from "../config.js";

class InteractionHandler {
	static name = Events.InteractionCreate;
	static cooldown = new Collection();
	static submissionStorage = new Map();

	/**
	 * @param {import('discord.js').Interaction} interaction
	 */
	static async execute(interaction) {
		const { client } = interaction;

		if (interaction.isButton()) {
			await this.handleButtonInteraction(interaction);
			return;
		}

		if (interaction.isModalSubmit()) {
			await this.handleModalSubmission(interaction);
			return;
		}

		if (interaction.type === InteractionType.ApplicationCommand) {
			if (interaction.user.bot) return;

			try {
				const command = client.slashCommands.get(
					interaction.commandName
				);
				if (command) {
					if (
						command.ownerOnly &&
						!Config.owners.includes(interaction.user.id)
					) {
						return interaction.reply({
							content:
								"Only **assigned** users can use this command.",
							ephemeral: true,
						});
					}

					if (command.cooldown) {
						const cooldownKey = `${command.name}-${interaction.user.id}`;
						if (this.cooldown.has(cooldownKey)) {
							const nowDate = interaction.createdTimestamp;
							const waitedDate =
								this.cooldown.get(cooldownKey) - nowDate;
							return interaction
								.reply({
									content: `Chill down, you have a small cooldown. You need to wait <t:${Math.floor(
										new Date(
											nowDate + waitedDate
										).getTime() / 1000
									)}:R>.`,
									ephemeral: true,
								})
								.then(() =>
									setTimeout(
										() => interaction.deleteReply(),
										this.cooldown.get(cooldownKey) -
											Date.now() +
											1000
									)
								);
						}

						command.slashRun(interaction);
						this.cooldown.set(
							cooldownKey,
							Date.now() + command.cooldown
						);
						setTimeout(() => {
							this.cooldown.delete(cooldownKey);
						}, command.cooldown + 1000);
					} else {
						command.slashRun(interaction);
					}
				}
			} catch (e) {
				console.error(e);
				interaction.reply({
					content: "Whoops, something went wrong.",
					ephemeral: true,
				});
			}
		}
	}

	/**
	 * @param {import('discord.js').ButtonInteraction} interaction
	 */
	static async handleButtonInteraction(interaction) {
		const { customId } = interaction;

		if (customId.startsWith("submit_")) {
			const type = customId.replace("submit_", "");
			await this.showSubmissionModal(interaction, type);
			return;
		}

		if (customId.startsWith("vote_")) {
			await this.handleVotingButton(interaction);
			return;
		}
	}

	/**
	 * @param {import('discord.js').ButtonInteraction} interaction
	 */
	static async handleVotingButton(interaction) {
		const { customId } = interaction;
		const parts = customId.split("_");
		if (parts.length < 4) return;

		const voteType = parts[1];
		const submissionType = parts[2];
		const messageId = parts.slice(3).join("_");

		const { VotingManager } = await import("../modules/voting/index.js");
		const votingManager = VotingManager.getInstance();

		const isUpvote = voteType === "up";
		const result = await votingManager.addVote(
			messageId,
			interaction.user.id,
			isUpvote,
			submissionType
		);

		await votingManager.updateVoteButtons(
			interaction.message,
			submissionType
		);

		await interaction.reply({
			content: result.message,
			ephemeral: true,
		});
	}

	/**
	 * @param {import('discord.js').ButtonInteraction} interaction
	 * @param {string} type
	 */
	static async showSubmissionModal(interaction, type) {
		const submissionConfig = Config.channels.submit.submissions[type];
		if (!submissionConfig) {
			return interaction.reply({
				content: "Configuratie niet gevonden!",
				ephemeral: true,
			});
		}

		const modal = new ModalBuilder()
			.setCustomId(`submit_${type}`)
			.setTitle(`${submissionConfig.label.slice(0, -1)} Indienen`);

		const components = [];
		for (let i = 0; i < submissionConfig.inputFields.length && i < 5; i++) {
			const field = submissionConfig.inputFields[i];
			const textInput = new TextInputBuilder()
				.setCustomId(`field_${i}`)
				.setLabel(field.label)
				.setStyle(
					field.style === "PARAGRAPH"
						? TextInputStyle.Paragraph
						: TextInputStyle.Short
				)
				.setRequired(field.required)
				.setMaxLength(field.maxLength)
				.setMinLength(field.minLength || 1);

			if (field.placeholder) {
				textInput.setPlaceholder(field.placeholder);
			}

			components.push(new ActionRowBuilder().addComponents(textInput));
		}

		modal.addComponents(...components);
		await interaction.showModal(modal);
	}

	/**
	 * @param {import('discord.js').ModalSubmitInteraction} interaction
	 */
	static async handleModalSubmission(interaction) {
		const { customId } = interaction;

		if (customId.startsWith("submit_")) {
			await interaction.deferReply({ ephemeral: true });

			const type = customId.replace("submit_", "");
			const submissionConfig = Config.channels.submit.submissions[type];

			if (!submissionConfig) {
				return interaction.editReply({
					content: "Configuratie niet gevonden!",
				});
			}

			const channel = interaction.client.channels.cache.get(
				submissionConfig.outputChannelId
			);
			if (!channel) {
				return interaction.editReply({
					content: "Output kanaal niet gevonden!",
				});
			}

			const submissionData = {};
			submissionConfig.inputFields.forEach((fieldConfig, index) => {
				const value = interaction.fields.getTextInputValue(
					`field_${index}`
				);
				if (value && value.trim()) {
					submissionData[fieldConfig.label] = value;
				}
			});

			const embed = this.createSubmissionEmbed(
				interaction.user,
				type,
				submissionData,
				submissionConfig
			);

			let message;
			let thread;

			try {
				if (submissionConfig.channelType === "forum") {
					const forumTitle =
						submissionData["Description"]?.substring(0, 50) ||
						`${submissionConfig.label.slice(0, -1)} by ${
							interaction.user.displayName
						}`;

					thread = await channel.threads.create({
						name: forumTitle,
						message: { embeds: [embed] },
						reason: `${submissionConfig.label.slice(
							0,
							-1
						)} submitted by ${interaction.user.tag}`,
					});

					message = await thread.fetchStarterMessage();
				} else {
					message = await channel.send({ embeds: [embed] });

					if (submissionConfig.createThread) {
						const threadName = `💬 ${
							submissionData["Description"]?.substring(0, 80) ||
							`Discussion ${submissionConfig.label.slice(0, -1)}`
						}`;
						thread = await message.startThread({
							name: threadName,
							reason: `Discussion thread for ${submissionConfig.label.slice(
								0,
								-1
							)} by ${interaction.user.tag}`,
						});
					}
				}

				if (type === "suggestions") {
					await this.addSuggestionReactions(message);
				} else if (submissionConfig.requireApproval) {
					await this.addApprovalReactions(message);
				}

				await this.saveSubmissionData(message.id, {
					type,
					userId: interaction.user.id,
					data: submissionData,
					status: "pending",
					threadId: thread?.id,
					timestamp: Date.now(),
				});

				await interaction.editReply({
					content: `Je ${submissionConfig.label.slice(
						0,
						-1
					)} is succesvol ingediend in <#${
						submissionConfig.outputChannelId
					}>!`,
				});
			} catch (error) {
				console.error("Error creating submission:", error);
				await interaction.editReply({
					content:
						"Er is een fout opgetreden bij het maken van je indiening.",
				});
			}
		}
	}

	/**
	 * @param {import('discord.js').User} user
	 * @param {string} type
	 * @param {Object} data
	 * @param {Object} submissionConfig
	 */
	static createSubmissionEmbed(user, type, data, submissionConfig) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: user.displayName,
				iconURL: user.displayAvatarURL(),
			})
			.setColor(0xffd700)
			.setTimestamp()
			.setFooter({ text: `Ingediend door ${user.displayName}` });

		if (type === "suggestions") {
			embed.addFields(
				{
					name: "Suggestie",
					value:
						data["Beschrijving"] ||
						data["Description"] ||
						data["Suggestie"] ||
						"Geen beschrijving",
					inline: false,
				},
				{
					name: "Reden",
					value:
						data["Reden"] || data["Reason"] || "Geen reden gegeven",
					inline: false,
				}
			);
		} else {
			Object.entries(data).forEach(([label, value]) => {
				embed.addFields({
					name: label,
					value:
						value.length > 1020
							? value.substring(0, 1017) + "..."
							: value,
					inline: false,
				});
			});
		}

		return embed;
	}

	/**
	 * @param {import('discord.js').Message} message
	 */
	static async addSuggestionReactions(message) {
		try {
			await message.react("👍");
			await message.react("👎");
		} catch (error) {
			console.error("Error adding suggestion reactions:", error);
		}
	}

	/**
	 * @param {import('discord.js').Message} message
	 */
	static async addApprovalReactions(message) {
		try {
			await message.react("✅");
			await message.react("❌");
		} catch (error) {
			console.error("Error adding approval reactions:", error);
		}
	}

	/**
	 * @param {string} messageId
	 * @param {Object} data
	 */
	static async saveSubmissionData(messageId, data) {
		this.submissionStorage.set(messageId, data);
	}

	/**
	 * @param {string} messageId
	 */
	static async getSubmissionData(messageId) {
		return this.submissionStorage.get(messageId);
	}

	/**
	 * @param {import('discord.js').Message} message
	 * @param {string} action
	 * @param {import('discord.js').User} user
	 * @param {string} type
	 */
	static async updateSubmissionStatus(message, action, user, type) {
		const messageId = message.id;
		const submissionData = await this.getSubmissionData(messageId);

		if (!submissionData) {
			console.error("Submission data not found for:", messageId);
			return;
		}

		const originalEmbed = message.embeds[0];
		const updatedEmbed = new EmbedBuilder(originalEmbed.data);

		const fields = updatedEmbed.data.fields || [];
		const statusFieldIndex = fields.findIndex(
			(field) =>
				field.name.toLowerCase().includes("status") ||
				field.name.toLowerCase().includes("goedgekeurd") ||
				field.name.toLowerCase().includes("afgekeurd")
		);

		if (action === "approved") {
			updatedEmbed.setColor(0x57f287);
			const statusValue = `✅ Goedgekeurd door ${user.displayName}`;

			if (statusFieldIndex !== -1) {
				fields[statusFieldIndex] = {
					name: "Status",
					value: statusValue,
					inline: true,
				};
			} else {
				fields.push({
					name: "Status",
					value: statusValue,
					inline: true,
				});
			}
		} else {
			updatedEmbed.setColor(0xed4245);
			const statusValue = `❌ Afgewezen door ${user.displayName}`;

			if (statusFieldIndex !== -1) {
				fields[statusFieldIndex] = {
					name: "Status",
					value: statusValue,
					inline: true,
				};
			} else {
				fields.push({
					name: "Status",
					value: statusValue,
					inline: true,
				});
			}
		}

		updatedEmbed.setFields(fields);

		const submissionConfig = Config.channels.submit.submissions[type];
		if (action === "approved" && submissionConfig?.vote) {
			updatedEmbed.addFields({
				name: "🗳️ Stemmen",
				value: `👍 **0** Upvotes\n👎 **0** Downvotes\n\nStem hieronder met de reactions of buttons!`,
				inline: false,
			});

			const { VotingManager } = await import(
				"../modules/voting/index.js"
			);
			const votingManager = VotingManager.getInstance();
			votingManager.initializeVoting(messageId);

			const voteButtons = votingManager.createVoteButtons(
				messageId,
				type
			);

			try {
				await message.reactions.removeAll();
				await message.react("👍");
				await message.react("👎");

				await message.edit({
					embeds: [updatedEmbed],
					components: [voteButtons],
				});
			} catch (error) {
				console.error("Error updating reactions:", error);
				await message.edit({ embeds: [updatedEmbed] });
			}
		} else {
			try {
				await message.reactions.removeAll();
				await message.edit({ embeds: [updatedEmbed], components: [] });
			} catch (error) {
				console.error("Error removing reactions:", error);
				await message.edit({ embeds: [updatedEmbed] });
			}
		}

		submissionData.status = action;
		submissionData.approvedBy = user.id;
		submissionData.approvedAt = Date.now();
		await this.saveSubmissionData(messageId, submissionData);
	}
}

/**
 * @param {import('discord.js').Message} message
 * @param {string} action
 * @param {import('discord.js').User} user
 * @param {string} type
 */
export async function updateSubmissionStatus(message, action, user, type) {
	return InteractionHandler.updateSubmissionStatus(
		message,
		action,
		user,
		type
	);
}

export default InteractionHandler;
