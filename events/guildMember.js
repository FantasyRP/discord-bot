import { EmbedBuilder, Events } from "discord.js";
import Config from "../config.js";

class GuildMemberEvent {
	static name = Events.GuildMemberAdd;

	static async execute(interaction) {
		const { client } = interaction;

		const embed = new EmbedBuilder()
			.setTitle(client.user.username)
			.setDescription(
				`Hey <@${interaction.user.id}>, welkom in de ${client.user.username} discord! Veel plezier!`
			)
			.setTimestamp()
			.setFooter({
				text: client.user.username,
				iconURL: client.user.displayAvatarURL(),
			})
			.setColor("#00b0f4");

		const channel = client.channels.cache.get(Config.channels.welcome);
		if (channel) {
			const message = await channel.send({ embeds: [embed] });
			await message.react("👋");
			return message;
		}

		return false;
	}
}

export default GuildMemberEvent;
