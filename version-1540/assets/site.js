(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-index"));
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var form = document.querySelector("[data-filter-form]");
    var area = document.querySelector("[data-search-area]");
    var empty = document.querySelector("[data-empty-state]");
    if (!area) {
      return;
    }
    var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);

    function apply(values) {
      var q = normalize(values.q);
      var region = normalize(values.region);
      var type = normalize(values.type);
      var year = normalize(values.year);
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-category"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        var pass = true;
        if (q && haystack.indexOf(q) === -1) {
          pass = false;
        }
        if (region && normalize(card.getAttribute("data-region")) !== region) {
          pass = false;
        }
        if (type && normalize(card.getAttribute("data-type")) !== type) {
          pass = false;
        }
        if (year && normalize(card.getAttribute("data-year")) !== year) {
          pass = false;
        }
        card.style.display = pass ? "" : "none";
        if (pass) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", shown === 0);
      }
    }

    if (form) {
      var qInput = form.querySelector("[name='q']");
      if (qInput && params.get("q")) {
        qInput.value = params.get("q");
      }
      apply({
        q: params.get("q") || "",
        region: "",
        type: "",
        year: ""
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply({
          q: form.elements.q ? form.elements.q.value : "",
          region: form.elements.region ? form.elements.region.value : "",
          type: form.elements.type ? form.elements.type.value : "",
          year: form.elements.year ? form.elements.year.value : ""
        });
      });
      form.addEventListener("input", function () {
        apply({
          q: form.elements.q ? form.elements.q.value : "",
          region: form.elements.region ? form.elements.region.value : "",
          type: form.elements.type ? form.elements.type.value : "",
          year: form.elements.year ? form.elements.year.value : ""
        });
      });
    }
  }

  function initLocalSearch() {
    var form = document.querySelector("[data-local-search]");
    var area = document.querySelector("[data-search-area]");
    var empty = document.querySelector("[data-empty-state]");
    if (!form || !area) {
      return;
    }
    var input = form.querySelector("input");
    var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
    function apply() {
      var q = normalize(input.value);
      var shown = 0;
      cards.forEach(function (card) {
        var pass = !q || normalize(card.textContent).indexOf(q) !== -1;
        card.style.display = pass ? "" : "none";
        if (pass) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", shown === 0);
      }
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    input.addEventListener("input", apply);
  }

  function attachStream(video, stream) {
    if (!video || !stream || video.getAttribute("data-ready") === "1") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = stream;
    }
    video.setAttribute("data-ready", "1");
  }

  function initPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play-button]"));
    buttons.forEach(function (button) {
      var video = document.getElementById(button.getAttribute("data-video-id"));
      var stream = button.getAttribute("data-stream");
      if (!video) {
        return;
      }
      function start() {
        attachStream(video, stream);
        button.classList.add("is-hidden");
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
          playRequest.catch(function () {});
        }
      }
      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.getAttribute("data-ready") !== "1") {
          start();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initLocalSearch();
    initPlayers();
  });
})();
