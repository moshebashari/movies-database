import { allMovieGenres, allTvGenres, moviesDiff, tvDiff, createTrendingMediaBox } from './app.js';
import { createFiltersBox, mediaTypeChoose, createSelectFilter, resetAllFilters, filterMedia, primaryFiltersMode, filtersMode } from './filters.js';
import { closeMenu } from './header.js';
import { searchFavoriteMedia } from './favorites.js';

const API_KEY = '99fabceee87bde49948fceafdc75073b';
const API_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5OWZhYmNlZWU4N2JkZTQ5OTQ4ZmNlYWZkYzc1MDczYiIsIm5iZiI6MTc1NDk5NzQzNS45MjQsInN1YiI6IjY4OWIyMmJiYThjYWU2ZDdhNThlYjQ5YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kqH1yeq_zLXoukiudOGjZZ_gmHc9iUkYreVvqAbSkKA'
const body = document.getElementsByTagName('body')[0];
const containerBox = document.querySelector('.container-box');
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_BEARER_TOKEN}`
  }
};

let urlsObj = { url: "", all: false };

const sortOptions = ['original_title', 'popularity', 'revenue', 'primary_release_date', 'title', 'vote_average', 'vote_count']

async function searchResult(value) {
  const searchValue = encodeURIComponent(value);
  containerBox.replaceChildren();
  //results title
  const resultsTitle = createTitle(``);
  containerBox.appendChild(resultsTitle);
  //filters box
  const filtersBox = createFiltersBox();
  containerBox.appendChild(filtersBox);

  urlsObj.url = `https://api.themoviedb.org/3/search/multi?query=${searchValue}`

  const areResults = await resutlsPages(1);
  if (areResults) {
    resultsTitle.textContent = `Search results for: "${value}"`;
  }
  else if (!areResults) {
    resultsTitle.textContent = `No search results for: "${value}"`;
    document.getElementById('filter-btn').remove()
    filtersBox.remove();
  }
}

async function resutlsPages(num) {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  let pagesBox = document.querySelector('.pages-box');
  if (pagesBox) {
    pagesBox.remove();
  }

  let resultsContainer = document.getElementById(`result-container`);
  if (resultsContainer) {
    resultsContainer.remove();
  }
  resultsContainer = document.createElement('div');
  resultsContainer.id = `result-container`;
  resultsContainer.className = `result-container`;

  const searchInfo = { page: 0, totalPages: 0, results: 0, totalResults: 0 }

  let urls = [];
  urls.push(encodeURI(`${urlsObj.url}&page=${num * 2 - 1}`));
  urls.push(encodeURI(`${urlsObj.url}&page=${num * 2}`));
  for (let url of urls) {
    const response = await fetch(url, options)
      .then(response => response.json())
      .catch(err => console.error(err));
    searchInfo.page = response.page;
    const results = response.results;
    // console.log(results)
    searchInfo.results = results.length;
    searchInfo.totalPages = Math.ceil(response.total_pages / 2);
    searchInfo.totalResults = response.total_results
    if (results.length === 0) {
      return false
    }
    containerBox.appendChild(resultsContainer);
    await createResultsBox(results, resultsContainer);
    if (response.total_pages === 1) {
      break;
    }
  }
  //pages box
  pagesBox = createPagesBox(num, searchInfo.totalPages);
  containerBox.appendChild(pagesBox);

  return true;
}

function createTitle(title) {
  const resultsTitle = document.createElement('h1');
  resultsTitle.className = 'results-title';
  resultsTitle.textContent = title;

  return resultsTitle;
}


