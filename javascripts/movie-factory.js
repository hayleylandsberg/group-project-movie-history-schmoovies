'use strict';

let $ = require('jquery');
const fbURL = "https://test-9f12e.firebaseio.com";
let firebase = require('./firebaseConfig');
let getApiKey = require('./api-getter')();
// const moviedbSearchURL = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${user_input}`;
let apiKey = getApiKey.api_key;

let actorSearch = (movieId) => {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`
		}).done((dataFromActorSearch)=>{
			// console.log('dataFromActorSearch ajax', dataFromActorSearch.cast);
			let threeActors = dataFromActorSearch.cast.slice(0,3).map(function(castMember){
				return castMember.name;
			});
			// console.log('three actors', threeActors);
			resolve(threeActors);
		}).fail((err)=>{
			console.log('error from actorSearch ajax');
			reject(err);
		});
	});
};

module.exports.newMoviesSearch = (searchString) => {
	// console.log('search string', searchString);
	// console.log('api key', getApiKey.api_key);
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchString}`
		}).done((dataFromMovieSearchApi)=>{
			// console.log('results of movie api search', dataFromMovieSearchApi);
			let moviesIds = dataFromMovieSearchApi.results.map((movie)=>{
				return movie.id;
			});
			// console.log(moviesIds);
			let actorRequests = moviesIds.map((movieId)=>{
				return actorSearch(movieId);
			});
			// console.log('actor requests array', actorRequests);
			Promise.all(actorRequests)
			.then((actorsArrays) => {
				// console.log(actorsArrays);
				dataFromMovieSearchApi.results.forEach((movie, index) => {
					dataFromMovieSearchApi.results[index].actors = actorsArrays[index];
				});
				// console.log('modified search results', dataFromMovieSearchApi);
				resolve(dataFromMovieSearchApi);
			});
			// resolve(dataFromMovieSearchApi);
		}).fail((err) => {
			console.log('error from search api request', err);
			reject(err);
		});
	});

};

module.exports.getOneMovie = (movieId) => {
	return new Promise( (resolve, reject) => {
		let currentUser = firebase.auth().currentUser.uid;
		let apiKey = getApiKey.api_key;
		actorSearch(movieId)
		.then( (actors) => {
			let actorsArray = actors;
		$.ajax({
			url: `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
		}).done( (requestedMovie) => {
			console.log(requestedMovie, "requestedMovie");
			let movieObj = {};
			movieObj.title = requestedMovie.title;
			movieObj.id = requestedMovie.id;
			movieObj.year = requestedMovie.release_date.slice(0,4);
			if(requestedMovie.poster_path === null) {
				// console.log("poster less movie");
				movieObj.poster_path = '../images/default-poster.png';
			}
			else
				movieObj.poster_path = requestedMovie.poster_path;
			movieObj.uid = currentUser;
			movieObj.watched = false;
			movieObj.rating = 0;
			movieObj.actors = actorsArray;
			resolve(movieObj);
		}).fail( (err) => {
				console.log('error from search api request', err);
				reject(err);
			});
		});
	});
};

module.exports.savedMoviesSearch = (searchString) => {
	// songs.json?orderBy="uid"&equalTo="${currentUser}"

};

// module.exports.getUnWatchedMovies = () => {

// };

// module.exports.getWatchedMovides = () => {

// };
