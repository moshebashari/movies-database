const body = document.getElementsByTagName('body')[0];
const headerBox = document.querySelector('.header-box');
const headerGenres = document.querySelector('.header-genres-box');
const headerMenu = document.querySelector('.header-menu');

function onResizeWindow() {
  const clientWidth = document.documentElement.clientWidth;

  if (clientWidth > 1025) {
    if (document.querySelector('.win-blocker')) {
      closeMenu()
    }
  }
}

function showRightMenu() {
  const winBlocker = document.createElement('div');
  winBlocker.className = 'win-blocker';
  winBlocker.setAttribute('data-type', 'close-menu');
  body.classList.add('disable-scroll');
  headerBox.appendChild(winBlocker);
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
  headerMenu.classList.remove('show-menu');
  headerMenu.classList.remove('hide-menu');
}

export {showGenresBox, showRightMenu, closeMenu, onResizeWindow}