function createPagesBox(currentPage, totalPages) {

  const pagesBox = document.createElement('div');
  pagesBox.className = 'pages-box';
  //prev page arrow
  const prevArrow = document.createElement('div');
  prevArrow.id = 'prev-arrow';
  prevArrow.className = 'pages-arrow';
  prevArrow.textContent = '<<';
  pagesBox.appendChild(prevArrow);

  const pageObj = pagesObj(currentPage, totalPages);
  if (pageObj.first !== 0) {
    createPageBtn(pagesBox, pageObj.first, false, true);
  }

  for (let i = pageObj.start; i <= pageObj.end; i++) {
    createPageBtn(pagesBox, i, false, false, i === currentPage);
  }

  if (pageObj.last !== 0) {
    createPageBtn(pagesBox, pageObj.last, true, false);
  }

  //next page arrow
  const nextArrow = document.createElement('div');
  nextArrow.id = 'next-arrow';
  nextArrow.className = 'pages-arrow';
  nextArrow.textContent = '>>';
  pagesBox.appendChild(nextArrow);

  return pagesBox
}

function createPageBtn(pagesBox, num, prevDot, nextDot, curPage = false) {
  if (prevDot === true) {
    const threeDots = createDots();
    pagesBox.appendChild(threeDots);
  }
  const pageBtn = document.createElement('div');
  pageBtn.className = 'page-btn';
  pageBtn.setAttribute('data-type', 'page-btn');
  if (curPage === true) {
    pageBtn.classList.add('current-page-btn');
  }
  pageBtn.textContent = num;
  pagesBox.appendChild(pageBtn);
  if (nextDot === true) {
    const threeDots = createDots();
    pagesBox.appendChild(threeDots);
  }
}

function createDots() {
  const threeDots = document.createElement('span');
  threeDots.className = 'three-dots';
  threeDots.textContent = '...';
  return threeDots;
}

function pagesObj(currentPage, totalPages) {
  const pageObj = { first: 0, start: 0, end: 0, last: 0 };

  if (totalPages <= 5) {
    pageObj.start = 1;
    pageObj.end = totalPages;
  }
  else {
    if (currentPage - 2 >= 1 && currentPage + 2 <= totalPages) {
      pageObj.start = currentPage - 2;
      pageObj.end = currentPage + 2;
    }
    else if (currentPage === 1 || currentPage === 2) {
      pageObj.start = 1;
      pageObj.end = 5;
    }
    else if (currentPage + 2 >= totalPages) {
      pageObj.start = totalPages - 4;
      pageObj.end = totalPages;
    }

    if (pageObj.end < totalPages) {
      pageObj.last = totalPages;
    }
    if (pageObj.start > 1) {
      pageObj.first = 1;
    }
  }

  return pageObj;
}

function nextAndPrevBtn(element) {
  const side = element.id.split('-')[0];
  const currentpage = parseInt(document.querySelector('.current-page-btn').textContent);
  console.log(currentpage)
  const totalPages = parseInt(element.parentElement.lastElementChild.previousElementSibling.textContent);
  let page;
  if (side === 'next') {
    if (currentpage === totalPages) {
      return;
    }
    if (currentpage + 1 === totalPages) {
      element.classList.add('hide-element');
    }
    if (currentpage === 1) {
      document.getElementById('prev-arrow').classList.remove('hide-element');
      console.log(document.getElementById('prev-arrow'))

    }
    page = currentpage + 1;
  }
  else {
    if (currentpage === 1) {
      return;
    }
    if (currentpage - 1 === 1) {
      element.classList.add('hide-element');
    }
    if (currentpage === totalPages) {
      element.parentElement.lastElementChild.classList.remove('hide-element');
    }
    page = currentpage - 1;
  }
  resutlsPages(page);
}

async function createResultsBox(results, resultsContainer, fav = false) {
  for (let result of results) {
    const type = result.media_type ? result.media_type : filtersMode.mediaType;
    if (type !== 'person') {
      const resultBox = await createResultCard(result, type, fav);
      resultsContainer.appendChild(resultBox)
    }
  }
}

