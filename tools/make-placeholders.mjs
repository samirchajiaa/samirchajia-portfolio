// One-off: generates placeholder content so the layout can be previewed.
// Delete the placeholder folders once real content is added.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const C = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content');
const w = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const json = (p, o) => w(p, JSON.stringify(o, null, 2) + '\n');

const palette = [
  ['#ff4b1f', '#111'], ['#111', '#f0eee8'], ['#2b4cff', '#f0eee8'], ['#d9ff3f', '#111'],
  ['#f2c4ce', '#111'], ['#0f5c45', '#f0eee8'], ['#ffd23f', '#111'], ['#7a5cff', '#fff'],
  ['#e9e4d8', '#111'], ['#ff7aa8', '#111'],
];

const rectSvg = (wd, ht, bg, fg, label, sub = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wd} ${ht}" width="${wd}" height="${ht}">
<rect width="${wd}" height="${ht}" fill="${bg}"/>
<text x="${wd * 0.06}" y="${ht * 0.12}" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(wd * 0.028)}" fill="${fg}" opacity=".6">${sub}</text>
<text x="${wd * 0.06}" y="${ht * 0.92}" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${Math.round(Math.min(wd, ht) * 0.13)}" fill="${fg}" letter-spacing="-${Math.round(wd * 0.006)}">${label}</text>
</svg>`;

const logoSvg = (name, i) => {
  const shapes = [
    `<circle cx="40" cy="40" r="28" fill="#111"/>`,
    `<rect x="12" y="12" width="56" height="56" fill="#111"/>`,
    `<path d="M40 10 L70 70 L10 70 Z" fill="#111"/>`,
    `<rect x="10" y="26" width="60" height="28" rx="14" fill="#111"/>`,
    `<path d="M10 40 a30 30 0 0 1 60 0 Z" fill="#111"/>`,
    `<g fill="#111"><circle cx="24" cy="40" r="14"/><circle cx="56" cy="40" r="14"/></g>`,
    `<path d="M12 12 h56 v18 h-38 v38 h-18 Z" fill="#111"/>`,
    `<rect x="16" y="16" width="48" height="48" transform="rotate(45 40 40)" fill="#111"/>`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
${shapes[i % shapes.length]}
<text x="90" y="54" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="36" fill="#111" letter-spacing="-1.5">${name}</text>
</svg>`;
};

// ---- clients ----
const clientNames = ['Northline', 'Oasis Co.', 'Kora', 'Atlas Studio', 'Sahm', 'Mono', 'Duna', 'Levant'];
clientNames.forEach((name, i) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
  const dir = path.join(C, 'clients', slug);
  const [bg, fg] = palette[i % palette.length];
  const [bg2, fg2] = palette[(i + 3) % palette.length];
  w(path.join(dir, 'logo.svg'), logoSvg(name, i));
  w(path.join(dir, '01.svg'), rectSvg(1600, 900, bg, fg, name, 'KEY VISUAL — PLACEHOLDER'));
  w(path.join(dir, '02.svg'), rectSvg(800, 1000, bg2, fg2, 'Post 01', 'SOCIAL'));
  w(path.join(dir, '03.svg'), rectSvg(800, 1000, fg === '#111' ? '#111' : '#e9e4d8', fg === '#111' ? '#f0eee8' : '#111', 'Post 02', 'SOCIAL'));
  w(path.join(dir, '04.svg'), rectSvg(1600, 1000, bg2, fg2, 'Campaign', 'OUT OF HOME'));
  json(path.join(dir, 'info.json'), {
    name,
    order: i + 1,
    year: String(2026 - (i % 4)),
    logo: 'logo.svg',
    intro: [
      `Placeholder: a short line about the project for ${name} — what the brief was and what you made.`,
      'A second, optional paragraph for more context: the idea, the process, or the results.',
    ],
    role: ['Art Direction', 'Motion Design', 'Social Media Design'],
    team: [
      { role: 'Agency', name: 'Agency Name', url: '' },
      { role: 'Creative Director', name: 'Person Name', url: '' },
      { role: 'Photography', name: 'Person Name', url: '' },
    ],
    work: [
      { type: 'image', src: '01.svg' },
      { type: 'video', src: '', ratio: '16:9' },
      { type: 'image', src: '02.svg', width: 'half' },
      { type: 'image', src: '03.svg', width: 'half' },
      { type: 'image', src: '04.svg' },
    ],
  });
});

