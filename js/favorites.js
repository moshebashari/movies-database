import * as allMainFunc from './main.js';

const API_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5OWZhYmNlZWU4N2JkZTQ5OTQ4ZmNlYWZkYzc1MDczYiIsIm5iZiI6MTc1NDk5NzQzNS45MjQsInN1YiI6IjY4OWIyMmJiYThjYWU2ZDdhNThlYjQ5YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kqH1yeq_zLXoukiudOGjZZ_gmHc9iUkYreVvqAbSkKA'
const containerBox = document.querySelector('.container-box');
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_BEARER_TOKEN}`
    }
};

let shownCount = 0;
let selecedCount = 0;
let favoritesArr;
let isShowAll = false;

async function showAllFavorites() {
    const favorites = localStorage.getItem('favorites');
    containerBox.replaceChildren();
    if (!favorites || favorites === '[]') {
        const title = allMainFunc.createTitle("There is not any favorite media");
        containerBox.appendChild(title);
        return;
    }
    // console.log(favorites);
    favoritesArr = JSON.parse(favorites);
    shownCount = favoritesArr.length;
    const searchBox = document.createElement('div');
    searchBox.className = 'search-box-fav';
    containerBox.appendChild(searchBox);
    const searchIcon = document.createElement('i');
    searchIcon.className = 'bi bi-search search-icon';
    searchBox.appendChild(searchIcon);
    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('placeholder', 'Search in Favorites');
    searchInput.className = 'search-input search-input-fav';
    searchInput.addEventListener('input', searchInFavorite);
    searchBox.appendChild(searchInput);
    const searchResult = document.createElement('ul');
    searchResult.className = 'search-result-fav';
    searchBox.appendChild(searchResult);
    const cancelIcon = document.createElement('i');
    cancelIcon.className = 'bi bi-x-circle search-cancel-icon-fav hide-element';
    cancelIcon.setAttribute('data-type', 'show-all-fav');
    searchBox.appendChild(cancelIcon);
    const headerDiv = document.createElement('div');
    headerDiv.className = 'fav-header-box';
    containerBox.appendChild(headerDiv);
    const selectAllInput = document.createElement('input');
    selectAllInput.setAttribute('type', 'checkbox')
    selectAllInput.className = 'select-all-input';
    selectAllInput.setAttribute('data-type', 'select-all-fav')
    headerDiv.appendChild(selectAllInput);
    const selectItemsLbl = document.createElement('span');
    selectItemsLbl.className = 'selected-items-lbl';
    headerDiv.appendChild(selectItemsLbl);
    const remvoeIcon = document.createElement('i');
    remvoeIcon.className = 'remove-icon bi bi-trash3 hide-element';
    remvoeIcon.setAttribute('data-type', 'remove-item')
    headerDiv.appendChild(remvoeIcon);

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'result-container';
    containerBox.appendChild(resultsContainer)
    const allResults = []
    for (let favor of favoritesArr) {
        const url = `https://api.themoviedb.org/3/${favor.type}/${favor.id}`;
        const response = await fetch(url, options)
            .then(response => response.json())
            .catch(err => console.error(err));
        response.media_type = favor.type;
        allResults.push(response);

    }
    allMainFunc.createResultsBox(allResults, resultsContainer, true);
}

function addToLocalStorage(id, type) {
    const favorites = localStorage.getItem('favorites');
    let favArr;
    if (!favorites) {
        favArr = [];
    }
    else {
        favArr = JSON.parse(favorites);
    }
    favArr.push({ id: id, type: type });
    localStorage.setItem('favorites', JSON.stringify(favArr));
    // console.log(favArr)
}

function removeFromLocalStorage(id, type) {
    const favorites = localStorage.getItem('favorites');
    const favArr = JSON.parse(favorites);

    const idIndex = favArr.findIndex(item => item.id === id && item.type === type);
    if (idIndex !== -1) {
        favArr.splice(idIndex, 1);
        localStorage.setItem('favorites', JSON.stringify(favArr));
    }
    // console.log(favArr);
}

function searchFavoriteMedia(element) {
    const typeId = element.getAttribute('data-media-detail').split('-');
    const favorites = localStorage.getItem('favorites');
    const favArr = JSON.parse(favorites);

    const idIndex = favArr.findIndex(item => item.id === typeId[1] && item.type === typeId[0]);
    if (idIndex !== -1) {
        element.classList.add('hide-element');
        element.nextElementSibling.classList.remove('hide-element');
    }
}

function addFavoriteMedia(element) {
    const typeId = element.getAttribute('data-media-detail').split('-');
    addToLocalStorage(typeId[1], typeId[0]);
    element.classList.add('hide-element');
    element.nextElementSibling.classList.remove('hide-element');
}

function removeFavoriteMedia(element) {
    const typeId = element.getAttribute('data-media-detail').split('-');
    removeFromLocalStorage(typeId[1], typeId[0]);
    element.classList.add('hide-element');
    element.previousElementSibling.classList.remove('hide-element');
}

