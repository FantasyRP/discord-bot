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
		await this.sendReactionRolesEmbed(client);
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
			const deletableMessages = messages.filter(
				(message) => Date.now() - message.createdTimestamp < 1209600000
			);
			await channel.bulkDelete(deletableMessages);

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

	static async sendReactionRolesEmbed(client) {
		try {
			const channel = client.channels.cache.get(
				Config.channels.reactionRoles
			);
			if (!channel) {
				Logger.error(
					`Reaction roles channel not found: ${Config.channels.reactionRoles}`
				);
				return;
			}

			const messages = await channel.messages.fetch({ limit: 100 });
			await channel.bulkDelete(messages);

			const embed = new EmbedBuilder()
				.setTitle("Welkom & Regels")
				.setDescription(
					"Lees onderstaande regels aandachtig door om een prettige en veilige sfeer op de server te behouden."
				)
				.addFields(
					{
						name: "Schelden en racisme",
						value: "> Scheldwoorden die te maken hebben met ziektes en racistische opmerkingen zijn ten strengste verboden. Het gebruik van dit soort taal kan leiden tot een verbanning van de server.",
						inline: false,
					},
					{
						name: "Reclame",
						value: "> Het plaatsen van promotiemateriaal voor zaken die niet gerelateerd zijn aan Fantasy Roleplay is niet toegestaan.",
						inline: false,
					},
					{
						name: "Gedrag",
						value: "> Pesten, spammen of het starten van onnodige discussies is niet toegestaan. Respectvolle discussies zijn welkom, maar haatdragende opmerkingen én vrouwonvriendelijk gedrag worden niet getolereerd.",
						inline: false,
					},
					{
						name: "NSFW",
						value: "> Het delen of versturen van pornografisch of seksueel getint materiaal is absoluut niet toegestaan op de server.",
						inline: false,
					},
					{
						name: "Externe software",
						value: "> Om te voldoen aan de Terms of Service (ToS) is het gebruik van externe software, zoals BetterDiscord, verboden. Niet naleven kan leiden tot verwijdering van de server.",
						inline: false,
					},
					{
						name: "Regels",
						value: "> Probeer de regels niet te omzeilen door ze net iets anders te verwoorden. Overtredingen kunnen leiden tot de opgelegde sancties.",
						inline: false,
					},
					{
						name: "Taggen van staffleden",
						value: "> Het is niet toegestaan om staffleden te taggen. Vragen over unbans of andere zaken dienen via een ticket te verlopen in plaats van via PM.",
						inline: false,
					},
					{
						name: "Complimenten kanaal",
						value: "> Dit kanaal is bedoeld voor oprechte complimenten aan anderen, niet voor zelfpromotie. Gebruik in principe alleen Emoji's om te reageren.",
						inline: false,
					},
					{
						name: "Disclaimer",
						value: "> Het staffteam behoudt zich het recht voor om deze regels op elk moment te wijzigen, aan te passen of uit te breiden.",
						inline: false,
					}
				)
				.setColor("#00b0f4")
				.setFooter({
					text: client.user.username,
					iconURL: client.user.displayAvatarURL(),
				})
				.setTimestamp();

			const message = await channel.send({ embeds: [embed] });

			try {
				await message.react(Config.reactionRoles.emoji);
			} catch (error) {
				Logger.error(
					`Could not add reaction ${Config.reactionRoles.emoji}:`,
					error
				);
			}

			Logger.success("Reaction roles embed sent!");
		} catch (error) {
			Logger.error("Error sending reaction roles embed:", error);
		}
	}
}

export default ReadyEvent;
