
import { H as Hls } from './hls-dru42stk.js';

function setStatus(player, message) {
  const status = player.querySelector('[data-player-status]');
  if (status) {
    status.textContent = message;
  }
}

function initializePlayer(player) {
  const video = player.querySelector('video[data-source]');
  const button = player.querySelector('[data-play-button]');

  if (!video || !button) {
    return;
  }

  let initialized = false;
  let hlsInstance = null;

  async function startPlayback() {
    if (!initialized) {
      const source = video.dataset.source;
      setStatus(player, '正在加载 m3u8 播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (_event, data) {
          if (data && data.fatal) {
            setStatus(player, '播放源加载失败，请稍后重试或刷新页面。');
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
            initialized = false;
            player.classList.remove('is-playing');
          }
        });
      } else {
        setStatus(player, '当前浏览器不支持 HLS 播放，请更换新版浏览器。');
        return;
      }

      initialized = true;
    }

    try {
      await video.play();
      player.classList.add('is-playing');
      setStatus(player, '正在播放。');
    } catch (error) {
      setStatus(player, '浏览器阻止了自动播放，请再次点击播放按钮。');
    }
  }

  button.addEventListener('click', startPlayback);
  video.addEventListener('play', function () {
    player.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      player.classList.remove('is-playing');
    }
  });
}

document.querySelectorAll('[data-player]').forEach(initializePlayer);
