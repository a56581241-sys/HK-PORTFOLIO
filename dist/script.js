const button = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');

if (button && nav) {
  button.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? '닫기' : '메뉴';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      button.textContent = '메뉴';
      button.focus();
    }
  });
}
