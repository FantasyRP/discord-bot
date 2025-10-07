import { Collection, Events, InteractionType } from "discord.js";
import config from "../config.js";
const cooldown = new Collection();

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		const { client } = interaction;
		if (interaction.type === InteractionType.ApplicationCommand) {
			if (interaction.user.bot) {
				return;
			}

			try {
				const command = client.slashCommands.get(interaction.commandName);
				if (command) {
					if (
						command.ownerOnly &&
						!config.owners.includes(interaction.user.id)
					) {
						return interaction.reply({
							content: "Alleen **toegewezen** users kunnen dit command gebruiken.",
							ephemeral: true,
						});
					}

					if (command.cooldown) {
						if (cooldown.has(`${command.name}-${interaction.user.id}`)) {
							const nowDate = interaction.createdTimestamp;
							const waitedDate =
								cooldown.get(`${command.name}-${interaction.user.id}`) -
								nowDate;
							return interaction
								.reply({
									content: `Chill down, je hebt een kleine cooldown. Je moet nog <t:${Math.floor(
										new Date(nowDate + waitedDate).getTime() / 1000,
									)}:R> wachten.`,
									ephemeral: true,
								})
								.then(() =>
									setTimeout(
										() => interaction.deleteReply(),
										cooldown.get(`${command.name}-${interaction.user.id}`) -
											Date.now() +
											1000,
									),
								);
						}

						command.slashRun(interaction);

						cooldown.set(
							`${command.name}-${interaction.user.id}`,
							Date.now() + command.cooldown,
						);

						setTimeout(() => {
							cooldown.delete(`${command.name}-${interaction.user.id}`);
						}, command.cooldown + 1000);
					} else {
						command.slashRun(interaction);
					}
				}
			} catch (e) {
				console.error(e);
				interaction.reply({
					content:
						"Whoops, iets is mis gegaan.",
					ephemeral: true,
				});
			}
		}
	},
};