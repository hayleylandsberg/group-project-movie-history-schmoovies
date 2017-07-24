'use strict';

let $ = require('jquery');

let Handlebars = require('hbsfy/runtime');
Handlebars.registerPartial( "movieInfoPartial", require('../templates/partials/movie-info.hbs') );
let searchCardTemplate = require ('../templates/searchCards.hbs');
let savedCardsTemplate = require('../templates/savedCards.hbs');

let fbFactory = require('./firebase-factory');
let fbURL = "https://test-9f12e.firebaseio.com";

module.exports.searchDataToMovieCards = (data) => {
	let cards = searchCardTemplate({movies: data.results});
	$("#movieContainer").append(cards);
};

module.exports.savedFBToMovieCards = (data) => {
	console.log('user movies from FB', data);
	// console.log("keys on movies", Object.keys(data));
	let moviesToRender = [];
	for(var movie in data) {
		data[movie].fbId = movie;
		moviesToRender.push(data[movie]);
	}
	console.log('movies array that we should render', moviesToRender);
	let cards = savedCardsTemplate({movies: moviesToRender});
	$("#movieContainer").append(cards);
};

module.exports.deleteFromScreen = (movieObjId) => {
	return new Promise( (resolve, reject) => {
		$.ajax({
	      url: `${fbURL}/movies/${movieObjId}.json`,
	      type: "DELETE"
	    }).done( (movieObj) => {
	    	// let movieId = movieObj.id;
	      // $(`#searchedMovie${movieId}`).remove();
	      resolve(movieObj);
	    }).fail( (err) => {
	    	console.log("error", err);
	    });
	});
};

module.exports.showSavedMovies = () => {
	console.log('showSavedMovies fn');
	fbFactory.getUserMovies()
	.then( (userMovieData) => {
		console.log('userMovieData', userMovieData);
		module.exports.savedFBToMovieCards(userMovieData);
	})
	.catch( (error) => {
		console.log('error', error);
	});
};

//Filters - unwatched
//
