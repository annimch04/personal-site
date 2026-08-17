#!/usr/bin/env python3
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "continuity/data.json").read_text())

errors = []
publications = DATA["publications"]
threads = DATA["threads"]
publication_ids = {item["id"] for item in publications}
thread_ids = {item["id"] for item in threads}


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        attribute = "href" if tag in {"a", "link"} else "src" if tag in {"script", "img"} else None
        if attribute and values.get(attribute):
            self.references.append(values[attribute])


def local_target(page, reference):
    parsed = urlparse(reference)
    if parsed.scheme or parsed.netloc or reference.startswith(("mailto:", "#")):
        return None
    path = parsed.path
    target = ROOT / path.lstrip("/") if path.startswith("/") else page.parent / path
    if path.endswith("/"):
        target = target / "index.html"
    return target.resolve()

if len(publications) != 44:
    errors.append(f"expected 44 publications, found {len(publications)}")
if len(publication_ids) != len(publications):
    errors.append("publication IDs are not unique")
if len({item["url"] for item in publications}) != len(publications):
    errors.append("publication URLs are not unique")

for item in publications:
    local = ROOT / item["url"].lstrip("/") / "index.html"
    if not local.exists():
        errors.append(f"missing reading surface for {item['id']}: {item['url']}")
    if item["primaryThread"] not in thread_ids:
        errors.append(f"unknown primary thread for {item['id']}")
    if not item.get("threads"):
        errors.append(f"no thread assignment for {item['id']}")
    for thread_id in item.get("threads", []):
        if thread_id not in thread_ids:
            errors.append(f"unknown thread {thread_id} on {item['id']}")
    if local.exists() and "reader-continuity.js" not in local.read_text():
        errors.append(f"continuity script missing from {item['id']}")

path_ids = set()
for thread in threads:
    for publication_id in thread["path"]:
        path_ids.add(publication_id)
        if publication_id not in publication_ids:
            errors.append(f"unknown publication {publication_id} in {thread['id']}")

missing_from_paths = publication_ids - path_ids
if missing_from_paths:
    errors.append("not present in any trajectory path: " + ", ".join(sorted(missing_from_paths)))

for context in DATA["contexts"]:
    if urlparse(context["url"]).scheme != "https":
        errors.append(f"context URL is not HTTPS: {context['id']}")
    for publication_id in context["related"]:
        if publication_id not in publication_ids:
            errors.append(f"unknown related publication {publication_id} on {context['id']}")

for page in [ROOT / "continuity/index.html", ROOT / "writing/index.html", ROOT / "index.html"]:
    parser = LinkParser()
    parser.feed(page.read_text())
    for reference in parser.references:
        target = local_target(page, reference)
        if target is not None and not target.exists():
            errors.append(f"broken local reference in {page.relative_to(ROOT)}: {reference}")

if errors:
    for error in errors:
        print("ERROR:", error)
    raise SystemExit(1)

print(f"Reader Continuity valid: {len(publications)} publications, {len(threads)} trajectories, {len(DATA['contexts'])} public contexts")
