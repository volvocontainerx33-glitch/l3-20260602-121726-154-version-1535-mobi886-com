(function () {
    function setupPlayer() {
        var shell = document.querySelector('[data-player-shell]');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var message = shell.querySelector('[data-player-message]');
        var source = video ? video.getAttribute('data-src') : '';
        var hlsInstance = null;

        function writeMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function attachSource() {
            if (!video || !source) {
                writeMessage('播放源暂不可用');
                return Promise.reject(new Error('missing source'));
            }
            if (video.getAttribute('src')) {
                return Promise.resolve();
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        writeMessage('播放遇到网络或格式错误，请稍后重试');
                    }
                });
                return Promise.resolve();
            }
            writeMessage('当前浏览器不支持 HLS 播放');
            return Promise.reject(new Error('hls unsupported'));
        }

        function play() {
            attachSource().then(function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
                writeMessage('正在加载播放源...');
                return video.play();
            }).then(function () {
                writeMessage('');
            }).catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }

        if (button) {
            button.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', setupPlayer);
}());
