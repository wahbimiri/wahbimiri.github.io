(function () {
  var header = document.querySelector(".site-header");
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );
  var sections = links
    .map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    })
    .filter(Boolean);

  function onScroll() {
    if (header) {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    }
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!("IntersectionObserver" in window) || !sections.length) {
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        var id = "#" + entry.target.id;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-28% 0px -62% 0px", threshold: 0 }
  );

  sections.forEach(function (section) {
    io.observe(section);
  });
})();
