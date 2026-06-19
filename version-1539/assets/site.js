(function () {
  const ready = function (callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  };

  ready(function () {
    const toggle = document.querySelector(".mobile-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dots button"));
    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    };

    const start = function () {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restart();
      });
    });

    showSlide(0);
    start();

    const scopes = Array.from(document.querySelectorAll(".filter-scope"));
    scopes.forEach(function (scope) {
      const input = scope.querySelector(".filter-input");
      const year = scope.querySelector(".filter-year");
      const category = scope.querySelector(".filter-category");
      const items = Array.from(scope.querySelectorAll(".movie-card, .rank-row"));

      const matchYear = function (item, value) {
        if (!value) {
          return true;
        }
        const itemYear = Number(item.getAttribute("data-year") || 0);
        if (value === "old") {
          return itemYear < 2000;
        }
        if (value === "2000") {
          return itemYear >= 2000 && itemYear < 2010;
        }
        if (value === "2010") {
          return itemYear >= 2010 && itemYear < 2020;
        }
        return String(itemYear) === value;
      };

      const apply = function () {
        const keyword = input ? input.value.trim().toLowerCase() : "";
        const selectedYear = year ? year.value : "";
        const selectedCategory = category ? category.value : "";
        items.forEach(function (item) {
          const text = item.getAttribute("data-title") || "";
          const itemCategory = item.getAttribute("data-category") || "";
          const visible = (!keyword || text.indexOf(keyword) !== -1) &&
            matchYear(item, selectedYear) &&
            (!selectedCategory || itemCategory === selectedCategory);
          item.classList.toggle("is-hidden", !visible);
        });
      };

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (category) {
        category.addEventListener("change", apply);
      }

      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q && input) {
        input.value = q;
        apply();
      }
    });
  });
})();

function initMoviePlayer(source) {
  const video = document.getElementById("moviePlayer");
  const overlay = document.getElementById("playerOverlay");
  if (!video || !overlay || !source) {
    return;
  }

  let attached = false;
  const attach = function () {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }
    video.src = source;
  };

  const play = function () {
    attach();
    overlay.classList.add("hidden");
    const result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        overlay.classList.remove("hidden");
      });
    }
  };

  overlay.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
}
