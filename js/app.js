import * as allMainFunc from './main.js';
import * as allHeaderFunc from './header.js';
const API_KEY = '99fabceee87bde49948fceafdc75073b';
const API_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5OWZhYmNlZWU4N2JkZTQ5OTQ4ZmNlYWZkYzc1MDczYiIsIm5iZiI6MTc1NDk5NzQzNS45MjQsInN1YiI6IjY4OWIyMmJiYThjYWU2ZDdhNThlYjQ5YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kqH1yeq_zLXoukiudOGjZZ_gmHc9iUkYreVvqAbSkKA'
const header = document.getElementsByTagName('header')[0];
const headerGenres = document.querySelector('.header-genres-box');
const main = document.querySelector('.container');
const containerBox = document.querySelector('.container-box');

let allMovieGenres;
let allTvGenres;
let allGenres;
let moviesDiff;
let tvDiff;
let movesTimes = {movie: 0, tv: 0};

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_BEARER_TOKEN}`
    }
};

async function onStart() {
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
    trendingMedia();
}

async function genresList() {
    for (let i = 0; i < allGenres.length; i++) {
        const type = document.createElement('li');
        type.className = 'genre-type';
        type.setAttribute('data-search-type', 'genre')
        type.setAttribute('data-type', 'show-media');
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

async function trendingMedia() {
    const types = ['movie', 'tv'];
    containerBox.replaceChildren();
    for (let type of types) {
        //main box
        const mainBox = document.createElement('div');
        mainBox.className = 'main-box-trending';
        containerBox.appendChild(mainBox);
        //cover left
        const coverLetf = document.createElement('div');
        coverLetf.className = 'cover-result-box cover-result-box-left';
        mainBox.appendChild(coverLetf)
        //cover right
        const coverRight = document.createElement('div');
        coverRight.className = 'cover-result-box cover-result-box-right';
        mainBox.appendChild(coverRight)
        //title
        const title = document.createElement('h2');
        title.className = 'trending-title';
        title.textContent = `${type} - trending`
        mainBox.appendChild(title)
        const url = `https://api.themoviedb.org/3/trending/${type}/week`;
        const response = await fetch(url, options)
            .then(response => response.json())
            .catch(err => console.error(err));
        const results = response.results;
        //main result box
        const mainResultBox = document.createElement('div');
        mainResultBox.id = `result-trending-box-${type}`
        mainResultBox.className = 'main-result-trending-box'
        mainBox.appendChild(mainResultBox);
        //result box
        const resultBox = document.createElement('div');
        resultBox.className = 'result-box-trending';
        //left arrow
        const leftArrow = document.createElement('div');
        leftArrow.className = 'arrow-trending left-arrow-trending';
        leftArrow.setAttribute('data-type', 'move-media')
        const leftArrowIcon = document.createElement('i');
        leftArrowIcon.className = 'arrow-icon bi bi-chevron-left';
        leftArrowIcon.setAttribute('data-type', 'move-media');
        leftArrow.appendChild(leftArrowIcon);
        mainResultBox.appendChild(leftArrow);
        //right arrow
        const rightArrow = document.createElement('div');
        rightArrow.className = 'arrow-trending right-arrow-trending';
        rightArrow.setAttribute('data-type', 'move-media')
        const rightArrowIcon = document.createElement('i');
        rightArrowIcon.className = 'arrow-icon bi bi-chevron-right';
        rightArrowIcon.setAttribute('data-type', 'move-media')
        rightArrow.appendChild(rightArrowIcon);
        mainResultBox.appendChild(rightArrow);

        await allMainFunc.createResultsBox(results, resultBox);
        mainResultBox.appendChild(resultBox);
        //all trending media
        const allTrending = document.createElement('p');
        allTrending.id = `all-trending-btn-${type}`;
        allTrending.className = 'all-trending-btn';
        allTrending.setAttribute('data-type', 'all-trending')
        allTrending.textContent = `All ${type} trending`;
        mainBox.appendChild(allTrending);
    }
}

function moveTrendingMedia(element) {
    let side;
    const parentElement = element.parentElement.classList.contains('main-result-trending-box') ? element.parentElement : element.parentElement.parentElement;
    const type = parentElement.id.split('-')[3];

    if ((element.classList.contains('left-arrow-trending') || element.parentElement.classList.contains('left-arrow-trending'))) {
        side = 'left';
    }
    else{
        side = 'right';
    }

    const windowWidth = window.innerWidth;
    let widthOfOne;
    if (windowWidth < 576) {
        widthOfOne = -2;
    }
    else if (windowWidth < 1025) {
        widthOfOne = -4;
    }
    else {
        widthOfOne = -6;
    }
    if (side === 'left' && movesTimes[type] === 0 || side === 'right' && movesTimes[type] === 20 + widthOfOne) {
        return;
    }
    if (side === 'left') {
        movesTimes[type] -= 1;
    }
    else {
        movesTimes[type] += 1;
    }
    const resultBox = parentElement.lastChild;
    if (resultBox) {
        resultBox.style.transform = `translateX(calc(${movesTimes[type]} * (100% / ${widthOfOne} - 2px))`;
    }
}

function showAllTrendingMedia(element){
    const type = element.id.split('-')[3];
    const url = `https://api.themoviedb.org/3/trending/${type}/week?`;
    allMainFunc.urlsObj.url = url;
    containerBox.replaceChildren();
    const title = allMainFunc.createTitle(`${type} - Trending`);
    containerBox.appendChild(title);
    allMainFunc.resutlsPages(1);
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
    else if (element.classList.contains('header-home')){
        trendingMedia();
    }   
    else if (element.getAttribute('data-type') === 'right-menu-btn') {
        allHeaderFunc.showRightMenu();
    }
    else if (element.getAttribute('data-type') === 'close-menu') {
        allHeaderFunc.closeMenu();
    }
    else if (element.getAttribute('data-type') === 'show-media') {
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
    else if (element.getAttribute('data-type') === 'select-media') {
        allMainFunc.showSelectedMedia(element);
    }
    else if (element.getAttribute('data-type') === 'show-media') {
        allMainFunc.mediaResults(element);
    }
    else if (element.getAttribute('data-type') === 'move-media') {
        moveTrendingMedia(element);
    }
    else if (element.getAttribute('data-type') === 'all-trending'){
        showAllTrendingMedia(element);
    }
}

document.addEventListener('DOMContentLoaded', onStart);
header.addEventListener('click', allHeaderEventLiteners);
header.addEventListener('keydown', allHeaderChangeEventListener);
main.addEventListener('click', allMainEventLisenters)
window.addEventListener('resize', allHeaderFunc.onResizeWindow);

export { allMovieGenres, allTvGenres, allGenres, moviesDiff, tvDiff };