async function createResultCard(result, type, fav = false) {
  const resultBox = document.createElement('div');
  resultBox.className = 'result-box';
  const imageBox = document.createElement('div');
  imageBox.className = 'image-box';
  resultBox.appendChild(imageBox);
  //image
  const img = document.createElement('img');
  img.id = `img-${result.id}`;
  let imgBlob;
  if (result.poster_path !== null) {
    img.src = `https://image.tmdb.org/t/p/w300${result.poster_path}`;
  }
  else {
    img.src = `./images/no_image_available.jpg`;
  }
  img.setAttribute('alt', result.title);
  img.className = 'result-img';
  imageBox.appendChild(img);
  //media type
  const mediaType = document.createElement('p');
  mediaType.className = 'media-type';
  mediaType.textContent = type;
  imageBox.appendChild(mediaType);
  //select favorite checkbox 
  if (fav) {
    const selectItemInput = document.createElement('input');
    selectItemInput.setAttribute('type', 'checkbox')
    selectItemInput.className = 'select-item-input';
    selectItemInput.setAttribute('data-type', 'select-item-fav');
    selectItemInput.setAttribute('data-media-detail', `${type}-${result.id}`);
    imageBox.appendChild(selectItemInput);
  }
  // const playBtn1 = document.createElement('i');
  // playBtn1.className = 'play-btn1 bi bi-play-fill';
  // resultBox.appendChild(playBtn1)
  // const playBtn2 = document.createElement('i');
  // playBtn2.id = `playbtn-${result.id}`;
  // playBtn2.className = 'play-btn2 bi bi-play-circle-fill';
  // resultBox.appendChild(playBtn2)
  img.setAttribute('data-type', 'select-media');
  img.setAttribute('data-media-type', type);
  //name
  const resultTitle = document.createElement('p');
  resultTitle.id = `title-${result.id}`;
  resultTitle.className = 'result-title'
  const title = type === 'movie' ? result.title : result.name;
  resultTitle.setAttribute('title', title);
  resultTitle.textContent = title;
  imageBox.appendChild(resultTitle);
  //info box
  const resultInfo = document.createElement('div');
  resultInfo.className = 'result-info';
  //release year
  const releaseYear = document.createElement('p');
  releaseYear.className = 'release-year';
  if (type === 'movie') {
    if (result.release_date !== undefined) {
      releaseYear.textContent = result.release_date.split('-')[0];
    }
  }
  else {
    if (result.first_air_date !== undefined) {
      releaseYear.textContent = result.first_air_date.split('-')[0];
    }
  }
  resultInfo.appendChild(releaseYear);
  //down arrow
  // const downArrow = document.createElement('i');
  // downArrow.className = 'more-detail-down-arrow bi bi-chevron-down';
  // downArrow.setAttribute('data-type', 'more-info');
  // resultInfo.appendChild(downArrow);
  //rate
  const rate = document.createElement('p');
  rate.className = 'rate';
  const star = document.createElement('span');
  star.className = 'rate-star';
  star.innerHTML = '&#9733;';
  rate.appendChild(star)
  const vote_avarge = document.createTextNode(`${result.vote_average}`);
  rate.appendChild(vote_avarge);
  resultInfo.appendChild(rate);
  resultBox.appendChild(resultInfo);
  const moreInfoBox = document.createElement('div');
  moreInfoBox.className = 'more-info-box';
  resultBox.appendChild(moreInfoBox);
  // const overview = document.createElement('p');
  // overview.className = 'more-detail-overview'
  // overview.textContent = result.overview;
  // moreInfoBox.appendChild(overview)
  const genres = document.createElement('p');
  const genresNames = []

  const genresKey = result.genre_ids ? result.genre_ids : result.genres;

  for (let i = 0; i < 3 && i < genresKey.length; i++) {
    const genre = genresKey[i];
    if (genre.name) {
      genresNames.push(genre);
    }
    else {
      let genreObj = allMovieGenres.find(item => item.id === genre);
      if (genreObj === undefined) {
        genreObj = allTvGenres.find(item => item.id === genre);
      }
      genresNames.push({ name: genreObj.name });
    }
  } for (let genre of genresNames) {
    const gen = createGenresOption(genre, '')
    gen.classList.add('more-detail-genres')
    genres.appendChild(gen);
    const space = document.createTextNode(" ");
    const space2 = document.createElement('span');
    space2.textContent = 'aa';
    space2.className = 'space'
    genres.appendChild(space2)
    genres.appendChild(space);
  }
  moreInfoBox.appendChild(genres)
  return resultBox;
}


