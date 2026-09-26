// Shared behavior across every page: the mobile nav toggle.
// Kept dependency-free and defensive about missing elements so this
// script never throws on a page that happens to omit a piece of nav.

(function () {
  var scrollVideos = document.querySelectorAll("video[data-scroll-video]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window) {
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting) {
          if (!reduceMotion) {
            var playback = video.play();
            if (playback && typeof playback.catch === "function") playback.catch(function () {});
          }
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35 });

    scrollVideos.forEach(function (video) { videoObserver.observe(video); });
  }

  var toggle = document.querySelector(".navtoggle");
  var nav = document.getElementById("primary-nav");
  var links = nav ? nav.querySelector(".navlinks") : null;

  if (!toggle || !nav || !links) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    links.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    var isOpen = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  // Close the menu after choosing a link, and on Escape.
  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  // If the viewport grows past the mobile breakpoint while the menu is
  // open, reset state so it doesn't get stuck open behind the desktop nav.
  var mq = window.matchMedia("(min-width: 861px)");
  function handleMqChange(e) {
    if (e.matches) setOpen(false);
  }
  if (mq.addEventListener) mq.addEventListener("change", handleMqChange);
  else if (mq.addListener) mq.addListener(handleMqChange);
})();
