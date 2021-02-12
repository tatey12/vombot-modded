var creds = require('./../token.json');
var discord = require('discord.io');
var markov = require('./markov.js');
var urlencode = require('urlencode');
var request = require('request');
let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
var bot;
var channel_ids = {
	botb: '239107754575265803',
	nsfw: '460936042522869770',
	dm: '346236161922039818',
};

var noise_queue = {};
var channel_message_counter = {};
var channel_data = {};
var api = `https:\/\/canary.discordapp.com/api/v6`;


var get_channel_status = function(channel_id) {
	if (typeof channel_data[channel_id] !== 'object') {
		bot._req('get', `${api}/channels/${channel_id}`, function(err, res) {
			console.log(res.body);	
			return channel_data[channel_id] = res.body;
		});
	}
	else return channel_data[channel_id];
}


module.exports = {
	initialize: function() {
		var discord_creds = {
			token: creds.discord.token,
			autorun: true
		};
		bot = new discord.Client(discord_creds);
		bot.on('debug', (e) => {
			//console.log(`discord debug :`);
			//console.log(e);
			let author = (e.d && e.d.author) ? e.d.author.username : ' ';
			console.log(author + ' ' + e.t);
			if (e.t === 'MESSAGE_REACTION_ADD') {
				var emoji = (e.d.emoji.id === null) ? urlencode(e.d.emoji.name) : e.d.emoji.name + ':' + e.d.emoji.id;
				bot._req(
					'put', 
					`${api}/channels/${e.d.channel_id}/messages/${e.d.message_id}/reactions/${emoji}/@me`, 
					(err, res)=>{
						console.log(err);
						//console.log(res);
					}
				);  
			}
		});
		bot.on('error', (e) => {
			console.log(`discord error :`);
			console.log(e);
		});
		bot.on('disconnect', (errMsg, code) => {
			console.log('discord disconnect');
			console.log(code + ' :: ' + errMsg);
			setTimeout(() => {
				console.log('reconnecting...');
				bot.connect();
			}, 250);
		});
		bot.on('ready', function() {
			console.log(bot.username + ' logged in.');
			//console.log(bot);
		});
		bot.on('message', function(user, user_id, channel_id, message, event) {
			// log incoming
			console.log(user + " - " + message + " | " + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
			if (user_id != bot.id) {
				// PING PONG!!!
				// stay connected! :D/
				if (message === 'ping') {
					bot.sendMessage({
						to: channel_id,
						message: "Pong"
					});
					console.log('discord ping pong');
					return;
				}							
			}
			else message = ' ';
			// what will the bot say?
			let botmess = [];
			let words = message.toLowerCase().split(' ');
			// MARKOV STUFF
			// replace @me's with a string
			let scrubbed_message = message.replace(/<@!?([0-9])+>/g, 'sumnub');
			// respond to name 
			if (message == '!markov' || message.toLowerCase().includes('vombot') || message.includes('tobmov')) {
				m_str = markov.generate_string(message.replace('vombot','').trim());
				botmess.push(m_str);
			}
			if (typeof channel_message_counter[channel_id] === "undefined") {
				channel_message_counter[channel_id] = {
					count: 0,
					target: Math.floor(Math.random() * 13 + 12)
				}
			}
			channel_message_counter[channel_id].count++;
			if (channel_message_counter[channel_id].count >= channel_message_counter[channel_id].target) {
				m_str = markov.generate_string(message);
				// don't simply repeat what was said
				if (m_str != message) botmess.push(m_str);
				// if its time post message and reset counter
				delete channel_message_counter[channel_id];
			}
			if (channel_id == channel_ids.dm) {
				if (message == '!map') {
					console.log(markov.map_get());
				}
			};

			// SEND OUT SOME NOISE!
			if (botmess.length > 0) {
				botmess = botmess.join("\n");
				bot.sendMessage({
					to: channel_id,
					message: botmess,
				});
				if (channel_id == channel_ids.botb) irc_botb.relay('#botb', '', botmess);
			}

		});
		console.log(bot);
	},
	channel_id: function(channel_name) {
		return channel_ids[channel_name];
	},
	say: function(channel_id, message) {
		console.log('sending message to discord ' + channel_id);
		console.log(message);
		console.log(bot.sendMessage({
			to: channel_id,
			message: message,
		}));
	},
};