function selectAllItems(element) {
    let count = 0;
    const allCheckBox = document.querySelectorAll('.select-item-input');
    const status = element.checked;
    for (let checkbox of allCheckBox) {
        if (!checkbox.parentElement.parentElement.classList.contains('hide-element')){
            checkbox.checked = status;
            if (status){
                count++;
            }
            else{
                count--;
            }
        }
    }
    selecedCount = count;
    if (status) {
        selecedCount--;
    }
    else {
        selecedCount = 1;
    }
    selectItem(element)
}

function selectItem(element) {
    const removeIcon = document.querySelector('.remove-icon');
    if (removeIcon) {
        if (element.checked) {
            removeIcon.classList.remove('hide-element')
            selecedCount++;
            if (selecedCount === shownCount) {
                document.querySelector('.select-all-input').checked = true;
            }
        }
        else {
            if (selecedCount === 1) {
                removeIcon.classList.add('hide-element')
            }

            if (selecedCount === shownCount) {
                document.querySelector('.select-all-input').checked = false;
            }
            selecedCount--;

        }

        const selectedLbl = document.querySelector('.selected-items-lbl');
        if (selecedCount !== 0) {
            selectedLbl.textContent = `${selecedCount} items selected`;
        }
        else {
            selectedLbl.textContent = '';
        }
    }
    // console.log(selecedCount)
}

function removeItems() {
    const allCheckBox = document.querySelectorAll('input[type="checkbox"]');
    let selectAllBox;
    for (let checkbox of allCheckBox) {
        const typeId = checkbox.getAttribute('data-media-detail');
        if (typeId && checkbox.checked) {
            const typeIdArr = typeId.split('-');
            checkbox.parentElement.parentElement.remove();
            removeFromLocalStorage(typeIdArr[1], typeIdArr[0]);
            selecedCount -= 1;
        }
        else {
            selectAllBox = checkbox;
        }
    }
    selectAllBox.checked = false;
    selecedCount++;
    selectItem(selectAllBox)
    if (selecedCount === 0) {
        showAllFavorites();
    }
}

function searchInFavorite(event) {
    const searchResult = document.querySelector('.search-result-fav');
    searchResult.replaceChildren();
    const value = event.target.value;
    const alltitles = document.querySelectorAll('.result-title');
    let isResult = false;
    if (value.length >= 3) {
        for (let title of alltitles) {
            if (title.textContent.toLowerCase().includes(value)) {
                const item = document.createElement('li');
                item.className = 'search-result-li-fav';
                item.setAttribute('data-type', 'search-result-fav')
                item.setAttribute('data-value', title.textContent);
                item.setAttribute('data-element-id', title.parentElement.firstElementChild.id);
                item.textContent = title.textContent;
                searchResult.appendChild(item);
                if (!isResult) {
                    isResult = true;
                }
            }
        }

        const searchAll = document.createElement('li');
        searchAll.className = 'search-result-li-fav search-all-fav';
        searchResult.appendChild(searchAll);
        if (isResult) {
            searchAll.setAttribute('data-type', 'search-all-result-fav')
            searchAll.textContent = `All search results for: "${value}"`;
            searchAll.setAttribute('data-value', value);
        }
        else {
            searchAll.textContent = `No search results for: "${value}"`;
        }
    }
    else if (value.length === 0 && isShowAll) {
        showBackAllFavorites(document.querySelector('.search-cancel-icon-fav'));
        isShowAll = false;
    }
}

function searchResult(element){
    const resultBox = document.getElementById(element.getAttribute('data-element-id'));
    allMainFunc.showSelectedMedia(resultBox);
}

function searchAllResult(element) {
    shownCount = 0
    const value = element.getAttribute('data-value').toLowerCase();
    const alltitles = document.querySelectorAll('.result-title');
    for (let title of alltitles) {
        const parentElement = title.parentElement.parentElement;
        if (title.textContent.toLowerCase().includes(value)) {
            shownCount++;
            if (parentElement.classList.contains('hide-element')){
                parentElement.classList.remove('hide-element');
            }
        }
        else if (!title.textContent.toLowerCase().includes(value) && !parentElement.classList.contains('hide-element')) {
            title.parentElement.parentElement.classList.add('hide-element');
            const checkBox = title.previousElementSibling;
            if (checkBox.checked){
                checkBox.checked = false;
                selectItem(checkBox)
            }
        }
    }
    const parentElement = element.parentElement;
    parentElement.replaceChildren();
    document.querySelector('.search-cancel-icon-fav').classList.remove('hide-element');
    isShowAll = true;
}

function showBackAllFavorites(element) {
    const allMedia = document.querySelectorAll('.result-box');
    for (let media of allMedia) {
        if (media.classList.contains('hide-element')) {
            media.classList.remove('hide-element');
        }
    }
    element.classList.add('hide-element');
    element.previousElementSibling.previousElementSibling.value = '';
    shownCount = favoritesArr.length;
    document.querySelector('.select-all-input').checked = false;
}

export {
    showAllFavorites, addFavoriteMedia, removeFavoriteMedia, searchFavoriteMedia, selectAllItems,
    selectItem, removeItems, searchResult, searchAllResult, showBackAllFavorites
}