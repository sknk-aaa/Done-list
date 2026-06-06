(function () {
  var KEY = 'todone_site_lang';
  function pick() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === 'en' || saved === 'ja') return saved;
    var n = (navigator.language || 'en').toLowerCase();
    return n.indexOf('ja') === 0 ? 'ja' : 'en';
  }
  function apply(lang) {
    document.body.setAttribute('data-lang', lang);
    document.documentElement.lang = lang;
    var btns = document.querySelectorAll('.langtoggle button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-lang') === lang);
    }
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }
  document.addEventListener('DOMContentLoaded', function () {
    apply(pick());
    var btns = document.querySelectorAll('.langtoggle button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        apply(this.getAttribute('data-lang'));
      });
    }
  });
})();
