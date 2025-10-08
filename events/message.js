import { ChannelType, Collection, Events } from "discord.js";
import Config from "../config.js";

class MessageHandler {
	static name = Events.MessageCreate;

	static restrictedThreads = new Collection();

	/**
	 * @param {import('discord.js').Message} message
	 */
	static async execute(message) {
		if (message.author.bot) return;

		if (message.channel.type === ChannelType.PrivateThread) {
			await this.handleThreadMessage(message);
		}
	}

	/**
	 * @param {import('discord.js').Message} message
	 */
	static async handleThreadMessage(message) {
		const threadId = message.channel.id;
		
		if (this.restrictedThreads.has(threadId)) {
			const isOwner = Config.owners.includes(message.author.id);
			
			if (!isOwner) {
				try {
					await message.delete();
				} catch (error) {
					console.error("Error deleting message from restricted thread:", error);
				}
			}
		}
	}

	/**
	 * @param {string} threadId
	 */
	static restrictThread(threadId) {
		this.restrictedThreads.set(threadId, true);
	}

	/**
	 * @param {string} threadId
	 */
	static unrestrictThread(threadId) {
		this.restrictedThreads.delete(threadId);
	}

	/**
	 * @param {string} threadId
	 * @returns {boolean}
	 */
	static isThreadRestricted(threadId) {
		return this.restrictedThreads.has(threadId);
	}
}

export default MessageHandler;