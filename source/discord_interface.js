var creds = require('./../token.json');
var discord = require('discord.io');
var markov = require('./markov.js');
var urlencode = require('urlencode');

var bot;

var noise_queue = {};
var channel_message_counter = {};

setInterval(function() {
/*

WHAT THE FUCK IT THIS FOR?

	if (noise_queue.length != 0) {
		bot.sendMessage(noise_queue);
		noise_queue = {};
	}
*/
}, 25000);
	

module.exports = {

	initialize: function() {
		var discord_creds = {
			token: creds.discord.token,
			autorun: true
		};

		bot = new discord.Client(discord_creds);

		bot.on('debug', (e)=>{
			console.log(`discord debug :`);
			console.log(e);
			// XXX make this a function?
			if (e.t === 'MESSAGE_REACTION_ADD') {
				var emoji = (e.d.emoji.id === null) ? urlencode(e.d.emoji.name) : e.d.emoji.name + ':' + e.d.emoji.id;
				bot._req(
					'put', 
					`https:\/\/canary.discordapp.com/api/v6/channels/${e.d.channel_id}/messages/${e.d.message_id}/reactions/${emoji}/@me`, 
					(err, res)=>{
						console.log(err);
						//console.log(res);
					}
				);  
			}
		});
		bot.on('error', (e)=>{
			console.log(`discord error :`);
			console.log(e);
		});

		bot.on('disconnect', ()=>{
			bot.connect();
		});

		bot.on('ready', function() {
			console.log(bot.username + ' has joined discord');
			//console.log(bot);
		});

		bot.on('message', function(user, user_id, channel_id, message, event) {
			if (user_id != bot.id) {
				// stay connected! :D/
				if (message === 'ping') {
					bot.sendMessage({
						to: channel_id,
						message: "Pong"
					});
					console.log('discord ping pong');
				}							
				// respond to name 
				if (message == '!markov' || message.includes('vombot') || message.includes('tobmov')) {
					bot.sendMessage({
						to: channel_id,
						message: markov.generate_string(33),
					});
				}
				else {
					let scrubbed_message = message.replace(/<@!?([0-9])+>/g, 'sumnub');
					markov.log_chat(scrubbed_message + '\n');
					// count messages in channels
					if (typeof channel_message_counter[channel_id] === "undefined") {
						channel_message_counter[channel_id] = {
							count: 0,
							target: Math.floor(Math.random() * 13 + 12)
						}
					}
					channel_message_counter[channel_id].count++;
					// interject responses randomly
					if (channel_message_counter[channel_id].count >= channel_message_counter[channel_id].target) {
						bot.sendMessage({
							to: channel_id,
							message: markov.generate_string()
						});
						// if its time post message and reset counter
						delete channel_message_counter[channel_id];
					}
				}
				// pizza 
				if (message.toLowerCase().indexOf('pizza') != -1) {
					console.log('discord pizza');
					bot.sendMessage({
						to: channel_id,
						message: ':pizza: PRAISE ZA! :pizza:'
					});
				}
				if (channel_id == '346236161922039818') {
					if (message == '!map') {
						console.log(markov.map_get());
					}
				};
			};
		});
	}

};