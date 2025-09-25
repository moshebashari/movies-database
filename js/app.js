import * as allMainFunc from './main.js';
import * as allHeaderFunc from './header.js';
const API_KEY = '99fabceee87bde49948fceafdc75073b';
const API_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5OWZhYmNlZWU4N2JkZTQ5OTQ4ZmNlYWZkYzc1MDczYiIsIm5iZiI6MTc1NDk5NzQzNS45MjQsInN1YiI6IjY4OWIyMmJiYThjYWU2ZDdhNThlYjQ5YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kqH1yeq_zLXoukiudOGjZZ_gmHc9iUkYreVvqAbSkKA'
const header = document.getElementsByTagName('header')[0];
const headerGenres = document.querySelector('.header-genres-box');
const main = document.querySelector('.container');

let allMovieGenres;
let allTvGenres;
let allGenres;
let moviesDiff;
let tvDiff;

async function onStart() {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${API_BEARER_TOKEN}`
        }
    };

    allMovieGenres = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=en', options)
        .then(res => res.json()).then(data => data.genres)
        .catch(err => console.error(err));
    allTvGenres = await fetch('https://api.themoviedb.org/3/genre/tv/list?language=en', options)
        .then(res => res.json()).then(data => data.genres)
        .catch(err => console.error(err));
    allGenres = [...allMovieGenres.map(genre => genre.name), ...allTvGenres.map(genre => genre.name)].sort();
    moviesDiff = allMovieGenres.filter(obj1 => !allTvGenres.some(obj2 => obj1.id === obj2.id)).map(({ name }) => name);
    tvDiff = allTvGenres.filter(obj1 => !allMovieGenres.some(obj2 => obj1.id === obj2.id)).map(({ name }) => name);
    genresList();
}

async function genresList() {
    for (let i = 0; i < allGenres.length; i++) {
        const type = document.createElement('li');
        type.className = 'genre-type';
        type.setAttribute('data-search-type', 'genre')
        type.setAttribute('data-type', 'header-menu');
        const genre = allGenres[i];
        if (genre === allGenres[i + 1]) {
            type.setAttribute('title', `${genre} - movie`);
        }
        else if (genre === allGenres[i - 1]) {
            type.setAttribute('title', `${genre} - tv`);
        }
        else {
            type.setAttribute('title', genre);
        }
        type.textContent = genre;
        headerGenres.appendChild(type);
    }
}


async function searchResult(event) {
    const value = event.target.value;
    event.target.value = '';
    allMainFunc.searchResult(value);
}



// -----------------------------------------EventLiseners functions----------------------------------------
function allHeaderEventLiteners(event) {
    const element = event.target;
    if (element.classList.contains('header-genres')) {
        allHeaderFunc.showGenresBox(element);
    }
    else if (element.getAttribute('data-type') === 'right-menu-btn') {
        allHeaderFunc.showRightMenu();
    }
    else if (element.getAttribute('data-type') === 'close-menu') {
        allHeaderFunc.closeMenu();
    }
    if (element.getAttribute('data-type') === 'header-menu') {
        allMainFunc.mediaResults(element);
    }
}

function allHeaderChangeEventListener(event) {
    if (event.target.getAttribute('data-type') === 'search-input') {
        if (event.keyCode === 13 || event.key === 'Enter') {
            searchResult(event);
        }
    }
}

function allMainEventLisenters(event) {
    const element = event.target;
    if (element.previousElementSibling && element.previousElementSibling.checked === false) {
        // showResultsByType(element.getAttribute('for').split('-')[0]);
    }

    else if (element.getAttribute('data-type') === 'page-btn' && !element.classList.contains('current-page-btn')) {
        allMainFunc.resutlsPages(parseInt(element.textContent));
    }
    else if (element.id === 'filter-btn') {
        allMainFunc.openFiltersBox();
    }
    else if (element.getAttribute('data-type') === 'select-filter') {
        allMainFunc.openFilterLists(element)
    }
    else if (element.getAttribute('data-type') === 'genre-option') {
        allMainFunc.genreOptionChoose(element);
    }
    else if (element.getAttribute('data-type') === 'year-option') {
        allMainFunc.yearOptionChoose(element);
    }
    else if (element.getAttribute('data-type') === 'media-type-option') {
        allMainFunc.mediaTypeChoose(element);
    }
    else if (element.id === 'filter-ex-btn') {
        allMainFunc.filterBtnClick();
    }
    else if (element.getAttribute('data-type') === 'sort-option') {
        allMainFunc.sortOptionChoose(element);
    }
    else if (element.getAttribute('data-type') === 'select-media'){
        allMainFunc.showSelectedMedia(element);
    }

}

document.addEventListener('DOMContentLoaded', onStart);
header.addEventListener('click', allHeaderEventLiteners);
header.addEventListener('keydown', allHeaderChangeEventListener);
main.addEventListener('click', allMainEventLisenters)
window.addEventListener('resize', allHeaderFunc.onResizeWindow);

export {allMovieGenres, allTvGenres, allGenres, moviesDiff, tvDiff};