var fs = require('fs');
var http = require('http');
var url = require('url');


module.exports = {

	initialize: function() {
		var http_specs  = {
			ip: "192.168.1.132",
			port: 1337,
		}
		http.createServer(function(req, res) {

			var request = url.parse(req.url, true);
			var action = request.pathname;
			var web_root = 'source/html/';
			console.log(web_root + action);

			try {
				if (action.substr(-4) == '.gif') {
					var file = fs.readFileSync(web_root + action);
					res.writeHead(200, {'Content-Type': 'image/gif' });
					res.end(file, 'binary');
				}
				else if (action.substr(-3) == '.js') {
					var file = fs.readFileSync(web_root + action);
					res.writeHead(200, {'Content-Type': 'text/javascript' });
					res.end(file, 'binary');
				}
				else {
					console.log(action);
					if (action == '/') action = 'index.html';
					res.writeHead(200, {'Content-Type': 'text/html'});
					fs.readFile(web_root + action, 'utf8', function(err, data) {
						res.end(data);
					});
				}
			}
			catch(e) {
				res.writeHEAD(500);
				res.end();
			}
		}).listen(http_specs.port, http_specs.ip);
		console.log('Server running at ' + http_specs.ip + ':' + http_specs.port);
	}

};
