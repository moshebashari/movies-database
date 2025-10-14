import { urlsObj } from "./main.js";
import { allMovieGenres, allTvGenres, allGenres, moviesDiff, tvDiff } from "./app.js"

const body = document.getElementsByTagName('body')[0];
const containerBox = document.querySelector('.container-box');

let primaryFiltersMode = { mediaType: '', genre: [], fromYear: 0, toYear: 0, minRate: 0 };
let filtersMode;


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
    //minimum rate filter
    const minRateFilter = createRateFilter();
    filtersBox.appendChild(minRateFilter);
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
    const btnsBox = document.createElement('div');
    //fliter excute button
    const filterExBtn = document.createElement('div');
    filterExBtn.className = 'filters-btn';
    filterExBtn.id = 'filter-ex-btn';
    filterExBtn.textContent = 'Apply Filters';
    filtersBox.appendChild(filterExBtn);
    //filter clear button
    const filterCLBtn = document.createElement('div');
    filterCLBtn.className = 'filters-btn';
    filterCLBtn.id = 'filter-cl-btn';
    filterCLBtn.textContent = 'Clear Filters';
    filtersBox.appendChild(filterCLBtn);
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

function createRateFilter() {
    const minRateFilter = document.createElement('div');
    minRateFilter.className = 'filter-option rate-filter';
    const fitle = document.createElement('p');
    fitle.className = 'filter-title';
    fitle.textContent = 'minimum rate';
    minRateFilter.appendChild(fitle);
    const minRateInput = document.createElement('input');
    minRateInput.setAttribute('type', 'range');
    minRateInput.setAttribute('min', '0.0');
    minRateInput.setAttribute('max', '10.0');
    minRateInput.setAttribute('value', '10.0');
    minRateInput.setAttribute('step', '0.01');
    minRateInput.className = 'min-rate-input'
    minRateFilter.appendChild(minRateInput)
    const minRatelbls = document.createElement('div');
    minRatelbls.className = 'min-rate-lbls';
    minRateFilter.appendChild(minRatelbls);
    //min rate
    const minRate = document.createElement('span');
    minRate.className = 'rate-lbl';
    minRate.textContent = '0.0';
    minRatelbls.appendChild(minRate);
    //cuurent value
    const rangeValue = document.createElement('span');
    rangeValue.className = 'rate-lbl range-value';
    minRatelbls.appendChild(rangeValue);
    //max rate
    const maxRate = document.createElement('span');
    maxRate.className = 'rate-lbl';
    maxRate.textContent = '10.0';
    minRatelbls.appendChild(maxRate);
    minRateInput.addEventListener('input', function () {
        rangeValue.textContent = (10 - this.value).toFixed(2)
        const value = parseFloat(this.value)
        value === 0 || value === 10 ? rangeValue.classList.add('hide-element') : rangeValue.classList.remove('hide-element')
    })
    return minRateFilter;
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
    primaryFiltersMode.minRate = 0;
    primaryFiltersMode.genre = [];
    const allTextBtn = document.querySelectorAll('.text-btn');
    allTextBtn.forEach(btn => {
        if (btn.parentElement.id.split('-')[0] !== 'sort'){
            btn.textContent = ''
        }
    });
    const genreList = document.querySelector('.genre-filter-list').children;
    for (let genreOption of genreList) {
        const genreInput = genreOption.firstElementChild;
        if (genreInput.checked) {
            genreInput.checked = false
        }
    }
    document.querySelector('.min-rate-input').value = 10;
    document.querySelector('.range-value').textContent = '0.0'
}

function filterMedia(url) {
    const rateValue = document.querySelector('.min-rate-input');
    if (rateValue) {
        primaryFiltersMode.minRate = (10 - rateValue.value).toFixed(2);
    }
    filtersMode = JSON.parse(JSON.stringify(primaryFiltersMode));
    if (url){
        urlsObj.url = url;
        return;
    }
    let fromYear = '';
    let toYear = '';
    let genres = '';
    let minRate = '';
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
    if (filtersMode.minRate !== 0) {
        minRate = `&vote_average.gte=${filtersMode.minRate}`;
    }

    urlsObj.url = `https://api.themoviedb.org/3/discover/${type}?include_adult=false&with_original_language=en${fromYear}${toYear}${genres}${minRate}&without_genres=10749`;
}

export {
    createFiltersBox, openFiltersBox, openFilterLists, genreOptionChoose, yearOptionChoose, mediaTypeChoose,
    createSelectFilter, resetAllFilters, filterMedia, primaryFiltersMode, filtersMode
}