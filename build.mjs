// Builds the static site from /content into /dist.
// Usage:  node build.mjs            (production, clean URLs for Vercel)
//         node build.mjs --preview  (links point to index.html, for local/file previews)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(ROOT, 'content');
const STATIC = path.join(ROOT, 'static');
const OUT = path.join(ROOT, 'dist');
const PREVIEW = process.argv.includes('--preview');
const IDX = PREVIEW ? 'index.html' : '';

const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const isUrl = (s) => /^https?:\/\//i.test(s || '');
const pad = (n) => String(n).padStart(2, '0');

// ---------- load content ----------
const site = readJSON(path.join(CONTENT, 'site.json'));

function loadCollection(name) {
  const dir = path.join(CONTENT, name);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !/^[._]/.test(d.name))
    .map((d) => {
      const f = path.join(dir, d.name, 'info.json');
      if (!fs.existsSync(f)) return null;
      const data = readJSON(f);
      if (data.hidden) return null;
      return { slug: d.name, dir: `content/${name}/${d.name}/`, ...data };
    })
    .filter(Boolean)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.slug.localeCompare(b.slug));
}

const clients = loadCollection('clients');
const projects = loadCollection('projects');
const typefaces = loadCollection('typefaces');

function loadPosters() {
  const dir = path.join(CONTENT, 'posters');
  const listFile = path.join(dir, 'posters.json');
  const imgs = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(f))
    : [];
  const meta = fs.existsSync(listFile) ? readJSON(listFile) : [];
  const byFile = new Map(meta.map((m) => [m.file, m]));
  const ordered = [
    ...meta.filter((m) => imgs.includes(m.file)),
    ...imgs.filter((f) => !byFile.has(f)).sort().map((file) => ({ file })),
  ];
  return ordered.map((p) => ({ ...p, src: `content/posters/${p.file}` }));
}
const posters = loadPosters();

// asset path relative to the page
const asset = (rel, item, file) => (isUrl(file) ? file : `${rel}${item ? item.dir : ''}${file}`);

// ---------- shared layout ----------
const NAV = [
  ['about', 'Who I am'],
  ['projects', 'Projects'],
  ['clients', 'Clients'],
  ['typefaces', 'Typefaces'],
  ['posters', 'Posters'],
  ['contact', 'Contact'],
];

function layout({ rel, title, description, body, bodyClass = '' }) {
  const home = `${rel}${IDX}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
${site.url ? `<meta property="og:url" content="${esc(site.url)}">` : ''}
<link rel="icon" href="${rel}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${rel}assets/style.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="${bodyClass}">
<header class="nav">
  <div class="wrap">
    <a class="nav-name" href="${home}">${esc(site.name)}</a>
    <nav class="nav-links">
      ${NAV.map(([id, label]) => `<a href="${home}#${id}">${label}</a>`).join('')}
    </nav>
  </div>
</header>
${body}
<footer class="footer">
  <div class="wrap footer-inner">
    <span>© <span data-year></span> ${esc(site.name)}</span>
    <span class="footer-links">${(site.links || []).map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</span>
  </div>
</footer>
<script src="${rel}assets/main.js" defer></script>
</body>
</html>`;
}

const sectionHead = (n, title, count) => `
  <div class="section-head reveal">
    <span class="section-num">${pad(n)}</span>
    <h2 class="section-title">${esc(title)}</h2>
    ${count != null ? `<span class="section-count">(${pad(count)})</span>` : ''}
  </div>`;

// ---------- media rendering ----------
function videoEmbed(url) {
  let m;
  if ((m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)))
    return `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0`;
  if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]+))?/)))
    return `https://player.vimeo.com/video/${m[1]}?dnt=1${m[2] ? `&h=${m[2]}` : ''}`;
  return null;
}

function ratioStyle(r) {
  const [w, h] = String(r || '16:9').split(':').map(Number);
  return w && h ? `aspect-ratio:${w}/${h}` : 'aspect-ratio:16/9';
}

function renderMedia(item, m, rel) {
  const size = m.width === 'half' ? 'half' : 'full';
  const caption = m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : '';
  let inner = '';
  if (m.type === 'video') {
    if (!m.src) {
      inner = `<div class="video-ph" style="${ratioStyle(m.ratio)}"><span>Video — add a Vimeo or YouTube link</span></div>`;
    } else if (isUrl(m.src) && videoEmbed(m.src)) {
      inner = `<div class="video" style="${ratioStyle(m.ratio)}"><iframe src="${esc(videoEmbed(m.src))}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${esc(m.caption || item.name || item.title)}"></iframe></div>`;
    } else {
      const src = asset(rel, item, m.src);
      inner = m.loop
        ? `<video src="${esc(src)}" autoplay muted loop playsinline preload="metadata"></video>`
        : `<video src="${esc(src)}" controls playsinline preload="metadata"></video>`;
    }
  } else {
    inner = `<img src="${esc(asset(rel, item, m.src))}" alt="${esc(m.alt || m.caption || '')}" loading="lazy">`;
  }
  return `<figure class="media ${size} reveal">${inner}${caption}</figure>`;
}

