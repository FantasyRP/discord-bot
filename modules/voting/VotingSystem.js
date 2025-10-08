export class VotingSystem {
	constructor() {
		this.votes = new Map();
	}

	addVote(messageId, userId, type) {
		if (!this.votes.has(messageId)) {
			this.votes.set(messageId, new Map());
		}
		this.votes.get(messageId).set(userId, type);
	}

	removeVote(messageId, userId) {
		if (this.votes.has(messageId)) {
			this.votes.get(messageId).delete(userId);
		}
	}

	getVoteCounts(messageId) {
		if (!this.votes.has(messageId)) {
			return { upvotes: 0, downvotes: 0 };
		}

		const messageVotes = this.votes.get(messageId);
		let upvotes = 0;
		let downvotes = 0;

		for (const vote of messageVotes.values()) {
			if (vote === "upvote") upvotes++;
			if (vote === "downvote") downvotes++;
		}

		return { upvotes, downvotes };
	}

	updateEmbedWithVotes(embed, messageId) {
		const { upvotes, downvotes } = this.getVoteCounts(messageId);
		const fields = embed.data.fields ? [...embed.data.fields] : [];

		const voteFieldIndex = fields.findIndex(
			(field) => field.name === "Votes"
		);
		const voteField = {
			name: "Votes",
			value: `👍 ${upvotes} | 👎 ${downvotes}`,
			inline: true,
		};

		if (voteFieldIndex !== -1) {
			fields[voteFieldIndex] = voteField;
		} else {
			fields.push(voteField);
		}

		return { ...embed.data, fields };
	}
}
