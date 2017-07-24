'use strict';

let $ = require('jquery');
let firebase = require('./firebaseConfig');

let fbURL = "https://test-9f12e.firebaseio.com";


module.exports.saveInFirebase = (movieObj) => {
	return new Promise( (resolve, reject) => {
		$.ajax({
	      url: `${fbURL}/movies.json`,
	      type: "POST",
	      data: JSON.stringify(movieObj), //stringify converts our object format to string format of JSON
	      dataType: 'json'
	    })
			.done( (movieId) => {
	    	// console.log("movieId",movieId );
	      resolve(movieId);
	    });
	});
};

module.exports.getUserMovies = () => {
	return new Promise( (resolve, reject) => {
		let currentUser = firebase.auth().currentUser.uid;
		$.ajax({
	      url: `${fbURL}/movies.json?orderBy="uid"&equalTo="${currentUser}"`,
	    })
			.done( (movieData) => {
	    	// console.log("movieData",movieData );
	      resolve(movieData);
	    });
	});
};

// start of method to update an movie rating TODO: needs testing
module.exports.modifyRating = (ratingObj, movieFBkey) => {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `${fbURL}/movies/${movieFBkey}.json`,
			type: "PATCH",
			data: JSON.stringify(ratingObj), //stringify converts our object format to string format of JSON
			dataType: 'json'
		}).done((updatedData)=>{
			console.log('the movie rating was updated',updatedData);
			resolve(updatedData);
		}).fail((err)=>{
			console.log('the movies was not updated', err);
			reject(err);
		});
	});
};