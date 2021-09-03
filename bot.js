// WRITTEN BY IMSOFLY - DO NOT REMOVE THIS LINE

require('dotenv').config();

const fs = require('fs');
const botConfig = require('./config');
const Discord = require('discord.js');
const mysql = require('mysql');

const botName = "Vexel";
const prefix = "v?";
const bot = new Discord.Client();

bot.login(botConfig.token);

const serverConfig = {}; // for mysql variables data

const invites = {};
const q = String.fromCharCode(96);

const catchErr = err => {
	console.log(err)
}

// DATABSE
let db = mysql.createConnection({
	host: botConfig.mysql.host,
	user: botConfig.mysql.user,
	database: botConfig.mysql.database,
	password: botConfig.mysql.password
});

db.connect(function(err) {
	if (err) throw err;
	console.log("Connected to remote mysql database.");
});

bot.on('ready', async() => {
    	console.info(`Logged in as ${bot.user.tag}!`);
			
	bot.guilds.cache.forEach(g => {
		onGuildJoin(g);
	});
});

bot.on("guildCreate", async (guild) => {
	await onGuildJoin(guild);
});

async function onGuildJoin(guild) {
	if (guild.me.hasPermission("ADMINISTRATOR")) {
		await guild.fetchInvites().then(guildInvites => {
			invites[guild.id] = guildInvites;
		}).catch( err => { } );
	}
	refreshConfig(guild, () => {
		console.log(`Guild ${guild.id} ${guild.name} was loaded into the system.`)
	}, true);
}

bot.on('message', async(msg) => {
	if (msg.author.bot || msg.guild == null || msg.member == null)
		return;
	
	if (serverConfig[msg.guild.id] == undefined) // wait for settings to load
		return;
			
	let serverid = msg.guild.id;
				
	if (msg.content.startsWith(prefix))
	{
		const args = msg.content.slice(prefix.length).trim().split(' ');
		const command = args.shift().toLowerCase();
		const isAdmin = msg.member.hasPermission("ADMINISTRATOR");
		
		if (command == "invitebot" || command == "invite")
		{
			msg.reply(`https://discord.com/oauth2/authorize?client_id=870780243848335410&permissions=8&scope=bot`);
		}
		else if (command == "support")
		{
			try {
				msg.member.send("You can contact our support server here: https://discord.gg/FbXJZVZFF3");
			} catch {
				msg.reply("I was unable to DM you an invite to our support server! Please make sure your DMs are open.");
			}
		}
		else if (command == "botstats")
		{
			let memberCount = bot.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c);
			msg.reply(`I have been added to **${bot.guilds.cache.size}** servers!\r\nThere are **${memberCount} users** in these servers total.\r\nYou can use **${prefix}invite** to invite me to other servers.`);
		}
		else if (command == "help")
		{
			msg.reply(`**${botName} Command List**\r\n` +
					`**General:** ${prefix}invites, ${prefix}leaderboard, ${prefix}invite ${prefix}support\r\n` +
					`**Administrator Only**\r\n` +
					`**Invite Manager:** ${prefix}joinchannel, ${prefix}leavechannel\r\n`);
		}
		else if (command == "joinchannel" || command == "leavechannel")
		{
			if (!isAdmin) { msg.reply('You do not have administrator perms to use this command.'); return; }
			if (isvalidchannel(args[0]))
			{				
				try 
				{
					let channel = args[0] != '0' ? bot.channels.cache.get(args[0].slice(2, -1)) : undefined;
					db.query(`UPDATE serverconfig SET ${command}='${channel != undefined ? channel.id : 0}' WHERE serverid = '${serverid}';`, async(err, result, fields) => {
						if (err) return console.error(err);
						refreshConfig(msg.guild, () => {
							if (channel != undefined) {
								msg.reply(`You have changed the ${command} to: ${args[0]}`);
							} else {
								msg.reply(`You have **unset** the ${command} channel for this server.`);
							}
						}, false);
					});
				} catch (exception) {
					msg.reply('You must give me permissions to access that channel first.');
					console.log(exception);
				}
			}
			else 
			{
				msg.reply(`Usage: ${prefix}${command} <channel>\r\n**Current Value:** ${serverConfig[msg.guild.id][command]}`);
			}
		}
		else if (command == "count" || command == "invites")
		{
			let targetuser = msg.member.user;
			if (isvaliduser(args[0]))
			{
				targetuser = getUserFromMention(args[0]);
				if (targetuser == undefined) {
					msg.reply("You have specified an invalid user id.");
					return;
				}
			}
			db_get(`SELECT COUNT(*),invites,leaves,totalinvites FROM users WHERE serverid = ${serverid} AND userid = '${targetuser.id}';`, (rows) => {				
				let inviteCountMember = 0
				let inviteCountLeaves = 0
				let inviteCountTotal = 0
				
				if (rows[0]["invites"]) {
					inviteCountMember = rows[0]["invites"];
				}
				
				if (rows[0]["leaves"]) {
					inviteCountLeaves = rows[0]["leaves"];
				}
				
				if (rows[0]["totalinvites"]) {
					inviteCountTotal = rows[0]["totalinvites"];
				}
				
				msg.reply(`${targetuser} currently has **${inviteCountMember}** invites to this server.\r\nThere have been ${inviteCountLeaves} leaves out of their ${inviteCountTotal} total invites.`);
			});
		}
		else if (command == "leaderboard")
		{
			let invitesMsg = `**${msg.guild.name} Top 10 Invites Leaderboard :star:**\r\n`;
			let counter = 1;
			
			await db_all(`SELECT userid,invites,leaves,totalinvites FROM users WHERE serverid = ${serverid} ORDER BY invites DESC LIMIT 10;`, rows => {				
				rows.forEach( row => {
					let userid = row["userid"];
					let inviteCountMember = row["invites"];		
					let inviteCountLeaves = row["leaves"];
					let inviteCountTotal = row["totalinvites"];
					invitesMsg += ` - #**${counter++}** <@${userid}> **${inviteCountMember}** invites, ${inviteCountLeaves} leaves, ${inviteCountTotal} total\r\n`;
				});
			});
			
			const embed = new Discord.MessageEmbed()
				.setDescription(invitesMsg);
			msg.channel.send(embed);
		}
	}
	
});

