import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EventHandler {
	static async loadEvent(file) {
		try {
			const event = await import(`../events/${file}`);
			return event?.default;
		} catch (error) {
			console.error(`Failed to load event ${file}:`, error);
			return null;
		}
	}

	static processEvent(client, event) {
		if (!event?.name) return;

		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}

	static async execute(client) {
		const eventsPath = path.resolve(__dirname, "../events");
		const eventFiles = readdirSync(eventsPath);

		const events = await Promise.all(
			eventFiles.map((file) => this.loadEvent(file))
		);

		events
			.filter(Boolean)
			.forEach((event) => this.processEvent(client, event));
	}
}

export default EventHandler;
