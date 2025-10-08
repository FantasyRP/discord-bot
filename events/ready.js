import {
	Events,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import Config from "../config.js";
import Logger from "../modules/print/index.js";

class ReadyEvent {
	static name = Events.ClientReady;

	static async execute(client) {
		client.guilds.cache.get(Config.guildId).commands.set(client.slashDatas);
		await this.sendSubmitEmbed(client);
		Logger.success(`${client.user.username} is online`);
	}

	static async sendSubmitEmbed(client) {
		try {
			const channel = client.channels.cache.get(
				Config.channels.submitEmbed
			);
			if (!channel) {
				Logger.error(
					`Submit embed channel not found: ${Config.channels.submitEmbed}`
				);
				return;
			}

			const messages = await channel.messages.fetch({ limit: 100 });
			await channel.bulkDelete(messages);

			const embed = new EmbedBuilder()
				.setTitle("Indienen")
				.setDescription(
					"In dit kanaal kun je suggesties en bug reports indienen. Dus heb jij een suggestie voor een feature, een voertuig of kleding? Of heb je zelfs een bug gevonden? Dien ze in, want wij ontvangen ze graag! Om dit te kunnen doen met je het volgende doen."
				)
				.setColor("#00b0f4")
				.setFooter({
					text: client.user.username,
					iconURL: client.user.displayAvatarURL(),
				})
				.setTimestamp();

			const buttons = [];
			const submissions = Config.channels.submit.submissions;

			Object.entries(submissions).forEach(([type, submissionConfig]) => {
				buttons.push(
					new ButtonBuilder()
						.setCustomId(`submit_${type}`)
						.setLabel(
							`${submissionConfig.label.slice(0, -1)} Indienen`
						)
						.setStyle(ButtonStyle.Secondary)
				);
			});

			const row = new ActionRowBuilder().addComponents(...buttons);

			await channel.send({ embeds: [embed], components: [row] });
			Logger.success("Submit embed sent!");
		} catch (error) {
			Logger.error("Error sending submit embed:", error);
		}
	}
}

export default ReadyEvent;