// ---- personal projects ----
['Project One', 'Project Two', 'Project Three', 'Project Four'].forEach((title, i) => {
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  const dir = path.join(C, 'projects', slug);
  const [bg, fg] = palette[(i * 2 + 1) % palette.length];
  w(path.join(dir, 'cover.svg'), rectSvg(1600, 1200, bg, fg, title, 'PERSONAL PROJECT'));
  w(path.join(dir, '01.svg'), rectSvg(1600, 1000, bg, fg, 'Detail 01', title.toUpperCase()));
  w(path.join(dir, '02.svg'), rectSvg(800, 1000, fg, bg, 'Detail 02', ''));
  w(path.join(dir, '03.svg'), rectSvg(800, 1000, palette[(i + 5) % 10][0], palette[(i + 5) % 10][1], 'Detail 03', ''));
  json(path.join(dir, 'info.json'), {
    title,
    order: i + 1,
    year: String(2026 - i),
    tags: [['Branding', 'Type'], ['Motion', '3D'], ['Editorial'], ['Illustration', 'Print']][i],
    cover: 'cover.svg',
    intro: ['Placeholder: what this personal project is about and why you made it.'],
    link: '',
    work: [
      { type: 'image', src: '01.svg' },
      { type: 'image', src: '02.svg', width: 'half' },
      { type: 'image', src: '03.svg', width: 'half' },
    ],
  });
});

// ---- typefaces ----
[['Kharbash', 'Display · 2025'], ['Raml Sans', 'Sans serif · 2024'], ['Nokta', 'Arabic display · 2023']].forEach(([name, desc], i) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const dir = path.join(C, 'typefaces', slug);
  const [bg, fg] = [['#111', '#f0eee8'], ['#e6e3db', '#111'], ['#ff4b1f', '#111']][i];
  w(path.join(dir, 'preview.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
<rect width="1200" height="900" fill="${bg}"/>
<text x="70" y="110" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="${fg}" opacity=".6">TYPEFACE — PLACEHOLDER</text>
<text x="600" y="560" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="${i === 0 ? 300 : 260}" fill="${fg}" letter-spacing="-8">Aa</text>
<text x="70" y="830" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="56" fill="${fg}" letter-spacing="-2">${name}</text>
</svg>`);
  json(path.join(dir, 'info.json'), { name, order: i + 1, description: desc, preview: 'preview.svg', link: 'https://www.behance.net/' });
});

// ---- posters ----
const posterMeta = [];
for (let i = 1; i <= 12; i++) {
  const [bg, fg] = palette[(i * 3) % palette.length];
  const file = `poster-${String(i).padStart(2, '0')}.svg`;
  const h = [1500, 1414, 1500, 1333][i % 4];
  w(path.join(C, 'posters', file), rectSvg(1000, h, bg, fg, String(i).padStart(2, '0'), 'POSTER — PLACEHOLDER'));
  posterMeta.push({ file, title: `Poster ${String(i).padStart(2, '0')}`, year: String(2026 - (i % 3)) });
}
json(path.join(C, 'posters', 'posters.json'), posterMeta);

// ---- portrait ----
w(path.join(C, 'photo.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
<rect width="800" height="1000" fill="#d8d4ca"/>
<circle cx="400" cy="400" r="150" fill="#bfbab0"/>
<path d="M150 1000 C150 760 650 760 650 1000 Z" fill="#bfbab0"/>
<text x="40" y="70" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#111" opacity=".5">YOUR PHOTO</text>
</svg>`);

console.log('Placeholders written.');
