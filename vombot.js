var discord_interface = require('./lib/discord_interface.js');
var markov = require('./lib/markov.js');
// I am not using the microservice
discord_interface.initialize();
markov.initialize('markov_log.txt');
