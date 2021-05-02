var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');

var path = require('path');
///////////////////

var axios = require('axios');
const cheerio = require('cheerio');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

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
	scrapeAndFilter (major);
	sleep(1000);
	var found_jobs = [];
	const jobs=[];
	fs.createReadStream('details.csv')
			.pipe(csv())
			.on('data', (row) => {
				jobs.push(row);
			})
			.on('end', () => {

				jobs.forEach(element => {
					var requirements = element['Anforderungsprofil'];
					if (requirements != undefined && requirements.includes(major)) {
						found_jobs.push({
							link: element['link'],
							title: element['title']
						});
					}
				});
				console.log(found_jobs);
				response.send(found_jobs);
				return;
			});
});

app.listen(process.env.PORT || 5000);

const csvWriter2=createCsvWriter({
	path: 'details.csv',
	header:[
		{id: 'type', title: 'type'},
		{id: 'title',title: 'title'},
		{id: 'link',title: 'link'},
		{id: 'Anforderungsprofil', title: 'Anforderungsprofil'},
		{id:'Beschreibung',title:'Beschreibung'},
		{id: 'frist', title: 'frist'}
	]
});

function scrapeAndFilter (major){
    for (page = 0; page<=3; page++ ){
        const url = 'https://www.stellenwerk-darmstadt.de/jobboerse?keywords=&offer_type=All&job_category=All&employment_type=All&page='+page;
        (function (url){
            // console.log(page);
            return axios.get(url)
            .then(response=>{
                let getData = (html) => {
                    link=[];
                    const $ = cheerio.load(html);
                    $('.SearchListItem-titleWrapper > a').each((i,elem)=>{
                        link.push($(elem).attr('href'));
                    });
                    return link;
                }
                return getData(response.data);
                // csvWriter.writeRecords(link).catch(()=>console.log('error writing csv'));
            })
            .catch(error => {
                console.log(error);
            });
        })(url).then(data => {
            data.forEach(element =>{
                    const url = 'https://www.stellenwerk-darmstadt.de'+element;
                    axios.get(url)
                    .then(response=>{
                        data=[];
    
                        let getData = html => {
                            const $ = cheerio.load(html);
                            $('.TwoColumn').each((i, elem)=>{
                                data.push({
                                    type: $(elem).find('.JobHead-additionalInfoItem:nth-child(3)').text(),
                                    title: $(elem).find('.JobHead-title').text(),
                                    link: url,
                                    Anforderungsprofil: $(elem).find('.Title:contains("Anforderungsprofil") ~ div > ul').text(),
                                    Beschreibung: $(elem).find('.Title:contains("Beschreibung") ~ div').text(),
                                    frist: $(elem).find('.JobDescriptionList-term:contains("Bewerbungsfristsende") ~ dd').text()
                                })
                            });
          
                            // console.log(data);
                        };
                        getData(response.data);
                        csvWriter2.writeRecords(data).catch(()=>console.log('error writing csv'));
    
                    })
                    .catch(error => {
                        console.log(error);
                    });
            });
        });
    }

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
