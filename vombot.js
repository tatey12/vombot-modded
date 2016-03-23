// Do NOT include this line if you are using the built js version!

//var exec = require('child-process').exec;
var curl = require('curl');
var http = require('http');
var ws = require('websocket');
var irc = require('tmi.js');
var fs = require('fs');
var url = require('url');

var cr = "\r\n";

// BOT CODE HERE
var creds = require('./token.js');
var options = {
	options: {
		debug: true
	},
	connection: {
		reconnect: true,
		cluster: "aws",
	},
	identity: {
		username: 'vomitbot',
		password: creds.twitch.oauth
	},
	channels: ["#puke7"]
};


// Connect the client to the server..
var client = new irc.client(options);
client.connect();

// handle twitch chat events
client.on('join', function(channel, user) {
	console.log(user + ' has joined' + cr);
	user_join(user);
});
client.on('part', function(channel, user) {
	console.log(user + ' has parted' + cr);
	user_part(user);
});
client.on('hosted', function(channel, user, viewers) {
	console.log(user + ' now hosting with ' + viewer_count + ' viewers'+ cr);
});


curl.get('https://api.twitch.tv/kraken/channels/puke7/follows', {
	HTTPHEADER: 'Accept: application/vnd.twitchtv.v3+json'
}, function(err) {
	console.info(this);
});


// CHAT RESPONSE
client.on('chat', function(channel, user, message, self) {
	var command = message.substr(1);
	var message_array = message.split(' ');
	if (message_array[0] == '!runner') {
		spawn_random_runner();
	}
	if (message_array[0] == '!this') {
		dick_marquee(message_array[1]);
	}
	if (user['message-type'] == 'chat') {
		sock_send(JSON.stringify({
			action: 'chat_add',
			data: {
				message: message,
				user : user,
			},
		}));
	}
});



// SERVER CODE HERE 
var http_specs  = {
	ip: "192.168.1.125",
	port: 3000,
}
http.createServer(function (req, res) {

	var request = url.parse(req.url, true);
	var action = request.pathname;
	//console.log(action);

	if (action.substr(-4) == '.gif') {
		try {	
			var img = fs.readFileSync('html/' + action);
			res.writeHead(200, {'Content-Type': 'image/gif' });
			res.end(img, 'binary');
		}
		catch(e) {
			res.writeHead(500);
			res.end();
		}
	}
	else if (action.substr(-3) == '.js') {
		var img = fs.readFileSync('html/' + action);
		res.writeHead(200, {'Content-Type': 'text/javascript' });
		res.end(img, 'binary');
	}
	else {
		res.writeHead(200, {'Content-Type': 'text/html'});
		fs.readFile('html/running.html', 'utf8', function(err, data) {
			res.end(data);
		});
	}
}).listen(http_specs.port, http_specs.ip);
console.log('Server running at ' + http_specs.ip + ':' + http_specs.port);



// WEBSOCKETS HERE
var conn;
var ws_http = http.createServer(function(request, response) {});
ws_http.listen(1337, function(){});
console.log('websockets ready');
ws_server = new ws.server({	
	httpServer: ws_http
});
ws_server.on('request', function(request) {
	console.log('http bot window reloaded');
	conn = request.accept(null, request.origin).on('message', function(event) {
//		console.log(event);
		var data = JSON.parse(event.utf8Data);
		var runner_count = Object.keys(data.runners).length;
		//console.log(runner_count);
	});
	conn.on('connect', function() {
	});
});

function client_send_init() {
	console.log('client init');
	update_watchers_info();
	spawn_random_runner();
}

function sock_send(data) {
	if (typeof conn != 'object') {
		console.log('load the browser part n00b!');
	}
	else {
		conn.send(data);
	}
}


//  RUNNER HANDLER HERE
var available_runners = [];
function init_runner_data() {
	available_runners = fs.readdirSync('html/sprites/').filter(function(val) {
		return (val.indexOf('-running.gif') != -1);
	});
	console.log(available_runners);
};
init_runner_data();
function spawn_random_runner() {
	var runner_name = available_runners[Math.floor(Math.random() * available_runners.length)];
	runner_name = runner_name.substr(0, runner_name.indexOf('-'));
	console.log(runner_name);
	sock_send(JSON.stringify({
		action: 'spawn_runner',
		data: runner_name,
	}));
}


// WATCHERS HANDLER HERE
var watchers = [];
function user_join(user) {
	watchers.unshift(user);
	update_watchers_info();
}
function user_part(user) {
	watchers.splice(watchers.indexOf(user), 1);
	update_watchers_info();
}
function update_watchers_info() {
	sock_send(JSON.stringify({
		action: 'watchers_update',
		data: {
			count: watchers.length,
			text: watchers.join(' '),
		}
	}));
}


//  DICK MARQUEE
function dick_marquee(dick_size) {
	dick_size = parseInt(dick_size);
	if (!Number.isInteger(dick_size)) dick_size = 6;
	if (dick_size < 2) dick_size = 2;
	if (dick_size > 253) dick_size = 253;
	var dick_out = '8' + Array(dick_size).join('=') + 'D';
	console.log(dick_out);
	sock_send(JSON.stringify({
		action: 'dick_this',
		data: dick_out,
	}));
}