// ---------- home page ----------
function homePage() {
  const rel = './';
  const about = `
<section class="hero wrap">
  <h1 class="hero-name reveal">${esc(site.name)}</h1>
  <div class="hero-sub reveal">
    <span>${esc(site.title)}</span>
    ${site.location ? `<span>${esc(site.location)}</span>` : ''}
    ${site.availability ? `<span class="dot">${esc(site.availability)}</span>` : ''}
  </div>
</section>

<section id="about" class="section wrap">
  ${sectionHead(1, 'Who I am')}
  <div class="about">
    ${site.photo ? `<div class="about-photo reveal"><img src="${esc(asset(rel, null, 'content/' + site.photo))}" alt="${esc(site.name)}"></div>` : ''}
    <div class="about-text reveal">
      ${(site.bio || []).map((p, i) => `<p class="${i === 0 ? 'lead' : ''}">${esc(p)}</p>`).join('')}
      ${site.services?.length ? `<div class="about-list"><h3>What I do</h3><ul>${site.services.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
    </div>
  </div>
</section>`;

  const projectsSec = projects.length
    ? `
<section id="projects" class="section wrap">
  ${sectionHead(2, 'Personal projects', projects.length)}
  <div class="projects">
    ${projects
      .map(
        (p) => `
    <a class="card reveal" href="${rel}projects/${p.slug}/${IDX}">
      <div class="card-media"><img src="${esc(asset(rel, p, p.cover))}" alt="${esc(p.title)}" loading="lazy"></div>
      <div class="card-info">
        <h3>${esc(p.title)}</h3>
        <span>${esc(p.year || '')}</span>
      </div>
      ${p.tags?.length ? `<p class="card-tags">${p.tags.map(esc).join(' · ')}</p>` : ''}
    </a>`
      )
      .join('')}
  </div>
</section>`
    : '';

  const clientsSec = clients.length
    ? `
<section id="clients" class="section wrap">
  ${sectionHead(3, 'Clients', clients.length)}
  <div class="clients reveal">
    ${clients
      .map(
        (c) => `
    <a class="client" href="${rel}clients/${c.slug}/${IDX}" aria-label="${esc(c.name)}">
      <img src="${esc(asset(rel, c, c.logo))}" alt="${esc(c.name)}" loading="lazy">
      <span class="client-hover">View work →</span>
    </a>`
      )
      .join('')}
  </div>
</section>`
    : '';

  const typeSec = typefaces.length
    ? `
<section id="typefaces" class="section wrap">
  ${sectionHead(4, 'Typefaces', typefaces.length)}
  <div class="typefaces">
    ${typefaces
      .map(
        (t) => `
    <a class="card reveal" href="${esc(t.link || '#')}" target="_blank" rel="noopener">
      <div class="card-media type-media"><img src="${esc(asset(rel, t, t.preview))}" alt="${esc(t.name)} typeface" loading="lazy"></div>
      <div class="card-info">
        <h3>${esc(t.name)}</h3>
        <span class="ext">Behance ↗</span>
      </div>
      ${t.description ? `<p class="card-tags">${esc(t.description)}</p>` : ''}
    </a>`
      )
      .join('')}
  </div>
</section>`
    : '';

  const posterSec = posters.length
    ? `
<section id="posters" class="section wrap">
  ${sectionHead(5, 'Poster collection', posters.length)}
  <div class="posters">
    ${posters
      .map(
        (p, i) => `
    <button class="poster reveal" data-index="${i}" data-full="${esc(asset(rel, null, p.src))}" data-title="${esc([p.title, p.year].filter(Boolean).join(' — '))}">
      <img src="${esc(asset(rel, null, p.src))}" alt="${esc(p.title || 'Poster')}" loading="lazy">
      ${p.title ? `<span class="poster-cap">${esc(p.title)}${p.year ? ` <em>${esc(p.year)}</em>` : ''}</span>` : ''}
    </button>`
      )
      .join('')}
  </div>
</section>
<div class="lightbox" hidden>
  <button class="lb-close" aria-label="Close">Close ✕</button>
  <button class="lb-prev" aria-label="Previous">←</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lb-next" aria-label="Next">→</button>
</div>`
    : '';

  const contact = `
<section id="contact" class="section wrap contact">
  ${sectionHead(6, 'Contact')}
  <p class="contact-line reveal">Have a project in mind?</p>
  <a class="contact-email reveal" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
  <div class="contact-links reveal">
    ${(site.links || []).map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}
  </div>
</section>`;

  return layout({
    rel,
    title: `${site.name} — ${site.title}`,
    description: site.description || site.bio?.[0] || '',
    body: `<main>${about}${projectsSec}${clientsSec}${typeSec}${posterSec}${contact}</main>`,
  });
}

// ---------- detail pages (clients & projects) ----------
function detailPage(item, kind, list) {
  const rel = '../../';
  const name = item.name || item.title;
  const idx = list.indexOf(item);
  const next = list[(idx + 1) % list.length];
  const backId = kind === 'clients' ? 'clients' : 'projects';
  const backLabel = kind === 'clients' ? 'All clients' : 'All projects';

  const meta = [];
  if (item.role?.length)
    meta.push(`<div><dt>My role</dt><dd>${(Array.isArray(item.role) ? item.role : [item.role]).map(esc).join('<br>')}</dd></div>`);
  if (item.team?.length)
    meta.push(
      `<div><dt>Worked with</dt><dd>${item.team
        .map((t) => {
          const who = t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.name)}</a>` : esc(t.name);
          return `<span class="team-row">${t.role ? `<span class="muted">${esc(t.role)}</span> ` : ''}${who}</span>`;
        })
        .join('')}</dd></div>`
    );
  if (item.year) meta.push(`<div><dt>Year</dt><dd>${esc(item.year)}</dd></div>`);
  if (item.tags?.length) meta.push(`<div><dt>Discipline</dt><dd>${item.tags.map(esc).join('<br>')}</dd></div>`);
  if (item.link)
    meta.push(`<div><dt>Link</dt><dd><a href="${esc(item.link)}" target="_blank" rel="noopener">${esc(item.linkLabel || 'View project')} ↗</a></dd></div>`);

  const intro = Array.isArray(item.intro) ? item.intro : [item.intro].filter(Boolean);

  const body = `
<main class="detail">
  <section class="wrap detail-head">
    <a class="back" href="${rel}${IDX}#${backId}">← ${backLabel}</a>
    ${kind === 'clients' && item.logo ? `<div class="detail-logo reveal"><img src="${esc(asset(rel, item, item.logo))}" alt="${esc(name)} logo"></div>` : ''}
    <h1 class="detail-title reveal">${esc(name)}</h1>
    <div class="detail-intro">
      <div class="detail-text reveal">${intro.map((p, i) => `<p class="${i === 0 ? 'lead' : ''}">${esc(p)}</p>`).join('')}</div>
      <dl class="detail-meta reveal">${meta.join('')}</dl>
    </div>
  </section>
  <section class="wrap work">
    ${(item.work || []).map((m) => renderMedia(item, m, rel)).join('')}
  </section>
  ${
    list.length > 1
      ? `<section class="wrap next">
    <a href="${rel}${kind}/${next.slug}/${IDX}">
      <span class="muted">Next ${kind === 'clients' ? 'client' : 'project'}</span>
      <span class="next-name">${esc(next.name || next.title)} →</span>
    </a>
  </section>`
      : ''
  }
</main>`;

  return layout({
    rel,
    title: `${name} — ${site.name}`,
    description: intro[0] || `${name} by ${site.name}`,
    body,
    bodyClass: 'is-detail',
  });
}

// ---------- write output ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(STATIC, path.join(OUT, 'assets'), { recursive: true });
fs.cpSync(CONTENT, path.join(OUT, 'content'), {
  recursive: true,
  filter: (src) => !src.endsWith('.json') && !src.endsWith('.md'),
});

const write = (p, html) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html);
};
write(path.join(OUT, 'index.html'), homePage());
for (const c of clients) write(path.join(OUT, 'clients', c.slug, 'index.html'), detailPage(c, 'clients', clients));
for (const p of projects) write(path.join(OUT, 'projects', p.slug, 'index.html'), detailPage(p, 'projects', projects));

console.log(
  `Built ${1 + clients.length + projects.length} pages · ${clients.length} clients · ${projects.length} projects · ${typefaces.length} typefaces · ${posters.length} posters${PREVIEW ? ' (preview links)' : ''}`
);
