// Include dependencies:
var express = require('express');
var fs = require('fs');
var https = require('https');
var querystring = require('querystring');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// Create directories:
if(!fs.existsSync('static')) {
	fs.mkdirSync('static');
}
if(!fs.existsSync('static/timetable')) {
	fs.mkdirSync('static/timetable');
}

function GetTimetable(code, yr, callback, errorCallback) {
	// Remove white spaces from code, make upper case:
	code = code.trim().toUpperCase();

	// We should probably check if said timetable exists first!
	if(fs.existsSync('static/timetable/'+yr+'/'+code+'.json')) {
		// Read the file:
		fs.readFile('static/timetable/'+yr+'/'+code+'.json', function (err, data) {
			if (err) throw err;

			// Call the callback:
			callback(data);
		});

		return true;
	}

	var post_data = querystring.stringify({
		scodes: code,
		year: parseInt(yr),
		sortby: 'act'
	});

	var options = {
		hostname: 'sis.unimelb.edu.au',
		path: '/cgi-bin/subjects.pl',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
		}
	};

	var html_data = '';
	var req = https.request(options, function(res) {
		res.on('data', function(d) {
			html_data+=d;
		});

		res.on('end', function() {
			// for error callback:
			var foundData = false;

			// Process the data:
			var count = html_data.split('<h2>Year:').length - 1;

			// Did we fail:
			if(count <= 0) {
				// No results found:
				if(errorCallback) {
					errorCallback('Failed to find subject!');
					return false;
				}
			}

			var result = new Array();

			// Process results:
			var pos = 0;
			for(var i=0;i<count;i++) {
				pos = html_data.indexOf('<h2>Year:', pos);
				var end = html_data.indexOf('</table>', pos);
				var d = html_data.substr(pos, end-pos);

				// Grab the subject name:
				var a = d.indexOf(code)+code.length+1;
				var name = d.substr(a, d.indexOf('</b>')-a);
				a = name.indexOf(')');

				// Remove bracket:
				if(a != -1) {
					name = name.substr(a+2);
				}

				// Workout which year the data is from:
				var a = d.indexOf(' &nbsp; ')+8;
				var year = d.substr(10, d.indexOf(' &nbsp;')-10);
				var semester = d.substr(a, d.indexOf('</h2>')-a);

				// Chop down the data:
				d = d.substr(d.indexOf('<tr>'), d.length);
				d = d.split('</tr>');

				var data = new Array();

				// Process data:
				for(var j=0;j<d.length-1;j++) {
					// Temp data array:
					var dta = new Array()

					// Split our string:
					var dd = d[j].split('</td>');

					// Process our string:
					for(var k=2;k<dd.length-1;k++) {
						dta.push(dd[k].substr(4));
					}

					// Fix class length:
					dta[4] = parseFloat(dta[4]);

					// Store dta:
					data.push(dta);
				}

				// Push the data on:
				result.push({
					sem:semester,
					data:data
				});

				// Move pos forward:
				pos += 1;
			}

			// Ensure directories exist:
			if(!fs.existsSync('static/timetable/'+year)) {
				fs.mkdirSync('static/timetable/'+year);
			}

			var fin = JSON.stringify({name:name,code:code,year:year,data:result});

			// Store the results:
			fs.writeFile('static/timetable/'+year+'/'+code+'.json', fin, function(err) {
				if(err) {
					console.log(err);
				}
			});

			callback(fin);
		});
	});
	req.write(post_data);
	req.end();

	req.on('error', function(e) {
		console.log(e);

		if(errorCallback) {
			errorCallback('request error');
			return false;
		}
	});
}

// Create the web server:
var app = express();

// Setup static dir
app.use(express.static(__dirname + '/static'));

// Index page:
app.get('/', function (req, res) {
	res.sendfile('static/index.htm');
});

// Grabs a timetable for all the subjects in recordings.htm
function QueryRecordings() {
	var z = String(fs.readFileSync('recordings.htm'));
	z = z.split('\n');
	for(var i=0;i<z.length;i++) {
		var a = z[i].indexOf('">')+2;
		var code = z[i].substr(a, z[i].indexOf(' - ')-a);

		GetTimetable(code, 2013, function(){});
	}
}

// Builds a json list of subjects for auto complete:
function BuildSubjectList() {
	var lst = new Array();
	var taken = {};

	var z = String(fs.readFileSync('recordings.htm'));
	z = z.split('\n');
	for(var i=0;i<z.length;i++) {
		var a = z[i].indexOf('">')+2;
		var dash = z[i].indexOf(' - ')
		var code = z[i].substr(a, dash-a);
		var name = z[i].substr(dash+3, z[i].indexOf('</a>')-dash-3);

		// Check if we already have this subject:
		if(!taken[code]) {
			lst.push(code+' '+name);
		}

		// Stop same subject appearing twice:
		taken[code] = true;
	}

	var fin = JSON.stringify(lst);

	// Store the results:
	fs.writeFile('static/subjects.json', fin, function(err) {
		if(err) {
			console.log(err);
		}
	});
}

// Queries:
app.get('/timetable/:year/:code.json', function (req, res) {
	// Send the timetable:
	GetTimetable(req.params.code, req.params.year, function(data) {
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(data);
		res.end();
	}, function(e){
		var err = new Array('error', e);

		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(JSON.stringify(err));
		res.end();
	});
});

// Start listening:
app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port '+(process.env.PORT || 3000)+', goto http://localhost:'+(process.env.PORT || 3000)+' in your web browser.');
});
