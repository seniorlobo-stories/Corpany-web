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
