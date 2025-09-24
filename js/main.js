const API_KEY = '99fabceee87bde49948fceafdc75073b';
const API_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5OWZhYmNlZWU4N2JkZTQ5OTQ4ZmNlYWZkYzc1MDczYiIsIm5iZiI6MTc1NDk5NzQzNS45MjQsInN1YiI6IjY4OWIyMmJiYThjYWU2ZDdhNThlYjQ5YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kqH1yeq_zLXoukiudOGjZZ_gmHc9iUkYreVvqAbSkKA'
const body = document.getElementsByTagName('body')[0];
const header = document.getElementsByTagName('header')[0];
const headerBox = document.querySelector('.header-box');
// const headerBoxSmallWin = document.querySelector('.header-box-small-win');
const headerGenres = document.querySelector('.header-genres-box');
// const headerGenresSmallWin = document.querySelector('.header-genres-box-small-win');
const main = document.querySelector('.container');
const containerBox = document.querySelector('.container-box');
// const headerMenu = document.querySelector('.header-menu');
// ----------
const headerMenu = document.querySelector('.header-menu');
// ----------
const searchBox = document.querySelector('.search-box');
const searchInput = document.querySelector('.search-input');
const headerTitle = document.getElementById('header-title');
const rightMenuBtn = document.querySelector('.right-menu-btn');
const closeMenuBtn = document.querySelector('.close-menu-small-win');
const windowWidth = document.documentElement.clientWidth;

let headerBoxWidth;
let allMovieGenres;
let allTvGenres;
let allGenres;
let moviesDiff;
let tvDiff;
let searchValue;
let primaryFiltersMode = { mediaType: '', genre: [], fromYear: 0, toYear: 0 };
let filtersMode;
let urlsObj = { url: "", all: false };

const sortOptions = ['original_title', 'popularity', 'revenue', 'primary_release_date', 'title', 'vote_average', 'vote_count']


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
  // onResizeWindow();
}

async function genresList() {
  const headerGenresArr = [headerGenres];
  for (let heGe of headerGenresArr) {
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
      heGe.appendChild(type);
    }
  }
  // for (let genre of allGenres) {
  //   const type = document.createElement('li');
  //   type.className = 'genre-type';
  //   type.textContent = genre;
  //   headerGenres.appendChild(type);
  // }

  // for (let genre of allGenres) {
  //   const type = document.createElement('li');
  //   type.className = 'genre-type';
  //   type.textContent = genre;
  //   headerGenresSmallWin.appendChild(type);
  // }
}

async function searchResult(event) {
  const value = event.target.value;
  event.target.value = '';
  const searchValue = encodeURIComponent(value);

  containerBox.replaceChildren();
  containerBox.setAttribute('data-search-type', 'search');
  //results title
  const resultsTitle = createTitle(`Search results for: "${value}"`);
  containerBox.appendChild(resultsTitle);
  //filters box
  const filtersBox = createFiltersBox();
  containerBox.appendChild(filtersBox);
  mediaTypeChoose(document.getElementById('media-type-movie'));

  urlsObj.url = `https://api.themoviedb.org/3/search/multi?query=${searchValue}`

  const searchInfo = await resutlsPages(1);
  // if (searchInfo.movie.results === 0) {
  //   moviesTabLabel.classList.add('hide-element');
  // }
  // else {
  //   moviesTabLabel.classList.remove('hide-element');
  // }
  // if (searchInfo.tv.results === 0) {
  //   seriesTabLabel.classList.add('hide-element');
  // }
  // else {
  //   seriesTabLabel.classList.remove('hide-element');
  // }

}

async function moviesResults() {
  containerBox.replaceChildren();
  containerBox.setAttribute('data-search-type', 'movie');
  //results title
  const resultsTitle = createTitle(`Movies"`);
  containerBox.appendChild(resultsTitle);
  //filters box
  const filtersBox = createFiltersBox();
  containerBox.appendChild(filtersBox);

}

