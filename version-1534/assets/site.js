
(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (toolbar) {
    const page = toolbar.closest('main') || document;
    const cards = Array.from(page.querySelectorAll('[data-movie-card]'));
    const input = toolbar.querySelector('[data-filter-input]');
    const typeSelect = toolbar.querySelector('[data-type-filter]');
    const yearSelect = toolbar.querySelector('[data-year-filter]');
    const reset = toolbar.querySelector('[data-filter-reset]');
    const count = page.querySelector('[data-filter-count]');
    const empty = page.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const keyword = normalize(input && input.value);
      const typeValue = normalize(typeSelect && typeSelect.value);
      const yearValue = normalize(yearSelect && yearSelect.value);
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize(card.dataset.search);
        const type = normalize(card.dataset.type);
        const year = normalize(card.dataset.year);
        const keywordMatch = !keyword || haystack.includes(keyword);
        const typeMatch = !typeValue || type === typeValue;
        const yearMatch = !yearValue || year === yearValue;
        const shouldShow = keywordMatch && typeMatch && yearMatch;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilters();
      });
    }
  });
})();
