// Kartlar görünür olunca sırayla belirsin
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.style.transitionDelay = `${(Number(en.target.dataset.i) % 4) * 60}ms`;
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      }),
    { threshold: 0.15 },
  );
  revealEls.forEach((el, n) => {
    el.dataset.i = n;
    io.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

// Flash mesajlarını birkaç saniye sonra gizle
document.querySelectorAll('[data-autohide]').forEach((el) => {
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 400);
  }, 4000);
});

// Ana sayfadaki istatistikleri canlı güncelle
const statEls = document.querySelectorAll('[data-stat]');
if (statEls.length) {
  const refresh = async () => {
    try {
      const data = await (await fetch('/api/stats')).json();
      statEls.forEach((el) => {
        const v = data[el.dataset.stat];
        if (v !== undefined) el.textContent = Number(v).toLocaleString('tr-TR');
      });
    } catch {
      /* sessizce geç */
    }
  };
  refresh();
  setInterval(refresh, 30000);
}

// Ayar formunda kaydedilmemiş değişiklik uyarısı
const form = document.querySelector('form[data-dirty-guard]');
if (form) {
  const bar = form.querySelector('.savebar');
  let dirty = false;
  form.addEventListener('input', () => {
    dirty = true;
    bar?.classList.add('dirty');
  });
  form.addEventListener('submit', () => (dirty = false));
  window.addEventListener('beforeunload', (e) => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}