async function resutlsPages(num) {
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
  // console.log(urlsObj.url)
  // const dataSearchType = containerBox.getAttribute('data-search-type');
  urls.push(encodeURI(`${urlsObj.url}&page=${num * 2 - 1}`));
  urls.push(encodeURI(`${urlsObj.url}&page=${num * 2}`));
  // url = encodeURI(`https://api.themoviedb.org/3/search/${type}?query=${searchValue}&include_adult=false&language=en-US&page=${num}`);
  // const moviesTabInput = document.getElementById('movies-tab');
  // if (moviesTabInput){
  //     moviesTabInput.checked = true;
  // }

  for (let url of urls) {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_BEARER_TOKEN}`
      }
    };
    const response = await fetch(url, options)
      .then(response => response.json())
      .catch(err => console.error(err));
    searchInfo.page = response.page;
    const results = response.results;
    // console.log(results)
    searchInfo.results = results.length;
    searchInfo.totalPages = Math.ceil(response.total_pages / 2);
    searchInfo.totalResults = response.total_results
    // if (containerBox.getAttribute('data-search-type') === 'search'){
    //   const tab = document.getElementById(`${type}-tab`);
    //   if (type === 'movie' && results.length > 0){
    //     tab.checked = true;
    //   }
    //   if (results.length === 0){
    //     tab.checked = false;
    //     tab.nextElementSibling.classList.add('hide-element');
    //     // tab.disable = true;
    //   }
    //   else{
    //     tab.nextElementSibling.classList.remove('hide-element');
    //   }
    // }

    await createResultsBox(results, resultsContainer);
    containerBox.appendChild(resultsContainer);
  }
  //pages box
  pagesBox = createPagesBox(num, searchInfo.totalPages);
  containerBox.appendChild(pagesBox);

  return searchInfo;
}

function createTitle(title) {
  const resultsTitle = document.createElement('h1');
  resultsTitle.className = 'results-title';
  resultsTitle.textContent = title;

  return resultsTitle;
}

function createFiltersBox() {
  const filterBtn = document.createElement('i');
  filterBtn.id = 'filter-btn';
  filterBtn.className = 'bi bi-funnel-fill'
  containerBox.appendChild(filterBtn);
  const filtersBox = document.createElement('div');
  filtersBox.className = 'filters-box hide-element';
  //media type filter
  const mediaType = document.createElement('div');
  mediaType.className = 'filter-option media-type-filter';
  mediaType.setAttribute('data-current-type', '');
  filtersBox.appendChild(mediaType);
  const mediaTypeTitle = document.createElement('p');
  mediaTypeTitle.className = 'filter-title';
  mediaTypeTitle.textContent = 'media type';
  mediaType.appendChild(mediaTypeTitle);
  const mediaTypes = ['movie', 'tv'];
  for (let type of mediaTypes) {
    const typeInput = document.createElement('input');
    typeInput.setAttribute('type', 'radio');
    typeInput.id = `media-type-${type}`;
    typeInput.className = 'media-type-input';
    typeInput.setAttribute('name', 'types');
    typeInput.setAttribute('data-type', 'media-type-option');
    if (type === 'movie') {
      typeInput.setAttribute('checked', '');
    }
    mediaType.appendChild(typeInput);
    const typeLabel = document.createElement('label');
    typeLabel.setAttribute('for', typeInput.id);
    typeLabel.className = 'media-type-label';
    typeLabel.textContent = `${type}`;
    mediaType.appendChild(typeLabel);
  }
  //genre filter
  const genreFilter = createSelectFilter('genre', 'filter-option');
  filtersBox.appendChild(genreFilter);
  const genresList = document.createElement('div');
  genresList.className = 'filter-list genre-filter-list hide-element';
  // const genreOptionAll = createGenreOption('all');
  // genresList.appendChild(genreOptionAll);
  const allGenresNoDuplicate = [...new Set(allGenres)];
  for (let genre of allGenresNoDuplicate) {
    const genreOption = createGenreOption(genre);
    genresList.appendChild(genreOption);
  }
  genreFilter.appendChild(genresList);
  hideDiffGenreOptions(genresList.children, tvDiff);
  //year filter
  const yearFilter = document.createElement('div');
  yearFilter.className = 'filter-option year-filter';
  filtersBox.appendChild(yearFilter);
  const fromBox = createSelectFilter('from', 'year-filter-box');
  yearFilter.appendChild(fromBox);
  const fromYearList = createYearList('from-filter-list', 1874, 2026);
  fromBox.appendChild(fromYearList);
  const toBox = createSelectFilter('to', 'year-filter-box');
  yearFilter.appendChild(toBox);
  const toYearList = createYearList('to-filter-list', 1874, 2026);
  toBox.appendChild(toYearList);
  //fliter excute button
  const filterExBtn = document.createElement('div');
  filterExBtn.id = 'filter-ex-btn';
  filterExBtn.textContent = 'Filter';
  filtersBox.appendChild(filterExBtn);
  return filtersBox;
}

function createYearList(id, start, end) {
  const yearList = document.createElement('ul');
  yearList.className = 'filter-list year-list hide-element';
  yearList.classList.add(id);
  for (let i = start; i <= end; i++) {
    const yearOption = document.createElement('li');
    yearOption.className = 'fliter-option year-option';
    yearOption.setAttribute('data-type', 'year-option');
    yearOption.textContent = i;
    yearList.appendChild(yearOption);
  }
  return yearList;
}

function createSelectFilter(title, className) {
  const filter = document.createElement('div');
  filter.className = className;
  filter.id = `${title}-filter`;
  const fitle = document.createElement('p');
  fitle.className = 'filter-title';
  fitle.textContent = title;
  filter.appendChild(fitle);
  const selectBtn = document.createElement('div');
  selectBtn.className = 'select-btn';
  selectBtn.id = `${title}-filter-btn`;
  selectBtn.setAttribute('data-type', 'select-filter');
  const textBtn = document.createElement('p');
  textBtn.classList = 'text-btn';
  textBtn.setAttribute('data-type', 'select-filter');
  selectBtn.appendChild(textBtn);
  if (title === 'sort'){
    fitle.textContent = '';
    textBtn.textContent = 'popularity.desc'
  }
  const arrowDown = document.createElement('i');
  arrowDown.className = 'arrow-down bi bi-chevron-down';
  arrowDown.setAttribute('data-type', 'select-filter');
  selectBtn.appendChild(arrowDown);
  filter.appendChild(selectBtn);
  return filter;
}

function createGenreOption(genre) {
  const genreOption = document.createElement('div');
  genreOption.className = 'fliter-option genre-option';
  const genreOptionInput = document.createElement('input');
  genreOptionInput.setAttribute('type', 'checkbox');
  genreOptionInput.id = `genre-filter-${genre}`;
  genreOptionInput.className = 'genre-option-input';
  genreOptionInput.setAttribute('data-type', 'genre-option');
  genreOption.appendChild(genreOptionInput);
  const genreOptionLabel = document.createElement('label');
  genreOptionLabel.setAttribute('for', genreOptionInput.id);
  genreOptionLabel.setAttribute('title', ``)
  genreOptionLabel.className = 'genre-option-label';
  // genreOptionLabel.setAttribute('data-type', 'genre-option');
  genreOptionLabel.textContent = genre;
  genreOption.appendChild(genreOptionLabel);
  return genreOption;
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

async function createResultsBox(results, resultsContainer) {
  // const resultsContainer = document.createElement('div');
  // resultsContainer.id = `${type}-result-container`;
  // resultsContainer.className = `result-container`;
  // if (type === 'tv') {
  //   resultsContainer.classList.add('hide-element');
  // }
  for (let result of results) {
    const type = result.media_type ? result.media_type : filtersMode.mediaType;
    if (type !== 'person') {
      const resultBox = await createResultCard(result, type);
      resultsContainer.appendChild(resultBox);
    }
  }

  // return resultsContainer;
}


async function createResultCard(result, type) {
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
    imgBlob = await fetch(`https://image.tmdb.org/t/p/w300${result.poster_path}`).then(result => result.blob());
  }
  else {
    imgBlob = await fetch(`./images/no_image_available.jpg`).then(result => result.blob());
  }
  // imageBox.style.setProperty('--background-image', `url(${URL.createObjectURL(imgBlob)})`)
  img.src = URL.createObjectURL(imgBlob);
  img.setAttribute('alt', result.title);
  img.className = 'result-img';
  imageBox.appendChild(img);
  const playBtn1 = document.createElement('i');
  playBtn1.className = 'play-btn1 bi bi-play-fill';
  imageBox.appendChild(playBtn1)
  const playBtn2 = document.createElement('i');
  playBtn2.className = 'play-btn2 bi bi-play-circle-fill';
  imageBox.appendChild(playBtn2)
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
  //media type
  const mediaType = document.createElement('p');
  mediaType.className = 'media-type';
  mediaType.textContent = type;
  resultInfo.appendChild(mediaType);
  resultBox.appendChild(resultInfo);
  return resultBox;
}

