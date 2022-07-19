'use strict';

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const url = require('url');
const fs = require('fs');
// const path = require('path');

/////////////////// Modules
const apiHandler = require('./modules/apiHandler.js');
const dataHandler = require('./modules/dataHandler');

////////////////// HTML page templates and style sheet

// let homePage = fs.readFileSync(
// 	`${__dirname}/templates/html/other-index.html`,
// 	'utf-8'
// );

// const movieDataTemplate = fs.readFileSync(
// 	`${__dirname}/templates/html/movie-data.html`,
// 	'utf-8'
// );

// const movieListTemplate = fs.readFileSync(
// 	`${__dirname}/templates/html/movie-list.html`,
// 	'utf-8'
// );

// const loginPage = fs.readFileSync(
// 	`${__dirname}/templates/html/login.html`,
// 	'utf-8'
// );

// const css = fs.readFileSync();

const app = express();

////////////////////// Middleware

const sessionSecret = process.env.SESSION_SECRET;

app.use(
	session({
		secret: sessionSecret,
		resave: true,
		saveUninitialized: true,
	})
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(express.static(`${__dirname}/public`));

console.log(`file path: ${__dirname}/public`);

// Verify login status

app.get('/', (req, res) => {
	console.log('welcome to homepage');

	// If user is logged in...
	if (req.session.loggedin) {
		console.log('user logged in');
		// Greet user:
		// homePage = homePage.replace(
		// 	/Welcome to MovieFax!/g,
		// 	`Welcome back, ${req.session.userName}!`
		// );

		res.render('other-index');
	} else {
		console.log('user Not logged in');

		// homePage = homePage.replace(/Welcome to MovieFax!/g, `Not Logged In!`);

		res.render('other-index');
	}
}); // <--- NOT working for some reason...

////////////////////// Searching movies...

app.post('/sample-search', async (req, res) => {
	console.log('app.js receiving query for SAMPLE data');
	const sampleData = new Boolean(true);
	console.log(`app.js: sample data is a ${typeof sampleData} ${sampleData}`);

	// using sample data for now...

	const imdbSearchData = require('json/imdb-search-sample.json');

	const output = await dataHandler.replaceSearchData(
		movieListTemplate,
		imdbSearchData,
		sampleData
	);

	res.send(output);
});

app.post('/query-search', async (req, res) => {
	const query = req.body.query;
	console.log(`app.js: receiving query for movie name ${query}`);
	const sampleData = new Boolean(false);
	console.log(`app.js: sample data is a ${typeof sampleData} ${sampleData}`);

	// imdbResponse comes back from api Handler...
	const imdbResponse = await apiHandler.searchMovieData(query);
	console.log(imdbResponse.results);

	if (imdbResponse.message === 'ERROR' || imdbResponse.results === null) {
		res.send(imdbResponse.errorMessage);
	} else {
		console.log(
			`app.js: received imdbResponse for movie ${imdbResponse.results[0].title}`
		);

		const output = await dataHandler.replaceSearchData(
			movieListTemplate,
			imdbResponse,
			sampleData
		);
		console.log(output[0]);

		res.send(output);
	}
});

///////////////////////// Getting movie details

app.get('/sample-details', (req, res) => {
	console.log('app.js: /sampleDetails accessed!');
	const { query, pathname } = url.parse(req.url, true);
	const imdbID = JSON.stringify(query.id);
	console.log(`imdbID: ${imdbID}`);

	/////// next we should do api calls with imdbID, but we will use sample data for now:
	const imdbTitleData = require('json/imdb-title-sample.json');
	const watchmodeSourcesData = require('json/watchmode-sources-sample.json');

	const fullSampleData = {
		imdbTitleData,
		watchmodeSourcesData,
	};

	const output = dataHandler.replaceDetailData(
		movieDataTemplate,
		fullSampleData
	);

	res.send(output);
});

app.get('/details', async (req, res) => {
	const { query, pathname } = url.parse(req.url, true);
	const imdbID = query.id;
	console.log(`/details: receiving query for imdbID ${imdbID}`);

	// movieDataResponse comes back from api Handler...
	const movieDataResponse = await apiHandler.selectedMovieData(imdbID);

	if (movieDataResponse.message === 'ERROR') {
		res.send(movieDataResponse.errorMessage);
	} else {
		const output = dataHandler.replaceDetailData(
			movieDataTemplate,
			movieDataResponse
		);

		res.send(output);
	}
});

/////////////////// Login module

app.get('/login-form', (req, res) => {
	console.log('app.js: /login-form fired');

	res.send(loginPage);
});

app.post('/login', (req, res) => {
	let userName = req.body.identifier;
	let password = req.body.password;
	console.log(`app.js: /login fired ${userName}, ${password}`);

	res.redirect(homePage);
});

app.post('/register', (req, res) => {
	let newUserName = req.body.newUserName;
	let newEmail = req.body.newEmail;
	let newPassword = req.body.newPassword;
	console.log(
		`app.js: /register ${newUserName}, ${newEmail}, ${newPassword}`
	);

	res.redirect(homePage);
});

module.exports = app;