# Discord Bot - Fantasy Roleplay

A modular Discord bot built with Discord.js v14 for the Fantasy Roleplay community. This bot provides functionality for managing suggestions, bug reports, voting systems, and more.

## 🚀 Features

-   **Slash Commands**: Modern Discord slash commands support
-   **Submission System**: System for submitting suggestions and bug reports
-   **Voting System**: Automatic voting system with reactions
-   **Event Handlers**: Modular event handling system
-   **Guild Member Management**: Automatic welcome messages and member management
-   **Reaction Handling**: Advanced reaction handling for interactive features

## 📋 Commands

### Info Commands

-   `/ping` - Check bot responsiveness

### Setup Commands

-   `/setup-submit` - Setup the submission system

## 🛠️ Installation

### Requirements

-   Node.js 18.0.0 or higher
-   NPM or Yarn
-   Discord Bot Token

### Setup

1. **Clone the repository**

    ```bash
    git clone https://github.com/FantasyRP/discord-bot.git
    cd discord-bot
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Environment configuration**

    Create a `.env.local` file in the root directory:

    ```env
    DISCORD_BOT_TOKEN=your_discord_bot_token_here
    ```

4. **Bot configuration**

    Adjust `config.js` to your server settings:

    - Guild ID
    - Channel IDs
    - Other server-specific settings

5. **Start the bot**
    ```bash
    npm test
    ```

## 📁 Project Structure

```
discord-bot/
├── commands/           # Slash commands
│   └── info/          # Info related commands
├── events/            # Event handlers
├── handlers/          # Command and event handlers
├── modules/           # Modular functionalities
│   ├── print/         # Print utilities
│   ├── submission/    # Submission system
│   └── voting/        # Voting system
├── config.js          # Bot configuration
├── index.js           # Main entry point
└── package.json       # Dependencies and scripts
```

## 🔧 Configuration

### Bot Permissions

The bot requires the following permissions:

-   `Send Messages`
-   `Read Messages`
-   `Manage Messages`
-   `Add Reactions`
-   `Use Slash Commands`
-   `Manage Roles` (optional)
-   `Manage Channels` (optional)

### Channel Setup

Configure the following channels in `config.js`:

-   **Welcome Channel**: For welcome messages
-   **Submit Embed Channel**: For submission embeds
-   **Suggestions Channel**: For suggestions
-   **Bugs Channel**: For bug reports

## 🤝 Contributing

######

1. Fork the project
2. Create a branch following [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) naming guidelines:
    ```bash
    git checkout -b feat/amazing-feature
    ```
3. Commit your changes using a [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) message:
    ```bash
    git commit -m "feat: add amazing feature"
    ```
4. Push to the branch using the same naming convention:
    ```bash
    git push origin feat/amazing-feature
    ```
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

-   **Arootsy** - _Initial work_ - [Arootsy](https://github.com/Arootsy)

## 🔗 Links

-   [GitHub Repository](https://github.com/FantasyRP/discord-bot)
-   [Issues](https://github.com/FantasyRPy/discord-bot/issues)

## 📞 Support

For support and questions you can:

-   Create an issue on GitHub
-   Contact us via the Fantasy Roleplay Discord server

---

_This bot is specially developed for the Fantasy Roleplay community._