function showResultsByType(type) {
  const moviesContainer = document.getElementById('movie-result-container');
  const seriesContainer = document.getElementById('tv-result-container')
  if (type === 'movie') {
    seriesContainer.classList.add('hide-element');
    moviesContainer.classList.remove('hide-element');
  }
  if (type === 'tv') {
    moviesContainer.classList.add('hide-element');
    seriesContainer.classList.remove('hide-element');
  }
}

function onResizeWindow() {
  const clientWidth = document.documentElement.clientWidth;

  if (clientWidth > 1025) {
    if (document.querySelector('.win-blocker')) {
      closeMenu()
    }
  }

}

// function changeHeader(small) {
//   if (small && isNotSmallWin) {
//   }
//   else if (!small && isNotBigWin) {
//     headerMenu.classList.remove('right-menu');
//     headerMenu.classList.remove('hide-menu');
//     body.classList.remove('disable-scroll');
//     // -------------
//     headerBoxSmallWin.classList.add('hide-element');
//     headerBox.classList.remove('hide-element');
//     // -------------
//     const isMenuOpen = document.querySelector('.win-blocker');
//     if (isMenuOpen) {
//       isMenuOpen.remove()
//       const isListOpen = document.getElementById('header-element-list');
//       if (isListOpen) {
//         isListOpen.classList.remove('header-menu-list-small-win');
//         isListOpen.classList.add('header-menu-list');
//         const listDataBox = isListOpen.querySelector('.list-data-box-small-win');
//         listDataBox.classList.remove('list-data-box-small-win');
//         listDataBox.classList.add('list-data-box');
//         isListOpen.remove();
//         body.removeEventListener('click', elementList);
//       }
//     }
//   }
// }

