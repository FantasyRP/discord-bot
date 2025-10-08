import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

class Config {
	static get token() {
		return process.env.DISCORD_BOT_TOKEN;
	}

	static get guildId() {
		return "1246752593594810368";
	}

	static get prefix() {
		return "!";
	}

	static get channels() {
		return {
			welcome: "1246752593594810371",
			submitEmbed: "1425127399019905034",
			suggestions: {
				channelId: "1425145206780465343",
				type: "text",
			},
			bugs: {
				channelId: "1425145184710295695",
				type: "forum",
			},
			submit: {
				submissions: {
					suggestions: {
						label: "Suggesties",
						colour: "#5865f2",
						outputChannelId: "1425145206780465343",
						channelType: "text",
						vote: true,
						requireApproval: true,
						createThread: true,
						inputFields: [
							{
								label: "Beschrijving",
								style: "PARAGRAPH",
								required: true,
								maxLength: 4000,
								minLength: 100,
								placeholder: "Beschrijf hier je suggestie...",
							},
							{
								label: "Reden",
								style: "PARAGRAPH",
								required: true,
								maxLength: 4000,
								minLength: 200,
								placeholder:
									"Waarom denk je dat dit een goede suggestie is?",
							},
						],
					},
					bugs: {
						label: "Bugs",
						outputChannelId: "1425145184710295695",
						colour: "#ed4245",
						channelType: "forum",
						vote: false,
						requireApproval: true,
						createThread: false,
						inputFields: [
							{
								label: "Beschrijving",
								style: "PARAGRAPH",
								required: true,
								maxLength: 4000,
								minLength: 10,
								placeholder: "Beschrijf hier de bug...",
							},
							{
								label: "Stappen om te reproduceren",
								style: "PARAGRAPH",
								required: true,
								maxLength: 4000,
								minLength: 10,
								placeholder:
									"Welke stappen moet ik volgen om de bug te reproduceren?",
							},
							{
								label: "Verwacht gedrag",
								style: "PARAGRAPH",
								required: true,
								maxLength: 4000,
								minLength: 10,
								placeholder:
									"Wat had er volgens jou moeten gebeuren?",
							},
							{
								label: "Werkelijk gedrag",
								style: "PARAGRAPH",
								required: true,
								maxLength: 4000,
								minLength: 10,
								placeholder:
									"Wat gebeurde er in werkelijkheid?",
							},
							{
								label: "Beeldmateriaal (optioneel)",
								style: "PARAGRAPH",
								required: false,
								maxLength: 4000,
								minLength: 10,
								placeholder:
									"Voeg links toe naar screenshots, video's of andere relevante media.",
							},
						],
					},
				},
			},
		};
	}

	static get owners() {
		return ["713448937490481182"];
	}
}

export default Config;
