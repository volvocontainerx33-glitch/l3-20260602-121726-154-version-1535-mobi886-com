(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function() {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
          show(index);
        });
      });

      show(0);
      setInterval(function() {
        show(current + 1);
      }, 5600);
    }

    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function(input) {
      var targetSelector = input.getAttribute("data-search-input") || ".movie-card";
      var root = document.querySelector(input.getAttribute("data-search-root") || "body") || document.body;
      var cards = Array.prototype.slice.call(root.querySelectorAll(targetSelector));
      var empty = document.querySelector(input.getAttribute("data-empty-target") || "");

      function apply() {
        var term = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function(card) {
          var haystack = (card.getAttribute("data-title") || card.textContent || "").toLowerCase();
          var matched = !term || haystack.indexOf(term) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", apply);
      apply();
    });
  });

  window.initPlayer = function(sourceUrl) {
    var video = document.querySelector("[data-player]");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-play-button]");
    if (!video || !sourceUrl) {
      return;
    }

    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function() {});
      }
    }

    if (button) {
      button.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", function() {
        start();
      });
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        start();
      }
    });
  };
})();
