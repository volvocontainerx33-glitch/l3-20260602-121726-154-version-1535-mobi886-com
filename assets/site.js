(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initSearchForms() {
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          return;
        }
        event.preventDefault();
        var action = form.getAttribute('action') || 'search.html';
        window.location.href = action + '?q=' + encodeURIComponent(query);
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalized(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, '');
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-filter-year]');
    var category = document.querySelector('[data-filter-category]');
    var cards = selectAll('[data-filter-card]');
    var count = document.querySelector('[data-result-count]');
    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function matchYear(card, value) {
      if (!value) {
        return true;
      }
      var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
      var selected = parseInt(value, 10);
      if (selected === 2021) {
        return cardYear <= 2021;
      }
      return cardYear === selected;
    }

    function apply() {
      var query = normalized(input ? input.value : '');
      var yearValue = year ? year.value : '';
      var categoryValue = category ? category.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalized([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type'),
          card.getAttribute('data-category')
        ].join(' '));
        var ok = (!query || haystack.indexOf(query) !== -1) &&
          matchYear(card, yearValue) &&
          (!categoryValue || card.getAttribute('data-category') === categoryValue);
        card.classList.toggle('hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visible + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (category) {
      category.addEventListener('change', apply);
    }
    apply();
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var src = player.getAttribute('data-src');
      var hls = null;

      if (!video || !button || !src) {
        return;
      }

      function startPlayback() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }

        player.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      button.addEventListener('click', startPlayback, { once: true });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          player.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
  });
})();
