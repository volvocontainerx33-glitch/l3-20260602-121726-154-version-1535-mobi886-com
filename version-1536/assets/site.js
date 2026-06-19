(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-arrow.prev');
    var next = hero.querySelector('.hero-arrow.next');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function start() {
      timer = window.setInterval(nextSlide, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        nextSlide();
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    showSlide(0);
    start();
  }

  var filterInput = document.querySelector('.page-filter');
  var yearSelect = document.querySelector('.year-filter');
  var list = document.querySelector('[data-filter-list]');
  var empty = document.querySelector('.empty-message');

  if (filterInput && list) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query) {
      filterInput.value = query;
    }

    function applyFilter() {
      var words = filterInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var year = yearSelect ? yearSelect.value : '';
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchesWords = words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matches = matchesWords && matchesYear;

        card.hidden = !matches;

        if (matches) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    filterInput.addEventListener('input', applyFilter);

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  }
})();
