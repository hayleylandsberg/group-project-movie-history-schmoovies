'use strict';

let $ = require('jquery');
let db = require('./movie-factory');
let templates = require('./template-builder');
let firebase = require('./firebaseConfig');
let fbFactory = require('./firebase-factory');
let movieViewController = require('./movie-view-controller');

let $container = $('#movieContainer');
let $searchInput = $('#text-search-input');
let $radioNew = $('#new-search-radio');


//Search handler - show all matching saved movies, then api matches
$(document).on('keyup', '#text-search-input', function() {
  let filteredMovies = [];
  // console.log('input event', event);
  if (event.key === 'Enter') {
    $container.empty();
    //grab search string
    let queryString = $('#text-search-input').val();
    $('#text-search-input').val('');
    //get user's movies
    fbFactory.getUserMovies()
      .then((userMovies) => {
        //filter to match search and store in array
        for (var movie in userMovies) {
          if (userMovies[movie].title.toLowerCase().indexOf(queryString) != -1) {
            filteredMovies.push(userMovies[movie]);
          }
        }
        movieViewController.savedFBToMovieCards(filteredMovies);
        return db.newMoviesSearch(queryString);
      })
      //get search results
      .then((newMovies) => {
        console.log("newMovies", newMovies);
        movieViewController.searchDataToMovieCards(newMovies);
        //check DB movie ID for each result, remove from DOM if match
        newMovies.results.forEach((movie) => {
          filteredMovies.forEach((fmovie) => {
            if (movie.id === fmovie.id) {
              console.log("found one");
              $(`#searchedMovie${fmovie.id}`).remove(); //change the template instead
            }
          });
        });
      });
    $('#pageStatus').html('<h2>Movie History</h2>');
  }
});

//Add to unwatched list
$(document).on('click', `.saveMovieLink`, function() {
  let currentUser = firebase.auth().currentUser.uid;
  // console.log(currentUser);
  let movieId = event.target.classList[1]; //get the movie id
  db.getOneMovie(movieId)
    .then((recievedMovieObj) => {
      // console.log("recievedMovieObj",recievedMovieObj);
      fbFactory.saveInFirebase(recievedMovieObj);
      movieViewController.savedFBToMovieCards(recievedMovieObj);

    });
});

//Modify rating NOT FINISHED YET
$(document).on('click', '.rating span', function() {
  // console.log('star was clicked', event.target);
  console.log('the rating is', $(this).data('rate'));
  let ratingObj = {};
  ratingObj.rating = $(this).data('rate');
  console.log('rating object', ratingObj);
  // fbFactory.modifyRating(ratingObj);
});

//FILTERS - TODO - Dry these up.

//change breadcrumb on filter
function appendFilterBreadcrumb(filterName) {
  let breadcrumbString = `<h2>Movie History > <span> ${filterName} </span></h2>`;
  $('#pageStatus').html(breadcrumbString);
}
//show only unsaved/untracked movies
$(document).on('click', '#untracked-btn', function() {
  let allMovieCards = $('.movieCard');
  allMovieCards.each(function() {
    $(this).addClass('isHidden');
    if ($(this).hasClass('searchResult')) {
      $(this).removeClass('isHidden');
    }
  });
  appendFilterBreadcrumb("Untracked");
});

//show only saved/unwatched movies
$(document).on('click', '#unwatched-btn', function() {
  let allMovieCards = $('.movieCard');
  allMovieCards.each(function() {
    $(this).removeClass('isHidden');
    if ($(this).data('rating') != 0) {
      $(this).addClass('isHidden');
    }
    if ($(this).hasClass('searchResult')) {
      $(this).addClass('isHidden');
    }
  });
  appendFilterBreadcrumb("Unwatched");
});

//show only watched movies
$(document).on('click', '#watched-btn', function() {
  let allMovieCards = $('.movieCard');
  allMovieCards.each(function() {
    $(this).removeClass('isHidden');
    if ($(this).data('rating') < 1) {
      $(this).addClass('isHidden');
    }
    if ($(this).hasClass('searchResult')) {
      $(this).addClass('isHidden');
    }
  });
  appendFilterBreadcrumb("Watched");
});

//show only favorite movies
$(document).on('click', '#fav-btn', function() {
  let allMovieCards = $('.movieCard');
  allMovieCards.each(function() {
    $(this).removeClass('isHidden');
    if ($(this).data('rating') < 9) {
      $(this).addClass('isHidden');
    }
    if ($(this).hasClass('searchResult')) {
      $(this).addClass('isHidden');
    }
  });
  appendFilterBreadcrumb("Favorites");
});

$(document).on("click", ".deleteCardBtn", function(movie) {
  console.log("delete");
  let movieId = $(this).data("delete-id");
  console.log("movieId", movieId);
  movieViewController.deleteFromScreen(movieId)
    .then((movie) => {
      console.log("movieDeleted", movie);
    })
    .catch((err) => {
      console.log("Movie could not be deleted", err.statusText);
    });
  event.target.parentNode.parentNode.remove();
});

// $(document).on('click', '.deleteCardBtn', function() {
// 	let movieId = event.target.classList[1].slice(6);

// 	// console.log("id", movieId);
// 	// console.log("movie", $(`.movie${movieId}`));
// 	// $(`.movie${movieId}`).remove();
// });