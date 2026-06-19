(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (slides.length <= 1) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(index);
                play();
            });
        });

        play();
    }

    function setupCardFilters() {
        qsa('[data-filter-open]').forEach(function (button) {
            button.addEventListener('click', function () {
                var bar = qs('[data-filter-bar]');
                if (bar) {
                    bar.classList.toggle('is-open');
                }
            });
        });

        qsa('[data-card-grid]').forEach(function (grid) {
            var scope = grid.closest('section') || document;
            var filters = qsa('[data-filter]', scope);
            var search = qs('[data-card-search]', scope);
            var cards = qsa('[data-title]', grid);

            function apply() {
                var query = normalize(search && search.value);
                var values = {};
                filters.forEach(function (filter) {
                    values[filter.getAttribute('data-filter')] = normalize(filter.value);
                });
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year')
                    ].join(' '));
                    var ok = true;
                    if (query && text.indexOf(query) === -1) {
                        ok = false;
                    }
                    Object.keys(values).forEach(function (key) {
                        if (!values[key]) {
                            return;
                        }
                        var attr = normalize(card.getAttribute('data-' + key));
                        if (attr !== values[key]) {
                            ok = false;
                        }
                    });
                    card.classList.toggle('is-filtered-out', !ok);
                });
            }

            filters.forEach(function (filter) {
                filter.addEventListener('change', apply);
            });
            if (search) {
                search.addEventListener('input', apply);
            }
        });
    }

    function setupSearchForms() {
        qsa('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var query = input ? input.value.trim() : '';
                if (!query) {
                    return;
                }
                var prefix = location.pathname.indexOf('/movies/') !== -1 || location.pathname.indexOf('/category/') !== -1 ? '../' : '';
                location.href = prefix + 'search.html?q=' + encodeURIComponent(query);
            });
        });
    }

    function setupSearchPage() {
        var results = qs('[data-search-results]');
        if (!results || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(location.search);
        var query = normalize(params.get('q'));
        var formInput = qs('[data-search-form] input[name="q"]');
        if (formInput && query) {
            formInput.value = params.get('q');
        }
        if (!query) {
            results.innerHTML = '<p class="meta-row">请输入关键词开始搜索。</p>';
            return;
        }
        var hits = window.MOVIE_SEARCH_DATA.filter(function (item) {
            var text = normalize([
                item.title,
                item.year,
                item.region,
                item.type,
                item.category,
                item.genre,
                (item.tags || []).join(' '),
                item.oneLine
            ].join(' '));
            return text.indexOf(query) !== -1;
        }).slice(0, 80);

        if (!hits.length) {
            results.innerHTML = '<p class="meta-row">没有找到匹配内容，请更换关键词。</p>';
            return;
        }

        results.innerHTML = hits.map(function (item) {
            return [
                '<a class="search-hit" href="' + item.url + '">',
                '  <span>',
                '    <strong>' + escapeHtml(item.title) + '</strong>',
                '    <p>' + escapeHtml([item.category, item.region, item.year, item.genre].join(' · ')) + '</p>',
                '  </span>',
                '  <em>查看详情</em>',
                '</a>'
            ].join('\n');
        }).join('\n');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupCardFilters();
        setupSearchForms();
        setupSearchPage();
    });
}());
