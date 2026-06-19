(function () {
  var script = document.currentScript;
  var source = script ? script.getAttribute('data-stream') : '';
  var video = document.getElementById('movieVideo');
  var button = document.querySelector('.video-cover-button');
  var hls = null;
  var ready = false;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      ready = true;
    }
  }

  function startPlayback() {
    attachSource();

    if (button) {
      button.classList.add('hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (button) {
          button.classList.remove('hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
