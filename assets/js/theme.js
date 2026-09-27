// Boyamadan önce baskı seçimini (gece/gündüz) uygula. ?edition=day|night kayıtlı seçimi o sayfa için geçersiz kılar.
(function () {
  var d = document.documentElement, t = "dark";
  try { t = localStorage.getItem("theme") === "light" ? "light" : "dark"; } catch (e) {}
  try {
    var qe = new URLSearchParams(location.search).get("edition");
    if (qe === "day") t = "light";
    if (qe === "night") t = "dark";
  } catch (e) {}
  d.setAttribute("data-theme", t);
})();
