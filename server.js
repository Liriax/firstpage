var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');
const rp = require('request-promise');
const otcsv = require('objects-to-csv');
const cheerio = require('cheerio');

var path = require('path');
///////////////////

const csv = require('csv-parser');

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

app.post('/opt', function (request, response) {
	var major = request.body.major;
	var pages = request.body.pages;

	var jobs=[];
	var found_jobs = [];
	get_all_pages(pages).then(() => {
		console.log('SUCCESSFULLY COMPLETED THE STELLENWERK SCRAPING SAMPLE');
		fs.createReadStream('stellenwerk.csv')
			.pipe(csv())
			.on('data', (row) => {
				jobs.push(row);
			})
			.on('end', () => {

				jobs.forEach(element => {
					var requirements = element['Anforderungsprofil'];
					if (requirements != undefined && requirements.toLowerCase().includes(major.toLowerCase())) {
						found_jobs.push({
							link: element['link'],
							title: element['title']
						});
					}
				});
				// console.log(found_jobs);
				// response.send(found_jobs);

				var fileName = __dirname + '/public' + '/result.html';
				var stream = fs.createWriteStream(fileName);

				stream.once('open', function(fd) {
				var html = buildHtml();

				stream.end(html);
				});
				
				function buildHtml() {
					var header = '<link rel="stylesheet" href="result.css">';
					var body = '<table>';
				  
					for (var i = 0; i < found_jobs.length; i++) {
						var tr = "<tr>";
						
						/* Must not forget the $ sign */
						tr += "<td>" + i + "</td>" + "<td><a href=" + found_jobs[i]['link'].toString() + ">"+found_jobs[i]['title'].toString()+"</a>" + "</td></tr>";
	
						/* We add the table row to the table body */
						body += tr;
					}
					body += '</table>'
				  
					return '<!DOCTYPE html>'
						 + '<html><head>' + header + '</head><body>' + body + '</body></html>';
				  }


				response.redirect('/result.html');
				response.end();
			});
	});

	
});

app.listen(process.env.PORT || 5000);



const baseURL = 'https://www.stellenwerk-darmstadt.de';
const searchURL = '/jobboerse?keywords=&offer_type=All&job_category=All&employment_type=All&page=';

const getJobs = async (page) => {
    const html = await rp(baseURL + searchURL+page);
    const $ = cheerio.load(html);
    const businessMap = $('.SearchListItem-titleWrapper > a').map(async (i, e) => {
      const link = baseURL + $(e).attr('href');
      const innerHtml = await rp(link);
      const $_inner = cheerio.load(innerHtml);                         
      const Anforderungsprofil = $_inner('.Title:contains("Anforderungsprofil") ~ div > ul').text();
      const type = $_inner('.JobHead-additionalInfoItem:nth-child(3)').text();
      const title = $_inner('.JobHead-title').text();
      const Beschreibung = $_inner('.Title:contains("Beschreibung") ~ div').text();
      const frist = $_inner('.JobDescriptionList-term:contains("Bewerbungsfristsende") ~ dd').text();

      return {
        type,
        title,
        link,
        Anforderungsprofil,
        Beschreibung,
        frist
      }
    }).get();
    return Promise.all(businessMap);
};

const get_all_pages = async (page_num) => {
    var all_results=[];
    for (var n=0; n<=page_num; n++){
        await getJobs(n)
        .then(result => {
            all_results = all_results.concat(result);
            //console.log(all_results.length);
        });
    }
    
    const transformed = new otcsv(all_results);
    return transformed.toDisk('./stellenwerk.csv');
};







