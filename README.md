# samirchajia.com

A fast, static portfolio site with no frameworks or dependencies. All your work lives in `content/`.
Vercel runs `node build.mjs` and publishes the `dist/` folder.

## Editing your content

Everything is in `content/`. Each item gets its own folder with an `info.json` file plus its images.
Folders that start with `_` are ignored, so you can copy `_template` folders without them showing up.

### About you — `content/site.json`
Name, title, location, bio paragraphs, services, email, links, and your photo filename (put the photo in `content/`).

### Clients — `content/clients/<brand-name>/`
```
content/clients/brand-name/
  info.json
  logo.svg          (SVG or transparent PNG works best)
  01.jpg, 02.jpg …
```
`info.json`:
```json
{
  "name": "Brand Name",
  "order": 1,
  "year": "2025",
  "logo": "logo.svg",
  "intro": ["What the project was and what you did.", "Optional second paragraph."],
  "role": ["Art Direction", "Motion Design"],
  "team": [
    { "role": "Agency", "name": "Studio X", "url": "https://instagram.com/studiox" },
    { "role": "Photographer", "name": "Name", "url": "" }
  ],
  "work": [
    { "type": "image", "src": "01.jpg" },
    { "type": "video", "src": "https://vimeo.com/123456789" },
    { "type": "video", "src": "https://youtu.be/xxxxxxxxxxx", "ratio": "9:16", "width": "half" },
    { "type": "image", "src": "02.jpg", "width": "half" },
    { "type": "video", "src": "loop.mp4", "loop": true }
  ]
}
```
- `width: "half"` puts two items side by side. The default is full width.
- `ratio` sets the shape of an embedded video: `"16:9"` (default), `"9:16"` for reels, `"1:1"`, `"4:5"`.
- A `url` on a team member makes their name a clickable link. Leave it `""` for plain text.
- The folder name becomes the page address: `samirchajia.com/clients/brand-name/`.
- `order` controls the position in the logo wall.

### Personal projects — `content/projects/<project-name>/`
Same as clients, but uses `title`, `cover` (the image shown on the home page) and optional `tags` instead of `logo`/`role`/`team`.
An optional `link` (for example a Behance link) appears as "View project ↗".

### Typefaces — `content/typefaces/<font-name>/`
```json
{ "name": "Font Name", "order": 1, "description": "Display · 2025", "preview": "preview.jpg", "link": "https://www.behance.net/gallery/..." }
```

### Posters — `content/posters/`
Drop image files in the folder. Every image appears automatically.
To set titles, years or the order, list them in `posters.json`:
```json
[ { "file": "poster-01.jpg", "title": "Title", "year": "2025" } ]
```

## Image tips
- Export JPG or WebP at about 2000 px on the long side (posters: about 1600 px). Keep each file under about 500 KB.
- Upload big videos to Vimeo or YouTube (unlisted is fine) and paste the link. Only short loops should be MP4 files in the folder.

## Removing the placeholders
Delete the placeholder folders in `content/clients`, `content/projects`, `content/typefaces`, the `poster-*.svg` files, and `content/photo.svg`.

## Run locally
```
npm run preview     # builds and serves at http://localhost:4321
```

## Changing the look
Colors and fonts are at the top of `static/style.css` (`--bg`, `--ink`, `--accent`, …).
