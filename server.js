var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');

var path = require('path');
// var connection = mysql.createConnection({
// 	host     : 'localhost',
// 	user     : 'root',
// 	password : 'SQLzy726*',
// 	database : 'nodelogin'
// });
// connection.connect((err) => {
//     if (err) throw err;
//     console.log('Connected!');
//   });


var app = express();

app.use(session({
	secret: 'lirias secret session',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/', function (request, response) {
	response.sendFile(path.join(__dirname + '/public' + '/login.html'));
});



app.post('/auth', function (request, response) {
	var username = request.body.username;
	var password = request.body.password;

	if (username && password) {
		if (username == 'admin' && password == 'admin') {
			request.session.loggedin = true;
			request.session.username = username;
			response.redirect('/home');
		}
		else {
			request.session.loggedin = false;
			response.redirect('/');
		}
		response.end();

		// connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
		// 	if (results.length > 0) {
		// 		request.session.loggedin = true;
		// 		request.session.username = username;
		// 		response.redirect('/home');
		// 	} else {
		// 		response.send('Incorrect Username and/or Password!');
		// 	}			
		// 	response.end();
		// });
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
app.use(function (request, response, next) {
	if (request.session.loggedin){
		next();
	} 
	else {
		console.log('not logged in!');
		response.redirect('/');
	}
  });
app.use(express.static(__dirname + '/public'));

app.get('/home', function (request, response) {
	if (request.session.loggedin) {
		response.redirect('/home.html');
	} else {
		response.redirect('/');
	}
	response.end();
});


app.listen(process.env.PORT || 5000);