function showRightMenu() {
  const winBlocker = document.createElement('div');
  winBlocker.className = 'win-blocker';
  winBlocker.setAttribute('data-type', 'close-menu');
  body.classList.add('disable-scroll');
  headerBox.appendChild(winBlocker);
  // -----------
  // headerBoxSmallWin.appendChild(winBlocker);
  // -----------
  headerMenu.classList.add('show-menu');
  headerMenu.classList.remove('hide-menu');
  headerMenu.classList.remove('hide-element');
}

function showGenresBox(element) {
  element.firstElementChild.classList.toggle('hide-element');
  body.addEventListener('click', (e) => closeGenresBox(e));
}

function closeGenresBox(e) {
  if (!e.target.classList.contains('header-genres')) {
    headerGenres.classList.add('hide-element');
    // headerGenresSmallWin.classList.add('hide-element');
    body.removeEventListener('click', closeGenresBox);
  }
}

function closeMenu() {
  const winBlocker = document.querySelector('.win-blocker');
  winBlocker.remove();
  headerMenu.classList.add('hide-menu');
  headerMenu.addEventListener('animationend', removeDisableScroll)
}

function removeDisableScroll() {
  body.classList.remove('disable-scroll')
  headerMenu.removeEventListener('animationend', removeDisableScroll)
  // headerMenu.classList.add('hide-element');
  headerMenu.classList.remove('show-menu');
  headerMenu.classList.remove('hide-menu');
}

function openFiltersBox() {
  const filterBox = document.querySelector('.filters-box');
  filterBox.classList.toggle('hide-element');
}

function openFilterLists(element) {
  const type = element.parentElement.id.split('-')[0];
  document.querySelector(`.${type}-filter-list`).classList.toggle('hide-element');
  body.addEventListener('click', closeFilterList);
}

function closeFilterList(event) {
  const element = event.target;
  const filterLists = document.querySelectorAll('.filter-list');
  if (element.parentElement.parentElement.classList.contains('genre-filter-list')) {
    return;
  }
  if (!element.classList.contains('select-btn') && !element.parentElement.classList.contains('select-btn')) {
    filterLists.forEach((filter) => { filter.classList.add('hide-element') })
    body.removeEventListener('click', closeFilterList)
  }
  else {
    filterLists.forEach((filter) => {
      const type = filter.parentElement.id.split('-')[0];
      if (type !== element.id.split('-')[0] && type !== element.parentElement.id.split('-')[0]) {
        filter.classList.add('hide-element')
      }
    })
  }
}

function genreOptionChoose(element) {
  const genre = element.nextElementSibling.textContent;
  const textBtn = element.parentElement.parentElement.previousElementSibling.children[0];
  let newText = '';
  if (element.checked) {
    newText = textBtn.textContent === '' ? textBtn.textContent + `${genre}` : textBtn.textContent + `,${genre}`;
  }
  else {
    const genreList = textBtn.textContent.split(',');
    const genreIndex = genreList.indexOf(genre);
    genreList.splice(genreIndex, 1);
    newText = genreList.join(',');
  }
  primaryFiltersMode.genre = newText.split(',');
  textBtn.textContent = newText;
  textBtn.setAttribute('title', newText);
}

