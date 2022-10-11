// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const dataHandler = require ('./dataHandler')

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const leaderboardChannels = {
    "Cook's Assistant" : "1029211654497517668",
    "Dragon Slayer 1" : "1029211730888368129",
    "Demon Slayer" : "1029211692120420453",
    "Vampyre Slayer" : "1029211712307597312",
    "Ernest the Chicken" : "1029211674231722154"
}

const buildLeaderboard = (quest) => {
    let data = dataHandler.getLeaders(quest)
    let leaderboard = "```"
    leaderboard += "| Rank | User         |       Time | Image \n" 
    exampleString= "|      |              |            | "

    data.forEach((entry, i) => {
        let time = dataHandler.ticksToTime(entry.time)

        let formattedEntry = "| "
        let rank = (i + 1) + ""
        formattedEntry += rank.padStart(4, " ")

        formattedEntry += " | "

        formattedEntry += entry.user.padEnd(12, " ")

        formattedEntry += " | "

        formattedEntry += time.padStart(10, " ")

        formattedEntry += " | "

        formattedEntry += entry.image
        formattedEntry += "\n"
        leaderboard += formattedEntry
    })

    leaderboard += "```"
    return leaderboard
}

const updateLeaderboard = (quest, channelID) => {
    if(!(quest in leaderboardChannels)){
        return false
    }
    // const channelID = leaderboardChannels[leaderboard]
    // const channelID = "1020827647170854922"
    client.channels.cache.get(channelID).bulkDelete(1)
    client.channels.cache.get(channelID).send({ content: buildLeaderboard(quest)})
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName, member } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply('Server info.');
	} else if (commandName === 'user') {
		await interaction.reply('User info.');
	}

    else if (commandName === "submit"){
        if(interaction.channelId === "1020554204529561610"){
            // await interaction.deferReply()
            let retObj = dataHandler.addSubmission(
                interaction.options.getString("username"),
                interaction.options.getString("quest"),
                interaction.options.getString("time"),
                interaction.options.getString("image"),
                interaction.options.getString("video"),
            )

            if(retObj.success){
                await interaction.reply({ content: 'Thank you for submitting your run. The verification team will review it shortly', ephemeral: true });
                let getObj = dataHandler.getSubmissionFormatted(retObj.id)
                if(getObj.success){
                    let data = getObj.submission
                    client.channels.cache.get("1020561678011740231").send(
`---
\`\`\`Submission id: ${data.id}
Date: ${data.date}
Name: ${data.user}
Quest: ${data.quest}
Time: ${data.time}
Image: ${data.image}
Video: ${data.video}\`\`\`
\`/deny ${data.id}\` to deny
\`/confirm ${data.id}\` to confirm image
\`/verify ${data.id} <video-url>\` to add public video
---`
                    )
                }
            }

            
        }
        else{
            await interaction.reply({ content: 'Please move to <#1020554204529561610> to use this command', ephemeral: true });
        }
    }

    else if(commandName === "confirm"){
        if(interaction.channelId === "1020561678011740231"){
            const submissionId = parseInt(interaction.options.getInteger("id"))

            let {submission} = dataHandler.getSubmission(submissionId)
            console.log(submission)

            let oldBoard = dataHandler.getLeaders(submission.quest)

            dataHandler.confirmSubmission(
                submissionId,
                interaction.user.id
            )

            let newBoard = dataHandler.getLeaders(submission.quest)

            await interaction.reply({ content: 'Submission has been confirmed'});

            if(JSON.stringify(newBoard) !== JSON.stringify(oldBoard)){
                console.log(submission.quest, leaderboardChannels[submission.quest])
                updateLeaderboard(submission.quest, leaderboardChannels[submission.quest])
            }
        }
    }

    else if(commandName === "update"){
        // if(interaction.channelId === "1020561678011740231"){
            // updateLeaderboard();
            await interaction.reply({content: "Updated!", ephemeral: true})
        // }
    }
});

// Login to Discord with your client's token
client.login(token);