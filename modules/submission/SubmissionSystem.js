import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import Config from "../../config.js";

export class SubmissionSystem {
	constructor(client) {
		this.client = client;
		this.config = Config;
	}

	createMainEmbed() {
		return new EmbedBuilder()
			.setTitle("Indienen")
			.setDescription(
				"In dit kanaal kun je suggesties en bug reports indienen. Dus heb jij een suggestie voor een feature, een voertuig of kleding? Of heb je zelfs een bug gevonden? Dien ze in, want wij ontvangen ze graag! Om dit te kunnen doen met je het volgende doen."
			)
			.setFooter({
				text: client.user.username,
				iconURL: client.user.displayAvatarURL(),
			})
			.setColor("#3498db");
	}

	createButtonRow() {
		const buttons = Object.entries(this.config.channels)
			.map(([channelType, typeData]) => {
				return Object.entries(typeData.submissionTypes).map(
					([submissionType, submissionData]) => {
						return new ButtonBuilder()
							.setCustomId(
								`submit_${channelType}_${submissionType}`
							)
							.setLabel(submissionData.label)
							.setStyle(ButtonStyle.Primary);
					}
				);
			})
			.flat();

		return new ActionRowBuilder().addComponents(buttons);
	}

	createModal(channelType, submissionType) {
		const submissionConfig =
			this.config.channels[channelType].submissionTypes[submissionType];
		const modal = new ModalBuilder()
			.setCustomId(`modal_${channelType}_${submissionType}`)
			.setTitle(`Indienen ${submissionConfig.label}`);

		submissionConfig.inputFields.forEach((field, index) => {
			const textInput = new TextInputBuilder()
				.setCustomId(`input_${index}`)
				.setLabel(field.label)
				.setStyle(
					field.style === "PARAGRAPH"
						? TextInputStyle.Paragraph
						: TextInputStyle.Short
				)
				.setRequired(field.required)
				.setMaxLength(field.maxLength)
				.setMinLength(field.minLength)
				.setPlaceholder(field.placeholder);

			modal.addComponents(
				new ActionRowBuilder().addComponents(textInput)
			);
		});

		return modal;
	}

	createSubmissionEmbed(channelType, submissionType, user, fields) {
		const submissionConfig =
			this.config.channels[channelType].submissionTypes[submissionType];
		const embed = new EmbedBuilder()
			.setTitle(`${submissionConfig.label}`)
			.setColor(submissionConfig.colour)
			.setAuthor({
				name: user.tag,
				iconURL: user.displayAvatarURL({ dynamic: true }),
			})
			.setTimestamp()
			.setFooter({ text: `User ID: ${user.id}` });

		fields.forEach((field, index) => {
			const fieldConfig = submissionConfig.inputFields[index];
			embed.addFields({
				name: fieldConfig.label,
				value: field || "Niet opgegeven",
				inline: false,
			});
		});

		return embed;
	}

	updateSubmissionStatus(embed, status, colour) {
		const updatedEmbed = EmbedBuilder.from(embed);
		updatedEmbed.setTitle(`${embed.data.title} - ${status}`);
		updatedEmbed.setColor(colour);
		return updatedEmbed;
	}

	async sendToChannel(channelType, submissionType, embed, user) {
		const channelConfig = this.config.channels[channelType];
		const submissionConfig = channelConfig.submissionTypes[submissionType];
		const channel = this.client.channels.cache.get(channelConfig.channelId);

		if (!channel) return null;

		let message;
		if (channelConfig.channelType === "forum") {
			const thread = await channel.threads.create({
				name: `${submissionConfig.label} by ${user.username}`,
				message: { embeds: [embed] },
			});
			message = await thread.fetchStarterMessage();
		} else {
			message = await channel.send({ embeds: [embed] });
		}

		if (submissionConfig.requireApproval) {
			await message.react("✅");
			await message.react("❌");
		}

		if (submissionConfig.vote) {
			await message.react("👍");
			await message.react("👎");
		}

		return message;
	}

	getSubmissionConfig(channelType, submissionType) {
		return this.config.channels[channelType]?.submissionTypes[
			submissionType
		];
	}

	isOwner(userId) {
		return this.config.owners.includes(userId);
	}
}
