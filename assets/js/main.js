(function () {
  // Tema düğmesi
  var root = document.documentElement;
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  });

  // Etiket filtresi: grup içinde "ya da", gruplar arasında "ve".
  var filter = document.querySelector("[data-filter]");
  if (!filter) return;
  var chips = Array.prototype.slice.call(filter.querySelectorAll(".chip-toggle"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-results] .card"));
  var countEl = filter.querySelector("[data-count]");
  var emptyEl = document.querySelector("[data-empty]");

  function selected() {
    var sel = {};
    chips.forEach(function (c) {
      if (c.getAttribute("aria-pressed") === "true") {
        (sel[c.dataset.group] = sel[c.dataset.group] || []).push(c.dataset.value);
      }
    });
    return sel;
  }

  function apply(updateUrl) {
    var sel = selected();
    var groups = Object.keys(sel);
    var shown = 0;
    cards.forEach(function (card) {
      var ok = groups.every(function (g) {
        var have = (card.getAttribute("data-" + g) || "").split(" ");
        return sel[g].some(function (v) { return have.indexOf(v) !== -1; });
      });
      card.hidden = !ok;
      if (ok) shown++;
    });
    countEl.textContent = shown;
    emptyEl.hidden = shown !== 0;
    if (updateUrl && window.history && history.replaceState) {
      var params = new URLSearchParams();
      groups.forEach(function (g) { sel[g].forEach(function (v) { params.append("f", g + ":" + v); }); });
      var qs = params.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
    }
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true");
      apply(true);
    });
  });

  filter.querySelector("[data-clear]").addEventListener("click", function () {
    chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    apply(true);
  });

  // ?f=owasp:LLM01&f=severity:critical
  new URLSearchParams(location.search).getAll("f").forEach(function (f) {
    var i = f.indexOf(":");
    if (i < 1) return;
    var g = f.slice(0, i), v = f.slice(i + 1);
    chips.forEach(function (c) {
      if (c.dataset.group === g && c.dataset.value === v) c.setAttribute("aria-pressed", "true");
    });
  });
  apply(false);
})();