async function mediaResults(element) {
  const type = element.getAttribute('data-search-type');
  let titleTop;
  if (type === 'movie' || type === 'tv') {
    primaryFiltersMode.mediaType = type;
    primaryFiltersMode.genre = [];
    titleTop = type;
  }
  else if (type === 'genre') {
    let genre = element.textContent;
    if (genre[genre.length - 1] === ',') {
      genre = genre.slice(0, -1);
    }
    primaryFiltersMode.genre = [genre];
    if (moviesDiff.includes(genre)) {
      primaryFiltersMode.mediaType = 'movie';
    }
    else if (tvDiff.includes(genre)) {
      primaryFiltersMode.mediaType = 'tv';
    }
    else {
      const type = element.getAttribute('title').split(' - ')[1];
      if (type === 'movie') {
        primaryFiltersMode.mediaType = 'movie';
      }
      else if (type === 'tv') {
        primaryFiltersMode.mediaType = 'tv';
      }
    }
    titleTop = `${primaryFiltersMode.mediaType} - ${genre}`;
  }

  primaryFiltersMode.fromYear = 0;
  primaryFiltersMode.toYear = 0;

  filterMedia();
  if (document.querySelector('.win-blocker')) {
    closeMenu()
  }

  createBasicResultPage(titleTop, `No results for: "${titleTop}"`);
}

async function createBasicResultPage(titleTop, newTitle) {
  containerBox.replaceChildren();
  const title = createTitle('');
  containerBox.appendChild(title)
  const filtersBox = createFiltersBox();
  containerBox.appendChild(filtersBox);
  const sortMain = document.createElement('div');
  sortMain.className = 'sort-main';
  containerBox.appendChild(sortMain)
  const sortTitle = document.createElement('span');
  sortTitle.className = 'sort-title filter-title';
  sortTitle.textContent = 'sort by';
  sortMain.appendChild(sortTitle)
  const sortBox = createSelectFilter('sort', 'sort-filter');
  sortMain.appendChild(sortBox);
  const sortList = createSortList();
  sortBox.appendChild(sortList)
  const areResults = await resutlsPages(1);
  if (areResults){
    title.textContent = titleTop;
  }
  else if (!areResults) {
    title.textContent = newTitle;
    sortMain.remove()
    filtersBox.remove();
    document.getElementById('filter-btn').remove()
  }
}

async function filterBtnClick() {
  filterMedia();
  const mediaType = document.getElementById('media-type-movie')
  mediaTypeChoose(mediaType, false);
  createBasicResultPage(`Filter results:`, `No filter result:`)
}

function createSortList() {
  const sortList = document.createElement('ul');
  sortList.className = 'filter-list sort-filter-list hide-element';
  for (let option of sortOptions) {
    const text = option.split('_').join(' ');
    const sortOptionDesc = createSortOption(text, 'desc');
    sortList.appendChild(sortOptionDesc);
    const sortOptionAsc = createSortOption(text, 'asc');
    sortList.appendChild(sortOptionAsc);
  }
  return sortList;
}

function createSortOption(option, dir) {
  const op = document.createElement('li');
  op.className = 'fliter-option sort-option';
  op.setAttribute('data-type', 'sort-option');
  op.textContent = `${option}.${dir}`;
  return op;
}

function sortOptionChoose(element) {
  let sortOption = element.textContent;
  const textBtn = element.parentElement.previousElementSibling.children[0];
  textBtn.textContent = sortOption;
  const sortOptionUrl = sortOption.split(' ').join('_');
  urlsObj.url += `&sort_by=${sortOptionUrl}`;
  resutlsPages(1);
}

