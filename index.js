import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import { readdirSync } from "node:fs";
import Config from "./config.js";

class DiscordBot {
	constructor() {
		this.client = new Client({
			intents: Object.values(GatewayIntentBits),
			partials: Object.values(Partials),
			shards: "auto",
		});
	}

	async initialize() {
		await this.loadHandlers();
		await this.login();
	}

	async loadHandlers() {
		const handlerFiles = readdirSync("./handlers");

		for (const file of handlerFiles) {
			const handlerModule = await import(`./handlers/${file}`);
			const handler = handlerModule.default;
			await handler.execute(this.client);
		}
	}

	async login() {
		await this.client.login(Config.token);
	}
}

// Initialize the bot
const bot = new DiscordBot();
bot.initialize();
