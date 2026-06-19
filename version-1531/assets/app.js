const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileNav = document.querySelector('[data-mobile-nav]');

function updateHeaderState() {
    if (!header) {
        return;
    }

    const shouldStick = window.scrollY > 20;
    header.classList.toggle('is-scrolled', shouldStick);
}

function setupNavigation() {
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });

    if (!menuButton || !mobileNav || !header) {
        return;
    }

    menuButton.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('is-open');
        header.classList.toggle('menu-open', isOpen);
        menuButton.setAttribute('aria-label', isOpen ? '关闭菜单' : '打开菜单');
    });
}

function normalizeText(value) {
    return (value || '').toString().trim().toLowerCase();
}

function setupSiteSearchForms() {
    document.querySelectorAll('[data-site-search]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            const input = form.querySelector('input[name="q"]');
            const query = input ? input.value.trim() : '';

            if (!query) {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });
}

function setupFilters() {
    const panel = document.querySelector('[data-filter-panel]');
    const grid = document.querySelector('[data-filter-grid]');

    if (!panel || !grid) {
        return;
    }

    const searchInput = panel.querySelector('[data-filter-search]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const regionSelect = panel.querySelector('[data-filter-region]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const countNode = panel.querySelector('[data-filter-count]');
    const emptyState = document.querySelector('[data-empty-state]');
    const cards = Array.from(grid.querySelectorAll('.movie-card'));

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery && searchInput) {
        searchInput.value = initialQuery;
    }

    function applyFilters() {
        const query = normalizeText(searchInput ? searchInput.value : '');
        const type = normalizeText(typeSelect ? typeSelect.value : '');
        const region = normalizeText(regionSelect ? regionSelect.value : '');
        const minYear = yearSelect && yearSelect.value ? parseInt(yearSelect.value, 10) : null;
        let visibleCount = 0;

        cards.forEach((card) => {
            const title = normalizeText(card.dataset.title);
            const cardRegion = normalizeText(card.dataset.region);
            const cardType = normalizeText(card.dataset.type);
            const cardYear = parseInt(card.dataset.year || '0', 10);
            const genre = normalizeText(card.dataset.genre);
            const category = normalizeText(card.dataset.category);
            const searchable = [title, cardRegion, cardType, genre, category, card.dataset.year].join(' ');

            const matchesQuery = !query || searchable.includes(query);
            const matchesType = !type || cardType === type;
            const matchesRegion = !region || cardRegion === region;
            const matchesYear = !minYear || cardYear >= minYear;
            const isVisible = matchesQuery && matchesType && matchesRegion && matchesYear;

            card.classList.toggle('is-hidden', !isVisible);

            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (countNode) {
            countNode.textContent = `${visibleCount} 部`;
        }

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    [searchInput, typeSelect, regionSelect, yearSelect].forEach((control) => {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    applyFilters();
}

let hlsLoaderPromise = null;

function loadHlsModule() {
    if (!hlsLoaderPromise) {
        hlsLoaderPromise = import('./hls-dru42stk.js');
    }

    return hlsLoaderPromise;
}

async function startVideo(video, statusNode) {
    const source = video.dataset.videoSrc;

    if (!source) {
        if (statusNode) {
            statusNode.textContent = '未找到播放源';
        }
        return;
    }

    if (statusNode) {
        statusNode.textContent = '正在加载播放器...';
    }

    try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            await video.play();
            if (statusNode) {
                statusNode.textContent = '';
            }
            return;
        }

        const module = await loadHlsModule();
        const Hls = module.H || module.default || window.Hls;

        if (Hls && Hls.isSupported()) {
            if (video._hlsInstance) {
                video._hlsInstance.destroy();
            }

            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            video._hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, async () => {
                try {
                    await video.play();
                    if (statusNode) {
                        statusNode.textContent = '';
                    }
                } catch (error) {
                    if (statusNode) {
                        statusNode.textContent = '点击视频控件继续播放';
                    }
                }
            });
            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data && data.fatal && statusNode) {
                    statusNode.textContent = '播放源加载失败，请刷新后重试';
                }
            });
            return;
        }

        video.src = source;
        await video.play();
        if (statusNode) {
            statusNode.textContent = '';
        }
    } catch (error) {
        if (statusNode) {
            statusNode.textContent = '播放器加载失败，请稍后重试';
        }
    }
}

function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');
        const statusNode = player.querySelector('[data-video-status]');

        if (!video || !button) {
            return;
        }

        button.addEventListener('click', async () => {
            button.classList.add('is-hidden');
            await startVideo(video, statusNode);
        });
    });
}

setupNavigation();
setupSiteSearchForms();
setupFilters();
setupPlayers();
