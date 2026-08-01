# Fieldlight Institute / fieldlight.com

Source for [fieldlight.com](https://fieldlight.com), the public website and publication surface of Fieldlight Institute.

Fieldlight Institute develops public research, working systems, and institutional methods for human-owned AI infrastructure. The Institute is founded and led by writer and systems builder Anni McHenry.

## Public architecture

- `index.html` is the institutional front door.
- `writing/index.html` is the complete catalog of 42 authored pieces by Anni McHenry.
- `writing/*/index.html` contains the individual Fieldlight reading surfaces.
- `institute/index.html` is the full six-part Fieldlight Institute surface.
- `institute/participant-charter/` publishes the Participant Charter.
- `systems/index.html` is the public register of working Fieldlight systems.
- `story-worlds/` contains explicitly authored creative work and story-worlds.
- `feed.xml` and `feed.json` expose current publications.
- `llms.txt` provides a machine-readable institutional and publication index.
- `sitemap.xml` lists indexable HTML pages.

Canonical Markdown for Anni McHenry's public writing remains in [`annimch04/public-writing`](https://github.com/annimch04/public-writing). Fieldlight Institute is the publisher of selected reading surfaces; it does not replace the author-owned source record.

## Measurement

Fieldlight uses Cloudflare Web Analytics for privacy-preserving aggregate site traffic and Google Search Console for Google Search visibility. Google Analytics is not installed.

See [`docs/measurement.md`](docs/measurement.md) for configuration and maintenance details.