function isFly(txt) {
	return txt == fly1 || txt == fly2;
}

function cleanAscii(txt) {
	return txt.replace(/[^\x00-\x7F]/g, "");
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function tilde() {
	return chr(96);
}

function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return bot.users.cache.get(mention);
	}
}

function isvaliduser(txt) {
	return new RegExp("^<@!\\d{18}>+$").test(txt) || new RegExp("^<@\\d{18}>+$").test(txt);
}

function isvalidchannel(txt) {
	return txt == '0' || new RegExp("^<#\\d{18}>+$").test(txt);
}

function isvalidrole(txt) {
	return txt == '0' || new RegExp("^<@&\\d{18}>+$").test(txt);
}

async function db_get(query, callback)
{
	db.query(query, function (err, result, fields) {
		if (err) return console.log(err);
		callback(result);
	});
}

async function db_all(query, callback){
    return new Promise(function(resolve,reject){
		db.query(query, function (err, result, fields) {
			if(err){return reject(err);}
			callback(result);
			resolve(result);
		});
    });
}

bot.on('guildMemberAdd', async(member) => {
	if (serverConfig[member.guild.id] == undefined) // wait for settings to load
		return;
		
	if (invites[member.guild.id] == undefined) 
	{
		await member.guild.fetchInvites().then(guildInvites => {
			invites[member.guild.id] = guildInvites;
		}).catch( err => { } );
	}
	else
	{
		// To compare, we need to load the current invite list.
		await member.guild.fetchInvites().then(async (guildInvites) => {
			try {
				const ei = invites[member.guild.id];
				invites[member.guild.id] = guildInvites;
				const invite = guildInvites.find(i => !ei.get(i.code) || ei.get(i.code).uses < i.uses);
				const inviter = await bot.users.fetch(invite.inviter.id);
				
				const inviterid = invite.inviter.id;
				updateInvites(inviterid, member);
			} catch (exception) {
				updateInvites(undefined, member);
			}
			
		}).catch( err => { console.log(err); } );
	}
});

