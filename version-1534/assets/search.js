
(function () {
  const form = document.querySelector('[data-search-form]');
  const results = document.querySelector('[data-search-results]');
  const summary = document.querySelector('[data-search-summary]');

  if (!form || !results || !summary || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  const input = form.querySelector('input[name="q"]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    return `
      <article class="movie-card">
        <a class="movie-link" href="${escapeHtml(movie.href)}" aria-label="观看 ${escapeHtml(movie.title)}">
          <span class="poster-frame">
            <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
            <span class="poster-shade"></span>
            <span class="play-chip">▶</span>
            <span class="duration-chip">★ ${Number(movie.score).toFixed(1)}</span>
          </span>
          <span class="movie-info">
            <strong>${escapeHtml(movie.title)}</strong>
            <span class="movie-desc">${escapeHtml(movie.summary)}</span>
            <span class="movie-meta">
              <span>${escapeHtml(movie.year)}</span>
              <span>${escapeHtml(movie.region)}</span>
              <span>${escapeHtml(movie.type)}</span>
            </span>
            <span class="movie-foot">
              <span class="score">★ ${Number(movie.score).toFixed(1)}</span>
              <span>${escapeHtml(movie.category)}</span>
            </span>
          </span>
        </a>
      </article>
    `;
  }

  function render(query) {
    const normalized = normalize(query);

    if (!normalized) {
      summary.textContent = '请输入关键词开始搜索。';
      results.innerHTML = '';
      return;
    }

    const matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      const haystack = normalize([
        movie.title,
        movie.summary,
        movie.oneLine,
        movie.genre,
        movie.region,
        movie.type,
        movie.year,
        movie.category,
        (movie.tags || []).join(' ')
      ].join(' '));
      return haystack.includes(normalized);
    }).slice(0, 120);

    summary.textContent = `“${query}” 找到 ${matches.length} 条结果，最多展示 120 条。`;
    results.innerHTML = matches.map(card).join('');
  }

  if (input) {
    input.value = initialQuery;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const query = input ? input.value.trim() : '';
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
    render(query);
  });

  render(initialQuery);
})();