function yearOptionChoose(element) {
  const elementYear = parseInt(element.textContent);
  if (element.parentElement.classList.contains('from-filter-list')) {
    const toLists = document.querySelector('.to-filter-list');
    toLists.previousElementSibling.children[0].textContent = '';
    const allToYear = toLists.children;
    for (let year of allToYear) {
      if (parseInt(year.textContent) < elementYear) {
        year.classList.add('hide-element');
      }
      else {
        year.classList.remove('hide-element');
      }
    }
    primaryFiltersMode.fromYear = elementYear;
    primaryFiltersMode.toYear = 0;
  }
  else {
    primaryFiltersMode.toYear = elementYear
  }


  const textBtn = element.parentElement.previousElementSibling.children[0];
  textBtn.textContent = elementYear;
}

function mediaTypeChoose(element, check = true) {
  const type = element.id.split('-')[2];
  if (check) {
    const prevType = element.parentElement.getAttribute('data-current-type');
    if (prevType === type) {
      return;
    }
  }
  else {
    element.checked = true;
  }
  const allFilterLists = document.querySelectorAll('.filter-list');
  const fromChildren = allFilterLists[1].children;
  const toChildren = allFilterLists[2].children;
  // allFilterLists[0].previousElementSibling.children[0].textContent = ''
  // allFilterLists[1].previousElementSibling.children[0].textContent = '';
  // allFilterLists[2].previousElementSibling.children[0].textContent = '';
  const genreChildren = allFilterLists[0].children;
  // if (type === 'all') {
  //   primaryFiltersMode.mediaType = 'all';
  //   if (prevType === 'tv') {
  //     showAllYearOptions(fromChildren, toChildren)
  //     showAllGenreOptions(genreChildren, moviesDiff);
  //   }
  //   if (prevType === 'movie') {
  //     showAllGenreOptions(genreChildren, tvDiff);
  //   }
  // }
  if (type === 'movie') {
    primaryFiltersMode.mediaType = 'movie';
    hideDiffGenreOptions(genreChildren, tvDiff);
    showAllYearOptions(fromChildren, toChildren)
  }
  else if (type === 'tv') {
    primaryFiltersMode.mediaType = 'tv';
    hideDiffGenreOptions(genreChildren, moviesDiff);

    for (let i = 0; i < fromChildren.length; i++) {
      if (parseInt(fromChildren[i].textContent) < 1949) {
        fromChildren[i].classList.add('hide-element');
        toChildren[i].classList.add('hide-element');
      }
      else {
        toChildren[i].classList.remove('hide-element');
      }
    }
  }
  resetAllFilters();
  element.parentElement.setAttribute('data-current-type', type);
}

function showAllGenreOptions(genreChildren, diff) {
  let i = 0;
  for (let genreOption of genreChildren) {
    if (genreOption.children[1].textContent === diff[i]) {
      genreOption.classList.remove('hide-element');
      i++
    }
  }
}

function showAllYearOptions(fromChildren, toChildren) {
  for (let i = 0; i < fromChildren.length; i++) {
    fromChildren[i].classList.remove('hide-element');
    toChildren[i].classList.remove('hide-element');
  }
}

function hideDiffGenreOptions(genreChildren, diff) {
  let i = 0;
  for (let genreOption of genreChildren) {
    if (genreOption.children[1].textContent === diff[i]) {
      genreOption.classList.add('hide-element');
      i++;
    }
    else {
      genreOption.classList.remove('hide-element');
    }
  }
}

function resetAllFilters() {
  primaryFiltersMode.fromYear = 0;
  primaryFiltersMode.toYear = 0;
  primaryFiltersMode.genre = [];
  const allTextBtn = document.querySelectorAll('.text-btn');
  allTextBtn.forEach(btn => btn.textContent = '');
  const genreList = document.querySelector('.genre-filter-list').children;
  for (let genreOption of genreList) {
    const genreInput = genreOption.firstElementChild;
    if (genreInput.checked) {
      genreInput.checked = false
    }
  }
}

