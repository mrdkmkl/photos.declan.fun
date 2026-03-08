# /photos

Drop your images into subfolders here. Push to GitHub and the site updates automatically.

## Adding a photo

1. Upload an image into any subfolder, e.g. `photos/streets/my-shot.jpg`
2. Optionally create a sidecar JSON with the same name for metadata:

**`photos/streets/my-shot.json`**
```json
{
  "title":  "rainy night, shibuya",
  "date":   "march 2024",
  "camera": "fujifilm x100v — f2.0 1/60 iso 3200"
}
```

3. Commit and push. GitHub Actions rewrites `photos.js` automatically.
   Cloudflare Pages rebuilds. Done.

## Adding a new folder

Just create a new subfolder inside `/photos/` and upload images to it.
The folder appears in the gallery automatically — no code changes needed.

## Supported image formats
`.jpg` `.jpeg` `.png` `.webp` `.gif` `.avif`
