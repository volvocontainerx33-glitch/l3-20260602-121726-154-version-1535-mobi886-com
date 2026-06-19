(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var next = !mobileNav.classList.contains('is-open');
            mobileNav.classList.toggle('is-open', next);
            toggle.setAttribute('aria-expanded', String(next));
        });
    }

    var hero = document.querySelector('.home-hero');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var index = 0;
        var timer = null;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(i);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    filterForms.forEach(function (scope) {
        var input = scope.querySelector('.js-search-input');
        var year = scope.querySelector('.js-year-filter');
        var category = scope.querySelector('.js-category-filter');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));

        function applyFilter() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var c = category ? category.value : '';

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-category') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                var matchText = !q || text.indexOf(q) !== -1;
                var matchYear = !y || card.getAttribute('data-year') === y;
                var matchCategory = !c || card.getAttribute('data-category') === c;
                card.classList.toggle('hidden-by-filter', !(matchText && matchYear && matchCategory));
            });
        }

        [input, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();
