/* Forever & Always — 20th Anniversary Website
   Plain JavaScript, no dependencies. */
(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Gift messages ---------- */
  const GIFTS = [
    { title: 'A Little Memory',
      text: ['Twenty years of laughter, festivals, quiet evenings and everyday moments have become a treasure of memories.',
             'Every one of them began with the two of you.'] },
    { title: 'A Heartfelt Wish',
      text: ['May your days be filled with happiness, your health stay strong, and your hands always find each other.',
             'May togetherness be your greatest joy, today and always.'] },
    { title: 'A Special Reminder',
      text: ['Your love is the warmth that holds this family together.',
             'You are deeply loved, truly appreciated, and so important to everyone around you.'] }
  ];

  const LETTER = [
    'Dear Periamma and Periappa,',
    'Some people make a family feel like home simply by being in it.',
    'You both bring so much warmth, love and happiness to the people around you.',
    'I hope this little website reminds you how loved and appreciated you are.',
    'Wishing you many more years of laughter, good health, togetherness and beautiful memories.',
    'Happy 20th Wedding Anniversary!',
    'With lots of love,<br>Dhiya ♡'
  ];

  /* ---------- Floating golden particles ---------- */
  const canvas = $('#particles');
  const ctx = canvas.getContext('2d');
  let dots = [];

  function sizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = window.innerWidth < 600 ? 35 : 70;
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      v: Math.random() * 0.35 + 0.1,
      p: Math.random() * Math.PI * 2
    }));
  }

  function drawParticles(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const d of dots) {
      if (!reduceMotion) {
        d.y -= d.v;
        d.x += Math.sin(t / 1800 + d.p) * 0.2;
        if (d.y < -5) { d.y = canvas.height + 5; d.x = Math.random() * canvas.width; }
      }
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t / 700 + d.p);
      ctx.fillStyle = '#f6e6b8';
      ctx.shadowColor = '#d9b977';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(drawParticles);
  }

  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  requestAnimationFrame(drawParticles);

  /* ---------- Music ---------- */
  const audio = $('#bgm');
  const musicBtn = $('#musicBtn');
  const musicLabel = $('#musicLabel');
  let musicAvailable = true;

  function setMusicUI(on) {
    musicBtn.setAttribute('aria-pressed', String(on));
    musicLabel.textContent = on ? 'Music ON' : 'Music OFF';
  }

  // If assets/music.mp3 is missing, the site keeps working and the button hides.
  audio.addEventListener('error', () => { musicAvailable = false; musicBtn.hidden = true; });
  audio.volume = 0.6;

  function startMusic() {
    musicBtn.hidden = !musicAvailable;
    const p = audio.play();
    if (p && p.then) {
      p.then(() => setMusicUI(true)).catch(() => setMusicUI(false));
    }
  }

  musicBtn.addEventListener('click', () => {
    if (audio.paused) { audio.play().then(() => setMusicUI(true)).catch(() => setMusicUI(false)); }
    else { audio.pause(); setMusicUI(false); }
  });

  /* ---------- Opening screen ---------- */
  $('#openBtn').addEventListener('click', () => {
    startMusic();
    const intro = $('#intro');
    intro.classList.add('leaving');
    document.body.classList.remove('locked');
    window.scrollTo(0, 0);
    setTimeout(() => { intro.hidden = true; }, 1500);
  });

  /* ---------- Mobile navigation ---------- */
  const nav = $('#nav');
  const navToggle = $('#navToggle');
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') { nav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
  });

  /* ---------- Scroll reveal for timeline ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.25 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Popup ---------- */
  const modal = $('#modal');
  const card = modal.querySelector('.modal-card');
  const modalTitle = $('#modalTitle');
  const modalBody = $('#modalBody');
  let lastFocus = null;

  function openModal(title, html, isLetter) {
    lastFocus = document.activeElement;
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    card.classList.toggle('letter', !!isLetter);
    modal.hidden = false;
    card.focus();
  }

  function closeModal() {
    modal.hidden = true;
    if (lastFocus) lastFocus.focus();
  }

  $('#modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* ---------- Gift boxes ---------- */
  const opened = new Set();
  const gifts = document.querySelectorAll('.gift');
  const progress = $('#progress');
  const secretBtn = $('#secretBtn');

  gifts.forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.gift);
      const g = GIFTS[i];
      btn.classList.add('opened');
      // Let the lid animation play first, then show the message
      setTimeout(() => {
        openModal(g.title, g.text.map((t) => '<p>' + t + '</p>').join(''), false);
        opened.add(i);
        progress.textContent = opened.size + ' of 3 gifts opened';
        if (opened.size === 3) {
          secretBtn.hidden = false;
          progress.textContent = 'All three gifts opened — something is waiting below.';
        }
      }, reduceMotion ? 0 : 800);
    });
  });

  /* ---------- Hidden letter (unlocks after all 3 gifts) ---------- */
  secretBtn.addEventListener('click', () => {
    if (opened.size < 3) return;
    const html = LETTER.map((line, i) => '<p style="--i:' + i + '">' + line + '</p>').join('');
    openModal('A Letter For You', html, true);
  });
})();
