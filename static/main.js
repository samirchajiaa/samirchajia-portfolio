// Year in footer
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

// Reveal on scroll
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) return els.forEach((e) => e.classList.add('in'));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );
  els.forEach((e) => io.observe(e));
})();

// Poster lightbox
(() => {
  const lb = document.querySelector('.lightbox');
  const items = [...document.querySelectorAll('.poster')];
  if (!lb || !items.length) return;
  const img = lb.querySelector('img');
  const cap = lb.querySelector('figcaption');
  let i = 0;
  const show = (n) => {
    i = (n + items.length) % items.length;
    img.src = items[i].dataset.full;
    img.alt = items[i].dataset.title || 'Poster';
    cap.textContent = items[i].dataset.title || '';
  };
  const open = (n) => { show(n); lb.hidden = false; document.body.classList.add('lb-open'); };
  const close = () => { lb.hidden = true; document.body.classList.remove('lb-open'); };
  items.forEach((el, n) => el.addEventListener('click', () => open(n)));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); show(i - 1); });
  lb.querySelector('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); show(i + 1); });
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.tagName === 'FIGURE') close(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
})();
