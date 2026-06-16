# MicroAtlas Brand Asset Checklist

Purpose: convert the chosen Concept B logo direction into production-ready assets for the MicroAtlas website, favicon/app icons, social previews, documentation and future handoff.

## Locked brand decisions

| Element | Decision |
|---|---|
| Brand name | MicroAtlas |
| Core descriptor | A moderated public atlas for micronational claims. |
| Primary motto | Mapping self-declared nations with care. |
| Secondary motto | Claims mapped. Records preserved. |
| Logo direction | Rounded map tile + internal claim boundaries + Surveyor Gold magnifying glass. |
| Tone | Serious, civic, cartographic, archival, privacy-first. |
| UI font | IBM Plex Sans or Inter. |
| Wordmark/display font | Cormorant Garamond, Libre Baskerville or Lora. Export public SVG wordmarks as outlines. |

## Colour tokens

| Name | Hex | Token | Use |
|---|---:|---|---|
| Parchment | `#F6F1E8` | `--ma-parchment` | Backgrounds, icon tile |
| Ink Navy | `#172033` | `--ma-ink` | Main text, wordmark |
| Atlas Green | `#2F5D50` | `--ma-atlas` | Logo mark, links, approved accents |
| Muted Slate | `#60707A` | `--ma-slate` | Secondary text, borders |
| Surveyor Gold | `#C49A4A` | `--ma-gold` | Magnifier, section accents |
| Pale Blue Grey | `#DDE8EA` | `--ma-mist` | Map water, soft panels |
| Stone | `#E8E0D2` | `--ma-stone` | Map land, dividers |
| Muted Red | `#A84A3F` | `--ma-danger` | Moderation alerts, destructive actions |

## Minimum set before closed beta

| Done | File | Purpose |
|---|---|---|
| ☐ | `microatlas-logo-horizontal-full-colour.svg` | Main header logo |
| ☐ | `microatlas-mark-full-colour.svg` | Standalone mark |
| ☐ | `favicon.ico` | Browser favicon bundle |
| ☐ | `favicon-32x32.png` | Standard favicon fallback |
| ☐ | `apple-touch-icon.png` | iOS home screen icon, 180x180 |
| ☐ | `android-chrome-192x192.png` | Android/PWA icon |
| ☐ | `android-chrome-512x512.png` | Android/PWA high-res icon |
| ☐ | `opengraph-image.png` | Social link preview, 1200x630 |
| ☐ | `microatlas-design-tokens.css` | CSS variables |
| ☐ | `microatlas-tailwind-theme.ts` | Tailwind colour extension |
| ☐ | `README_brand_assets.md` | Repository usage guide |

## Full export checklist

### Source / master

| Done | File | Format | Size / variant | Purpose | Priority |
|---|---|---|---|---|---|
| ☐ | `microatlas-brand-source.fig` | Figma source | Editable | Master design file containing all logo, icon, colour and type frames. | Required |
| ☐ | `microatlas-logo-master.svg` | SVG | Vector | Canonical vector export of the icon mark. | Required |
| ☐ | `microatlas-brand-board.png` | PNG | 1600x1200 or larger | Reference board for Concept B direction. | Useful |
| ☐ | `microatlas-brand-board.pdf` | PDF | A4 landscape | Shareable one-page visual brand summary. | Useful |

### Full logo

| Done | File | Format | Size / variant | Purpose | Priority |
|---|---|---|---|---|---|
| ☐ | `microatlas-logo-horizontal-full-colour.svg` | SVG | Vector / transparent | Main website header logo. | Required |
| ☐ | `microatlas-logo-horizontal-full-colour.png` | PNG | 1600x400 / transparent | Fallback raster version. | Required |
| ☐ | `microatlas-logo-horizontal-dark.svg` | SVG | Vector / transparent | Single-colour dark version. | Required |
| ☐ | `microatlas-logo-horizontal-light.svg` | SVG | Vector / transparent | Reversed version for dark backgrounds. | Required |
| ☐ | `microatlas-logo-horizontal-monochrome.svg` | SVG | Vector / transparent | One-colour print/low-colour use. | Recommended |
| ☐ | `microatlas-logo-with-tagline.svg` | SVG | Vector / transparent | Logo with tagline. | Recommended |
| ☐ | `microatlas-logo-with-tagline.png` | PNG | 1800x600 / transparent | Raster version for launch graphics. | Recommended |
| ☐ | `microatlas-logo-stacked-full-colour.svg` | SVG | Vector / transparent | Narrow layout/poster option. | Optional |

### Wordmark

| Done | File | Format | Size / variant | Purpose | Priority |
|---|---|---|---|---|---|
| ☐ | `microatlas-wordmark-ink.svg` | SVG | Vector / transparent | Text-only wordmark for compact placements. | Recommended |
| ☐ | `microatlas-wordmark-light.svg` | SVG | Vector / transparent | Light text-only wordmark. | Recommended |

### Icon mark