async function showSelectedMedia(element) {
  const id = element.id.split('-')[1];
  // console.log(id);
  const type = element.getAttribute('data-media-type');
  const response = await fetch(`https://api.themoviedb.org/3/${type}/${id}?append_to_response=credits,external_ids`, options)
    .then(response => response.json())
    .catch(err => console.error(err));

  containerBox.replaceChildren();
  const backgroudImg = document.createElement('div');
  backgroudImg.className = 'background-img';
  if (response.backdrop_path) {
    backgroudImg.style.setProperty('--background-img', `url(https://image.tmdb.org/t/p/w500${response.backdrop_path})`)
  }
  containerBox.appendChild(backgroudImg);
  //main div
  const filmDetails = document.createElement('div');
  filmDetails.className = 'film-details';
  containerBox.appendChild(filmDetails);
  //film image
  const img = document.createElement('img');
  img.className = 'film-image';
  let imgBlob;
  if (response.poster_path) {
    img.src = `https://image.tmdb.org/t/p/w500${response.poster_path}`;
  }
  else {
    img.src = `./images/no_image_available.jpg`;
  }
  img.alt = response.title;
  filmDetails.appendChild(img);
  // film name
  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'all-details';
  const filmName = document.createElement('h1');
  filmName.className = 'film-name'
  filmName.textContent = type === 'movie' ? response.title : response.name;
  detailsDiv.appendChild(filmName);
  // opening crawl
  const overview = document.createElement('p');
  overview.className = 'opening-crawl';
  overview.textContent = response.overview;
  detailsDiv.appendChild(overview);
  // relaese date
  const release_title = document.createElement('span');
  const released = document.createElement('p');
  released.className = 'details-p';
  release_title.className = 'detail-titles';
  release_title.textContent = 'Released: ';
  released.appendChild(release_title);
  const date = document.createTextNode(`${type === 'movie' ? response.release_date : response.first_air_date}`);
  released.appendChild(date);
  detailsDiv.appendChild(released);
  // runtime
  const runtime_title = document.createElement('span');
  const runtime = document.createElement('p');
  runtime.className = 'details-p';
  runtime_title.className = 'detail-titles';
  runtime_title.textContent = type === 'movie' ? 'Duration: ' : 'Seasons: ';
  runtime.appendChild(runtime_title);
  let duration = ''
  if (type === 'movie') {
    if (response.runtime) {
      const durInt = parseInt(response.runtime);
      const hour = Math.floor(durInt / 60);
      const min = durInt % 60;
      if (hour > 0) {
        duration += `${hour}h `;
      }
      if (min > 0) {
        duration += `${min}m`;
      }
    }
    else {
      duration = 'unknown';
    }
  }
  else {
    duration = response.number_of_seasons;
  }
  const dur = document.createTextNode(`${duration}`);
  runtime.appendChild(dur);
  detailsDiv.appendChild(runtime);
  // genres
  const genres_title = document.createElement('span');
  const genres = document.createElement('p');
  genres.className = 'details-p';
  genres_title.className = 'detail-titles';
  genres_title.textContent = 'Genres: ';
  genres.appendChild(genres_title);
  for (let genre of response.genres) {
    const gen = createGenresOption(genre, ',')
    genres.appendChild(gen);
    const space = document.createTextNode(' ');
    genres.appendChild(space);
  }
  detailsDiv.appendChild(genres);
  // actors
  const actors_title = document.createElement('span');
  const actors = document.createElement('p');
  actors.className = 'details-p';
  actors_title.className = 'detail-titles';
  actors_title.textContent = 'Actors: ';
  actors.appendChild(actors_title);
  const cast = response.credits.cast;
  const len = cast.length > 10 ? 10 : cast.length;
  for (let i = 0; i < len; i++) {
    const act = createActorsOption(cast[i]);
    actors.appendChild(act);
    const space = document.createTextNode(' ');
    actors.appendChild(space);
  }
  detailsDiv.appendChild(actors);
  // rate
  const rate_title = document.createElement('span');
  const rate = document.createElement('p');
  rate.className = 'details-p';
  rate_title.className = 'detail-titles';
  rate_title.textContent = 'Rate: ';
  rate.appendChild(rate_title);
  const vote_average = document.createTextNode(`${response.vote_average}/10 (${response.vote_count})`);
  rate.appendChild(vote_average);
  detailsDiv.appendChild(rate);
  filmDetails.appendChild(detailsDiv)
  // button box
  const btnsBox = document.createElement('div');
  btnsBox.className = 'btns-box-media-detail';
  containerBox.appendChild(btnsBox);
  // add to favoirte button
  const addFavoriteBtn = document.createElement('div');
  addFavoriteBtn.id = 'add-favor-btn';
  addFavoriteBtn.className = 'media-detail-btn';
  addFavoriteBtn.setAttribute('data-media-detail', `${type}-${id}`);
  const star = document.createElement('span');
  star.className = 'rate-star';
  star.innerHTML = '&#9733;';
  addFavoriteBtn.appendChild(star)
  const textBtn = document.createTextNode(` Add to Favorite`);
  addFavoriteBtn.appendChild(textBtn);
  btnsBox.appendChild(addFavoriteBtn);
  // remove from favorite button
  const removeFavoriteBtn = document.createElement('div')
  removeFavoriteBtn.id = 'rm-favor-btn';
  removeFavoriteBtn.className = 'media-detail-btn hide-element';
  removeFavoriteBtn.setAttribute('data-media-detail', `${type}-${id}`);
  removeFavoriteBtn.textContent = 'Remove from Favorites';
  btnsBox.appendChild(removeFavoriteBtn);
  searchFavoriteMedia(addFavoriteBtn);
  // watch online
  const externalIds = response.external_ids;
  if (externalIds && externalIds.imdb_id) {
    const watchOnlineBtn = document.createElement('div');
    watchOnlineBtn.id = 'watch-online-btn';
    watchOnlineBtn.className = 'media-detail-btn';
    watchOnlineBtn.setAttribute('data-imdb-id', externalIds.imdb_id)
    console.log(externalIds.imdb_id);
    watchOnlineBtn.textContent = 'Watch Online';
    btnsBox.appendChild(watchOnlineBtn);
  }
  //similar media box
  const similarBox = await similarMedia(id, type);
  containerBox.appendChild(similarBox);
}

