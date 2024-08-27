require('dotenv').config();
const token = process.env.token;
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(token);
const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('BOTのコマンド一覧を送信')
        .toJSON(),
	new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!(BOTのPingを表示します。)')
		.toJSON(),
	];
async function main() {
    try {
        await rest.put(
            Routes.applicationCommands('1251167658167111691'),
            { body: commands }
        );
        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error('Error registering application commands:', error);
    }
}

main();