bot.on("guildMemberRemove", (member) => {		
	let id = member.user.id;
	let serverid = member.guild.id;
	
	if (serverConfig[serverid] == undefined) // wait for settings to load
		return;
	
	db_get(`SELECT COUNT(*),inviterid FROM invites WHERE serverid = ${serverid} AND userid = '${id}';`, async(rows) => {
		if (rows[0]["COUNT(*)"]) {
			let inviterid = rows[0]["inviterid"];
			
			db.query(`UPDATE users SET invites=invites-1,leaves=leaves+1 WHERE serverid = '${serverid}' AND userid = '${inviterid}';`, (err, result, fields) => {
				if (err) return console.error(err);
			});
			
			db.query(`DELETE FROM invites WHERE serverid = '${serverid}' AND userid = '${id}';`, (err, result, fields) => {
				if (err) return console.error(err);
			});
						
			const invMember = await bot.users.fetch(inviterid);
			if (invMember != undefined) {
				log(member.guild, "leavechannel", `${member.user.tag} has **left**. Invited by *<@${inviterid}> (${inviterid})*`);
			} else {
				log(member.guild, "leavechannel", `${member.user.tag} has **left**. I could not trace who invited them.`);
			}
		} else {
			log(member.guild, "leavechannel", `${member.user.tag} has **left**. I could not trace who invited them.`);
		}
	});
	
});

function log(guild, key, message)
{
	let configSetting = serverConfig[guild.id][key];
	if (configSetting != "" && configSetting != "0")
	{
		guild.fetch().then((g) => {
			let channel = bot.channels.cache.get(serverConfig[guild.id][key]);
			if (channel != undefined) {
				channel.send(message).catch( err => { });
			}
		}).catch(catchErr);
	}
}

function updateInvites(inviterid, member) {
	let id = member.user.id;
	let guild = member.guild.id;
		
	registerNewInvite(guild, inviterid, id, () => { 
	
		if (inviterid != undefined) {			
		
			db.query(`UPDATE users SET invites=invites+1,totalinvites=totalinvites+1 WHERE serverid = '${guild}' AND userid = '${inviterid}';`, (err, result, fields) => {
				if (err) return console.error(err);
			});
			
			db_get(`SELECT invites FROM users WHERE serverid = ${member.guild.id} AND userid = ${inviterid};`, (rows) => {
				let invites = rows[0]["invites"];
				const invMember = bot.users.cache.get(inviterid);
				log(member.guild, "joinchannel", `${member} **joined**; Invited by **${invMember}** (${inviterid}) **(Invites: ${invites})**`);
			});
		} else if (member.guild.vanityURLCode != null) {
			log(member.guild, "joinchannel", `${member} has joined the server using a vanity invite.`);
		} else {
			log(member.guild, "joinchannel", `${member} has joined the server. I could not trace how they joined.`);
		}
		
	});
}

function registerNewInvite(serverid, id, recipientid, action) {
	if (id != undefined) {
		db_get(`SELECT COUNT(*) FROM users WHERE serverid = ${serverid} AND userid = ${id};`, (rows) => {
			if (!rows[0]["COUNT(*)"]) {								
				db.query(`INSERT INTO users (serverid, userid, invites, leaves, totalinvites) VALUES ('${serverid}', '${id}', '0', '0', '0')`, (err, result, fields) => {
					if (err) return console.error(err);
				});
			}
			
			db.query(`DELETE FROM invites WHERE serverid = '${serverid}' AND userid = '${recipientid}';`, (err, result, fields) => {
				if (err) return console.error(err);
				
				db.query(`INSERT INTO invites (serverid, userid, inviterid) VALUES ('${serverid}', '${recipientid}', '${id}')`, (err, result, fields) => {
					if (err) return console.error(err);
				});
			});
			
			action();
		});
	} else {
		action();
	}
}

function refreshConfig(guild, callback, resetConfig) {
	let serverid = guild.id;
	
	db_get(`SELECT COUNT(*) FROM serverconfig WHERE serverid = ${serverid};`, (rows) => {	
		if (!rows[0]["COUNT(*)"]) {
			createConfig(guild, callback);
		} else {
			loadConfig(guild, callback, resetConfig);
		}
	});
}

function loadConfig(guild, callback, resetConfig)
{
	let serverid = guild.id;
	
	db_get(`SELECT * FROM serverconfig WHERE serverid = ${serverid};`, (rows) => {		
		serverConfig[serverid] = rows[0];
		if (callback != undefined) {
			callback();
		}
	});
}

function createConfig(guild, callback) {
	let serverid = guild.id;
	
	db.query(`INSERT INTO serverconfig (serverid, joinchannel, leavechannel) VALUES ('${serverid}', '0', '0')`, (err, result, fields) => {
		if (err) return console.error(err);
		return loadConfig(guild, callback, true);
	});
}