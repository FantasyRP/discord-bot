import { Collection } from "discord.js";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CommandHandler {
	static initializeCollections(client) {
		client.commands = new Collection();
		client.commandAliases = new Collection();
		client.slashCommands = new Collection();
		client.slashDatas = [];
	}

	static async loadCommand(category, file) {
		try {
			const command = await import(`../commands/${category}/${file}`);
			return command?.commandBase;
		} catch (error) {
			console.error(`Failed to load command ${file}:`, error);
			return null;
		}
	}

	static processCommand(client, command) {
		if (!command?.slashData) return;

		client.slashDatas.push(command.slashData.toJSON());
		client.slashCommands.set(command.slashData.name, command);
	}

	static async execute(client) {
		this.initializeCollections(client);

		const commandsPath = path.resolve(__dirname, "../commands");
		const commandFolders = readdirSync(commandsPath);

		for (const category of commandFolders) {
			const categoryPath = path.resolve(commandsPath, category);
			const commandFiles = readdirSync(categoryPath);

			const commands = await Promise.all(
				commandFiles.map((file) => this.loadCommand(category, file))
			);

			commands
				.filter(Boolean)
				.forEach((command) => this.processCommand(client, command));
		}
	}
}

export default CommandHandler;