function filterMedia() {
  filtersMode = JSON.parse(JSON.stringify(primaryFiltersMode));
  let fromYear = '';
  let toYear = '';
  let genres = '';
  const type = filtersMode.mediaType;
  const yearFilter = type === 'movie' ? 'primary_release_date' : 'first_air_date';

  if (filtersMode.fromYear !== 0) {
    fromYear = `&${yearFilter}.gte=${filtersMode.fromYear}-01-01`;
  }

  if (filtersMode.toYear !== 0) {
    toYear = `&${yearFilter}.lte=${filtersMode.toYear}-01-01`;
  }

  if (filtersMode.genre.length > 0) {
    const genresId = []
    for (let genre of filtersMode.genre) {
      let genreObj = allMovieGenres.find(item => item.name === genre);
      if (genreObj === undefined) {
        genreObj = allTvGenres.find(item => item.name === genre);
      }
      genresId.push(genreObj.id);
    }
    genres = `&with_genres=${genresId.join(',')}`;
  }

  urlsObj.url = `https://api.themoviedb.org/3/discover/${type}?include_adult=false&with_original_language=en${fromYear}${toYear}${genres}&without_genres=10749`;
  // for (let i = 0; i < mediaType.length; i++) {
  //   // urls.push(encodeURI(`https://api.themoviedb.org/3/discover/${mediaType[i]}?${fromYear}&${toYear}&${genres}&page=${pages[i]}`));
  // }

  // return urls;
}

function mediaResults(element) {
  const type = element.getAttribute('data-search-type');
  let titleTop;
  if (type === 'movie' || type === 'tv') {
    primaryFiltersMode.mediaType = type;
    primaryFiltersMode.genre = [];
    titleTop = type;
  }
  else if (type === 'genre') {
    const genre = element.textContent;
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
    titleTop = `${primaryFiltersMode.mediaType} - ${element.textContent}`;
  }

  primaryFiltersMode.fromYear = 0;
  primaryFiltersMode.toYear = 0;

  filterMedia();
  if (document.querySelector('.win-blocker')) {
    closeMenu()
  }
  containerBox.replaceChildren();
  const title = createTitle(titleTop);
  containerBox.appendChild(title)
  const filtersBox = createFiltersBox();
  containerBox.appendChild(filtersBox);
  const sortBox = createSelectFilter('sort', 'sort-filter');
  containerBox.appendChild(sortBox);
  const sortList = createSortList();
  sortBox.appendChild(sortList)
  resutlsPages(1)
}

function filterBtnClick() {
  filterMedia();
  const mediaType = document.getElementById('media-type-movie')
  mediaTypeChoose(mediaType, false);
  resutlsPages(1);
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

function sortOptionChoose(element){
  let sortOption = element.textContent;
  const textBtn = element.parentElement.previousElementSibling.children[0];
  textBtn.textContent = sortOption;
  const sortOptionUrl = sortOption.split(' ').join('_');
  console.log(sortOptionUrl);
  urlsObj.url += `&sort_by=${sortOptionUrl}`;
  resutlsPages(1);
}

// -----------------------------------------EventLiseners functions----------------------------------------
function allHeaderEventLiteners(event) {
  const element = event.target;
  if (element.classList.contains('header-genres')) {
    showGenresBox(element);
    // closeGenresBox();
  }
  if (element.getAttribute('data-type') === 'right-menu-btn') {
    showRightMenu();
  }
  else if (element.getAttribute('data-type') === 'close-menu') {
    closeMenu();
  }
  else if (element.getAttribute('data-type') === 'header-menu') {
    mediaResults(element);
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
    showResultsByType(element.getAttribute('for').split('-')[0]);
  }

  else if (element.getAttribute('data-type') === 'page-btn' && !element.classList.contains('current-page-btn')) {
    resutlsPages(parseInt(element.textContent));
  }

  else if (element.getAttribute('data-type') === 'select-filter') {
    openFilterLists(element)
  }

  else if (element.id === 'filter-btn') {
    openFiltersBox();
  }

  else if (element.getAttribute('data-type') === 'genre-option') {
    genreOptionChoose(element);
  }
  else if (element.getAttribute('data-type') === 'year-option') {
    yearOptionChoose(element);
  }
  else if (element.getAttribute('data-type') === 'media-type-option') {
    mediaTypeChoose(element);
  }
  else if (element.id === 'filter-ex-btn') {
    filterBtnClick();
  }
  else if (element.getAttribute('data-type') === 'sort-option'){
    sortOptionChoose(element);
  }

}

document.addEventListener('DOMContentLoaded', onStart);
header.addEventListener('click', allHeaderEventLiteners);
header.addEventListener('keydown', allHeaderChangeEventListener);
main.addEventListener('click', allMainEventLisenters)
window.addEventListener('resize', onResizeWindow);
