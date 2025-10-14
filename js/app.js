import * as allMainFunc from './main.js';
import * as allHeaderFunc from './header.js';
import * as allFavFunc from './favorites.js';
import { openFiltersBox, openFilterLists, genreOptionChoose, yearOptionChoose, mediaTypeChoose, resetAllFilters } from './filters.js';
const API_KEY = '99fabceee87bde49948fceafdc75073b';
const API_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5OWZhYmNlZWU4N2JkZTQ5OTQ4ZmNlYWZkYzc1MDczYiIsIm5iZiI6MTc1NDk5NzQzNS45MjQsInN1YiI6IjY4OWIyMmJiYThjYWU2ZDdhNThlYjQ5YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kqH1yeq_zLXoukiudOGjZZ_gmHc9iUkYreVvqAbSkKA'
const header = document.getElementsByTagName('header')[0];
const headerGenres = document.querySelector('.header-genres-box');
const main = document.querySelector('.container');
const containerBox = document.querySelector('.container-box');
let allMovieGenres;
let allTvGenres;
let allGenres;      //  all genres tv and movies sorted
let moviesDiff;     
let tvDiff;
let movesTimes = { movie: 0, tv: 0 };  // trending box

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
    // create genre list for header
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
        const url = `https://api.themoviedb.org/3/trending/${type}/week`;
        const mainBox = await createTrendingMediaBox(type, url, `${type} - trending`, `All ${type} trending`, 'all-trending');
        containerBox.appendChild(mainBox);
    }
}

async function createTrendingMediaBox(type, url, boxTitle, textBtn, dataType) {
    //main box
    const mainBox = document.createElement('div');
    mainBox.className = 'main-box-trending';
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
    title.textContent = boxTitle;
    mainBox.appendChild(title)
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
    leftArrow.className = 'left-arrow-trending';
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
    allTrending.setAttribute('data-type', dataType)
    allTrending.textContent = textBtn;
    mainBox.appendChild(allTrending);
    return mainBox;
}

function moveTrendingMedia(element) {
    let side;
    const parentElement = element.parentElement.classList.contains('main-result-trending-box') ? element : element.parentElement;
    const type = parentElement.parentElement.id.split('-')[3];

    if ((parentElement.classList.contains('left-arrow-trending'))) {
        side = 'left';
    }
    else {
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

    if (side === 'left' && movesTimes[type] === 0 || side === 'right' && movesTimes[type] === 10 + widthOfOne) {
        return;
    }

    if (side === 'left') {
        movesTimes[type] -= 1;
    }
    else {
        movesTimes[type] += 1;
    }

    if (side === 'left' && movesTimes[type] === 0 || side === 'right' && movesTimes[type] === 10 + widthOfOne) {
        parentElement.classList.remove('arrow-trending')
    }
    else if (side === 'right' && movesTimes[type] === 1) {
        parentElement.previousElementSibling.classList.add('arrow-trending')
    }
    else if (side === 'left' && movesTimes[type] === 10 + widthOfOne - 1) {
        parentElement.nextElementSibling.classList.add('arrow-trending')
    }

    const resultBox = parentElement.parentElement.lastChild;
    if (resultBox) {
        resultBox.style.transform = `translateX(calc(${movesTimes[type]} * (100% / ${widthOfOne / 2} - 4px))`;
    }
}

function showAllTrendingMedia(element) {
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
    else if (element.classList.contains('header-home')) {
        trendingMedia();
    }
    else if (element.classList.contains('header-favorites')) {
        allFavFunc.showAllFavorites();
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
    const dataType = element.getAttribute('data-type');
    if (dataType === 'page-btn' && !element.classList.contains('current-page-btn')) {
        allMainFunc.resutlsPages(parseInt(element.textContent));
    }
    else if (element.id === 'prev-arrow' || element.id === 'next-arrow') {
        allMainFunc.nextAndPrevBtn(element);
    }
    else if (element.id === 'filter-btn') {
        openFiltersBox();
    }
    else if (element.id === 'add-favor-btn') {
        allFavFunc.addFavoriteMedia(element);
    }
    else if (element.id === 'rm-favor-btn') {
        allFavFunc.removeFavoriteMedia(element);
    }
    else if (dataType === 'select-filter') {
        openFilterLists(element)
    }
    else if (dataType === 'genre-option') {
        genreOptionChoose(element);
    }
    else if (dataType === 'year-option') {
        yearOptionChoose(element);
    }
    else if (dataType === 'media-type-option') {
        mediaTypeChoose(element);
    }
    else if (element.id === 'filter-ex-btn') {
        allMainFunc.filterBtnClick();
    }
    else if (element.id === 'filter-cl-btn') {
        resetAllFilters();
    }
    else if (dataType === 'sort-option') {
        allMainFunc.sortOptionChoose(element);
    }
    else if (dataType === 'select-media') {
        allMainFunc.showSelectedMedia(element);
    }
    else if (dataType === 'show-media') {
        allMainFunc.mediaResults(element);
    }
    else if (dataType === 'move-media') {
        moveTrendingMedia(element);
    }
    else if (dataType === 'all-trending') {
        showAllTrendingMedia(element);
    }
    else if (dataType === 'all-similar') {
        allMainFunc.showAllSimilar(element);
    }
    else if (dataType === 'select-all-fav'){
        allFavFunc.selectAllItems(element);
    }
    else if (dataType === 'select-item-fav'){
        allFavFunc.selectItem(element);
    }
    else if (dataType === 'remove-item'){
        allFavFunc.removeItems();
    }
    else if (dataType === 'search-all-result-fav'){
        allFavFunc.searchAllResult(element);
    }
    else if (dataType === 'search-result-fav'){
        allFavFunc.searchResult(element);
    }
    else if (dataType === 'show-all-fav'){
        allFavFunc.showBackAllFavorites(element);
    }
}

document.addEventListener('DOMContentLoaded', onStart);
header.addEventListener('click', allHeaderEventLiteners);
header.addEventListener('keydown', allHeaderChangeEventListener);
main.addEventListener('click', allMainEventLisenters)
window.addEventListener('resize', allHeaderFunc.onResizeWindow);

export { allMovieGenres, allTvGenres, allGenres, moviesDiff, tvDiff, createTrendingMediaBox };