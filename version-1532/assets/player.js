(function () {
    function loadPlayer(box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('.player-cover');
        var src = video ? video.getAttribute('data-hls-url') : '';
        var ready = false;
        var hls = null;

        function attach() {
            if (!video || !src || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                ready = true;
            }
        }

        function play() {
            attach();
            if (cover) {
                cover.hidden = true;
            }
            if (video) {
                video.controls = true;
                var started = video.play();
                if (started && typeof started.catch === 'function') {
                    started.catch(function () {
                        if (cover) {
                            cover.hidden = false;
                        }
                    });
                }
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!ready || video.paused) {
                    play();
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(loadPlayer);
    });
})();
