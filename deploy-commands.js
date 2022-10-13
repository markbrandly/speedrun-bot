const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json');


const truege = true

const commands = [
    new SlashCommandBuilder()
    .setName('submit')
    .setDescription('Allows user to submit runs')
    .addStringOption(option =>
        option.setName('username')
        .setDescription('Your preferred listed name')
        .setRequired(truege)
    )
    .addStringOption(option =>
        option.setName('quest')
        .setDescription('The quest ran')
        .setRequired(truege)
    )
    .addStringOption(option =>
        option.setName('time')
        .setDescription('Time to completion (hh:mm:ss.s)')
        .setRequired(truege)
    )
    .addStringOption(option =>
        option.setName('image')
        .setDescription('Image of proof (imgur pls)')
        .setRequired(truege)
    )
    .addStringOption(option =>
        option.setName('video')
        .setDescription('Video that will be listed with run (optional) (Youtube pls)')
        .setRequired(false)
    ),
    new SlashCommandBuilder()
    .setName('deny')
    .setDescription('Deny a run submission')
    .addIntegerOption(option =>
        option.setName('id')
        .setDescription('Submission id')
        .setRequired(truege)
    ),

    new SlashCommandBuilder()
    .setName('confirm')
    .setDescription('Confirm a run submission')
    .addIntegerOption(option =>
        option.setName('id')
        .setDescription('Submission id')
        .setRequired(truege)
    ),
    new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify video and add link (optional)')
    .addIntegerOption(option =>
        option.setName('id')
        .setDescription('Submission id')
        .setRequired(truege)
    )
    .addStringOption(option =>
        option.setName('video')
        .setDescription('video link')
        .setRequired(false)
    ),

    new SlashCommandBuilder()
    .setName('update')
    .setDescription('Verify video and add link (optional)'),
    new SlashCommandBuilder()
    .setName('backupdata')
    .setDescription('Verify video and add link (optional)')
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);