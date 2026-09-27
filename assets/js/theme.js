// Boyamadan önce baskı (gece/gündüz) ve mercek (kırmızı/mor/mavi) seçimini uygula.
// Bağlantıdaki ?lens=red|blue|purple ve ?edition=day|night kayıtlı seçimi o sayfa için geçersiz kılar.
(function () {
  var d = document.documentElement, t = "dark", l = "purple";
  try {
    t = localStorage.getItem("theme") === "light" ? "light" : "dark";
    var s = localStorage.getItem("lens");
    if (s === "red" || s === "blue") l = s;
  } catch (e) {}
  try {
    var q = new URLSearchParams(location.search);
    var ql = q.get("lens"), qe = q.get("edition");
    if (ql === "red" || ql === "blue" || ql === "purple") l = ql;
    if (qe === "day") t = "light";
    if (qe === "night") t = "dark";
  } catch (e) {}
  d.setAttribute("data-theme", t);
  d.setAttribute("data-lens", l);
})();
