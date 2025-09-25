import { allMovieGenres, allTvGenres, allGenres, moviesDiff, tvDiff } from './app.js'
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
let primaryFiltersMode = { mediaType: '', genre: [], fromYear: 0, toYear: 0 };
let filtersMode;
let urlsObj = { url: "", all: false };

const sortOptions = ['original_title', 'popularity', 'revenue', 'primary_release_date', 'title', 'vote_average', 'vote_count']

async function searchResult(value) {
  const searchValue = encodeURIComponent(value);
  containerBox.replaceChildren();
  //results title
  const resultsTitle = createTitle(`Search results for: "${value}"`);
  containerBox.appendChild(resultsTitle);
  //filters box
  const filtersBox = createFiltersBox();
  containerBox.appendChild(filtersBox);

  urlsObj.url = `https://api.themoviedb.org/3/search/multi?query=${searchValue}`

  resutlsPages(1);
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
  if (title === 'sort') {
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
  img.src = URL.createObjectURL(imgBlob);
  img.setAttribute('alt', result.title);
  img.className = 'result-img';
  imageBox.appendChild(img);
  const playBtn1 = document.createElement('i');
  playBtn1.className = 'play-btn1 bi bi-play-fill';
  imageBox.appendChild(playBtn1)
  const playBtn2 = document.createElement('i');
  playBtn2.id = `playbtn-${result.id}`;
  playBtn2.className = 'play-btn2 bi bi-play-circle-fill';
  playBtn2.setAttribute('data-type', 'select-media');
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

function sortOptionChoose(element) {
  let sortOption = element.textContent;
  const textBtn = element.parentElement.previousElementSibling.children[0];
  textBtn.textContent = sortOption;
  const sortOptionUrl = sortOption.split(' ').join('_');
  console.log(sortOptionUrl);
  urlsObj.url += `&sort_by=${sortOptionUrl}`;
  resutlsPages(1);
}

async function showSelectedMedia(element) {
  const id = element.id.split('-')[1];
  console.log(id);
  const response = await fetch(`https://api.themoviedb.org/3/movie/${id}`, options)
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
    imgBlob = await fetch(`https://image.tmdb.org/t/p/w300${response.poster_path}`).then(result => result.blob());
  }
  else {
    imgBlob = await fetch(`./images/no_image_available.jpg`).then(result => result.blob());
  }
  img.src = URL.createObjectURL(imgBlob);
  img.alt = response.title;
  filmDetails.appendChild(img);
  // film name
  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'all-details';
  const filmName = document.createElement('h1');
  filmName.className = 'film-name'
  filmName.textContent = response.title;
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
  const date = document.createTextNode(`${response.release_date}`);
  released.appendChild(date);
  detailsDiv.appendChild(released);
  filmDetails.appendChild(detailsDiv)
}

export {
  searchResult, resutlsPages, openFiltersBox, openFilterLists, genreOptionChoose,
  yearOptionChoose, mediaTypeChoose, filterBtnClick, sortOptionChoose, mediaResults, showSelectedMedia
}