| Done | File | Format | Size / variant | Purpose | Priority |
|---|---|---|---|---|---|
| ☐ | `microatlas-mark-full-colour.svg` | SVG | Vector / transparent | Primary standalone mark. | Required |
| ☐ | `microatlas-mark-full-colour.png` | PNG | 1024x1024 / transparent | Large raster icon. | Required |
| ☐ | `microatlas-mark-green.svg` | SVG | Vector / transparent | Single-colour Atlas Green mark. | Recommended |
| ☐ | `microatlas-mark-light.svg` | SVG | Vector / transparent | Reversed mark. | Recommended |
| ☐ | `microatlas-mark-monochrome.svg` | SVG | Vector / transparent | Black/single-ink mark. | Recommended |

### Favicon / app

| Done | File | Format | Size / variant | Purpose | Priority |
|---|---|---|---|---|---|
| ☐ | `favicon.ico` | ICO | 16x16, 32x32, 48x48 | Browser favicon bundle. | Required |
| ☐ | `favicon-16x16.png` | PNG | 16x16 | Explicit small favicon. | Required |
| ☐ | `favicon-32x32.png` | PNG | 32x32 | Standard favicon size. | Required |
| ☐ | `favicon-48x48.png` | PNG | 48x48 | Legacy support. | Recommended |
| ☐ | `apple-touch-icon.png` | PNG | 180x180 | iOS home screen icon. | Required |
| ☐ | `android-chrome-192x192.png` | PNG | 192x192 | Android/PWA icon. | Required |
| ☐ | `android-chrome-512x512.png` | PNG | 512x512 | High-resolution PWA icon. | Required |
| ☐ | `maskable-icon-512x512.png` | PNG | 512x512 with safe zone | Maskable PWA icon. | Recommended |
| ☐ | `site.webmanifest` | JSON | N/A | Web app manifest. | Recommended |

### Social / sharing

| Done | File | Format | Size / variant | Purpose | Priority |
|---|---|---|---|---|---|
| ☐ | `opengraph-image.png` | PNG | 1200x630 | Default social preview image. | Required before public launch |
| ☐ | `twitter-image.png` | PNG | 1200x675 | X/Twitter style preview card. | Recommended |
| ☐ | `microatlas-social-avatar.png` | PNG | 1080x1080 | Profile avatar for Reddit, Ko-fi, GitHub and community accounts. | Recommended |
| ☐ | `microatlas-launch-banner.png` | PNG | 1600x900 | Devlog/beta/homepage banner. | Optional |

### Design system

| Done | File | Format | Size / variant | Purpose | Priority |
|---|---|---|---|---|---|
| ☐ | `microatlas-design-tokens.css` | CSS | N/A | CSS variables for brand colours, radii, shadows and fonts. | Required |
| ☐ | `microatlas-tailwind-theme.ts` | TS | N/A | Tailwind theme extension. | Required |
| ☐ | `microatlas-contour-pattern.svg` | SVG | Vector tile | Subtle background/topographic pattern. | Optional |
| ☐ | `microatlas-map-texture.png` | PNG | 1600x1600 | Static background texture. | Optional |

### Documentation

| Done | File | Format | Size / variant | Purpose | Priority |
|---|---|---|---|---|---|
| ☐ | `README_brand_assets.md` | Markdown | N/A | Repository guide explaining asset locations and usage rules. | Required |
| ☐ | `microatlas-brand-guide.pdf` | PDF | A4 landscape | Short visual guide for collaborators and handoff. | Recommended |

## CSS variables

```css
:root {
  --ma-parchment: #F6F1E8;
  --ma-ink: #172033;
  --ma-atlas: #2F5D50;
  --ma-slate: #60707A;
  --ma-gold: #C49A4A;
  --ma-mist: #DDE8EA;
  --ma-stone: #E8E0D2;
  --ma-danger: #A84A3F;
}
```

## Tailwind snippet

```ts
colors: {
  parchment: '#F6F1E8',
  ink: '#172033',
  atlas: '#2F5D50',
  slate: '#60707A',
  gold: '#C49A4A',
  mist: '#DDE8EA',
  stone: '#E8E0D2',
  danger: '#A84A3F',
}
```

## Figma export workflow

- [ ] Create separate frames for full logo, logo with tagline, icon mark, favicon, app icon, OpenGraph image and social avatar.
- [ ] Name layers clearly: `map-frame`, `boundary-lines`, `magnifier-ring`, `magnifier-handle`, `wordmark`, `tagline`.
- [ ] Keep the master icon editable in Figma.
- [ ] Duplicate frames for export variants rather than editing the master directly.
- [ ] Export public SVG wordmarks as outlines unless the chosen font is bundled/available.
- [ ] Export standard logos on transparent backgrounds.
- [ ] Export app and fav icons on a Parchment tile background.
- [ ] Check favicon legibility at 16px, 32px and 48px.
- [ ] Avoid JPG for logos.

## QA before beta

- [ ] Logo is readable on Parchment, white, Ink Navy and Atlas Green backgrounds.
- [ ] Favicon is identifiable at 16x16 without the wordmark.
- [ ] SVGs have no unwanted background rectangles unless intended.
- [ ] PNG exports are not blurry, cropped or padded inconsistently.
- [ ] Wordmark SVG renders correctly without the display font installed.
- [ ] All filenames match the checklist and use lowercase/kebab-case.
- [ ] Social preview has enough safe margin for cropping.
- [ ] Dark/reversed logo has been tested in footer/header contexts.
- [ ] Brand assets are committed to the repo in a predictable location.
