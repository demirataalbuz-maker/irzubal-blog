// Varsayılan koyu; kullanıcı açık seçtiyse boyamadan önce uygula.
(function () {
  var t = "dark";
  try { t = localStorage.getItem("theme") === "light" ? "light" : "dark"; } catch (e) {}
  document.documentElement.setAttribute("data-theme", t);
})();
