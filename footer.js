fetch('/footer.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('footer-placeholder').innerHTML = html;
    const settingsLink = document.getElementById('cookieSettingsLink');
    const modal = document.getElementById('cookieModal');
    if (settingsLink && modal) {
      settingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.remove('hidden');
      });
    } else if (settingsLink) {
      settingsLink.style.display = 'none';
    }
  });

// Highlight animado por scroll para todos los <strong>
(function() {
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js')
    .then(function() {
      return loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
    })
    .then(function() {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('strong').forEach(function(el) {
        ScrollTrigger.create({
          trigger: el,
          start: '-100px center',
          onEnter: function() { el.classList.add('active'); }
        });
      });
    });
})();
