var discord_interface = require('./lib/discord_interface.js');
var markov = require('./lib/markov.js');
var ws_server = require('./lib/ws_server.js');




/*
	trying to replace twitch alerts with new follower alerts
curl.get('https://api.twitch.tv/kraken/channels/puke7/follows', {
	HTTPHEADER: 'Accept: application/vnd.twitchtv.v3+json'
}, function(err) {
	//console.info(this);
});
*/


/*
 * initialize services
 */
discord_interface.initialize();