function createGenresOption(genre, sap) {
  let gen = document.createElement('span');
  gen.className = 'detail-list';
  gen.setAttribute('data-type', 'show-media');
  gen.setAttribute('data-search-type', 'genre');
  gen.textContent = `${genre.name}${sap}`;
  return gen;
}

function createActorsOption(actor) {
  let act = document.createElement('span');
  act.className = 'detail-list';
  act.setAttribute('data-type', '');
  act.setAttribute('data-search-type', 'actor');
  act.textContent = `${actor.name},`;
  return act;
}

function similarMedia(id, type) {
  const url = `https://api.themoviedb.org/3/${type}/${id}/similar?`;
  primaryFiltersMode.mediaType = type;
  filterMedia(url);
  const similarBox = createTrendingMediaBox(type, url, 'Similar Media', 'All similar media', 'all-similar');
  return similarBox;
}

function showAllSimilar(element) {
  const name = document.querySelector('.film-name').textContent;
  const type = element.id.split('-')[3];
  containerBox.replaceChildren();
  const title = createTitle(`Similar ${type}s to ${name}:`);
  containerBox.appendChild(title);
  resutlsPages(1);
}

export {
  searchResult, resutlsPages, filterBtnClick, sortOptionChoose, mediaResults, showSelectedMedia,
  createResultsBox, urlsObj, createTitle, resetAllFilters, showAllSimilar, nextAndPrevBtn
}
