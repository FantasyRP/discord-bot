import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default {
    token: process.env.DISCORD_BOT_TOKEN,
    guildId: '1246752593594810368',
    owners: ['713448937490481182' /**, ['123456789123456789'] */] // for SUDO (super user DO) commands :)
}