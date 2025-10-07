import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { readdirSync } from "node:fs";
import print from "./modules/print/index.js";
import config from './config.js';

const client = new Client({ 			
    intents: Object.values(GatewayIntentBits),
    partials: Object.values(Partials),
    shards: "auto", 
});

client.on(Events.ClientReady, (client) => {
    print.success(`${client.user.username} is online`)

    client.guilds.cache.get(config.guildId).commands.set(client.slashDatas);
})

readdirSync("./handlers").forEach(async (file) => {
    const handlerFile = await import(`./handlers/${file}`);
    const handler = handlerFile.default;
    handler.execute(client);
});

client.login(config.token)