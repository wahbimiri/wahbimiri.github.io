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

(function () {
  var dialog = document.getElementById("shot-viewer");
  if (!dialog) {
    return;
  }

  var stage = dialog.querySelector(".shot-viewer-stage");
  var img = dialog.querySelector(".shot-viewer-img");
  var zoomed = false;
  var dragging = false;
  var startX = 0;
  var startY = 0;
  var startLeft = 0;
  var startTop = 0;

  function fit() {
    zoomed = false;
    dialog.classList.remove("is-zoomed", "is-dragging");
    img.style.width = "";
    img.style.height = "";
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  }

  function zoomTo(factor) {
    var natural = img.naturalWidth || img.getBoundingClientRect().width;
    var fitted = Math.min(natural, Math.min(window.innerWidth * 0.96, 1400));
    var width = Math.round(Math.max(fitted * factor, fitted * 1.35));
    zoomed = true;
    dialog.classList.add("is-zoomed");
    img.style.width = width + "px";
    img.style.height = "auto";
  }

  function toggleZoom() {
    if (zoomed) {
      fit();
    } else {
      zoomTo(2);
    }
  }

  function openFrom(button) {
    var photo = button.querySelector("img");
    if (!photo) {
      return;
    }
    img.src = photo.currentSrc || photo.src;
    img.alt = photo.alt || "";
    fit();
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeViewer() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    fit();
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".shot-open");
    if (!button) {
      return;
    }
    event.preventDefault();
    openFrom(button);
  });

  img.addEventListener("click", function (event) {
    event.stopPropagation();
    if (dragging) {
      return;
    }
    toggleZoom();
  });

  stage.addEventListener(
    "wheel",
    function (event) {
      if (!dialog.open && !dialog.hasAttribute("open")) {
        return;
      }
      event.preventDefault();
      if (event.deltaY < 0) {
        zoomTo(zoomed ? 2.6 : 2);
      } else if (zoomed) {
        fit();
      }
    },
    { passive: false }
  );

  stage.addEventListener("pointerdown", function (event) {
    if (!zoomed) {
      return;
    }
    dragging = false;
    startX = event.clientX;
    startY = event.clientY;
    startLeft = stage.scrollLeft;
    startTop = stage.scrollTop;
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", function (event) {
    if (!stage.hasPointerCapture(event.pointerId) || !zoomed) {
      return;
    }
    var dx = event.clientX - startX;
    var dy = event.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) {
      dragging = true;
      dialog.classList.add("is-dragging");
    }
    if (dragging) {
      stage.scrollLeft = startLeft - dx;
      stage.scrollTop = startTop - dy;
    }
  });

  function endDrag(event) {
    if (stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
    dialog.classList.remove("is-dragging");
    window.setTimeout(function () {
      dragging = false;
    }, 40);
  }

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  dialog.querySelector("[data-zoom-in]").addEventListener("click", function () {
    zoomTo(zoomed ? 2.6 : 2);
  });
  dialog.querySelector("[data-zoom-out]").addEventListener("click", function () {
    fit();
  });
  dialog.querySelector("[data-zoom-fit]").addEventListener("click", fit);
  dialog.querySelector("[data-close]").addEventListener("click", closeViewer);

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      closeViewer();
    }
  });

  dialog.addEventListener("cancel", function () {
    fit();
  });
})();
