# Fieldlight Site Measurement

This document is the operating record for traffic and search measurement on `fieldlight.com`.

## Current services

| Service | Purpose | Status |
| --- | --- | --- |
| Cloudflare Web Analytics | Privacy-preserving, aggregate website traffic and performance | Active since July 30, 2026 |
| Google Search Console | Google Search queries, impressions, clicks, indexing, and referrals | Active and verified since July 30, 2026 |
| Google Analytics | Individualized product and marketing analytics | Not installed |

Cloudflare Web Analytics and Google Search Console are separate systems. Search Console is not Google Analytics and does not add a general-purpose visitor tracker to the site.

## Cloudflare Web Analytics

### Why Fieldlight uses it

Cloudflare Web Analytics provides aggregate information about readership and site performance without using advertising trackers, behavioral profiles, or cross-site identifiers. It is the site's primary traffic-measurement system.

### Implementation

- Cloudflare account access is connected through the site owner's GitHub account.
- The Web Analytics property is `fieldlight.com`.
- The public site token is `a8ece4976a604339bac4dbb72a6c5856`.
- Every HTML page includes the Cloudflare beacon immediately before its closing `body` tag.
- The beacon is loaded from `https://static.cloudflareinsights.com/beacon.min.js`.
- The analytics disclosure appears on the homepage and in the Fieldlight Institute footer.
- The initial site-wide installation is recorded in commit `536a466`.

The site token is intentionally public: it is delivered to every reader's browser as part of the page source. Account credentials must never be committed.

### What it can answer

- How much aggregate traffic the site receives
- Which pages are read
- Which external sites refer readers
- Broad country, device, and browser information
- Site-loading and performance information

### Important limits

- It does not identify individual readers.
- It does not provide session replay or behavioral profiles.
- It does not currently support custom conversion events.
- It does not preserve UTM query parameters for campaign-level attribution.
- Ad blockers can prevent some visits from being counted, so totals are directional rather than an exact census.
- It begins with the installation date; it cannot reconstruct earlier Fieldlight traffic.

### Maintenance when adding a page

Every new HTML page must include this immediately before `</body>`:

```html
<!-- Cloudflare Web Analytics -->
<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "a8ece4976a604339bac4dbb72a6c5856"}'></script>
<!-- End Cloudflare Web Analytics -->
```

To confirm complete coverage, compare the two counts below. They must match. The Google ownership-verification file is intentionally excluded because its contents must remain exactly as Google issued them:

```sh
rg --files -g '*.html' -g '!google*.html' | wc -l
rg -l 'a8ece4976a604339bac4dbb72a6c5856' -g '*.html' -g '!google*.html' | wc -l
```

## Google Search Console

### Why Fieldlight uses it

Search Console explains how Fieldlight appears in Google Search. It complements Cloudflare rather than replacing it.

### Intended property and verification

- Property: `https://fieldlight.com/`
- Property type: URL-prefix
- Verification method: Google-provided HTML file published at the root of the site
- Verification file: `google6e31d5a7bc763d46.html`
- Ownership confirmed by Google on July 30, 2026
- Verification-file commit: `bc567a2`
- The verification file must remain in the repository after verification. Removing it can cause ownership verification to lapse.

### What it can answer

- Which Google searches cause Fieldlight pages to appear
- Search impressions, clicks, click-through rate, and average position
- Which Fieldlight pages receive Google Search traffic
- Whether Google can crawl and index new or updated pages
- Whether Google detects indexing or site-experience problems

Search Console reports activity within Google Search. It is not a complete traffic counter and will not report readers arriving directly, from social networks, from GitHub, or from other search engines.

## Google Analytics

Google Analytics is not installed. Fieldlight does not presently need its cookie-based visitor and event model, additional consent complexity, or advertising ecosystem integrations.

If a future requirement cannot be met by Cloudflare Web Analytics and Search Console, the decision to add another analytics system should be made explicitly and recorded here before any new tracking code is introduced.

## Review practice

Review measurement weekly rather than continuously:

1. Record total visits and the five most-read pages in Cloudflare.
2. Record the leading referral sources.
3. Compare new publications after 24 hours, 7 days, and 30 days.
4. Review Search Console clicks, impressions, and queries.
5. Note pages gaining search visibility and pages with high impressions but low click-through.
6. Treat trends as evidence for editorial and infrastructure decisions, not as a proxy for the worth of the work.
