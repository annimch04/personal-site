(function () {
  "use strict";

  const storageKey = "fieldlight-reader-continuity-v1";
  const dataUrl = "/continuity/data.json";

  function getState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || { read: {}, visits: {} };
    } catch (_) {
      return { read: {}, visits: {} };
    }
  }

  function setState(state) {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) {}
  }

  function normalizedPath() {
    const path = window.location.pathname.replace(/index\.html$/, "");
    return path.endsWith("/") ? path : path + "/";
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function publicationMap(data) {
    return new Map(data.publications.map((item) => [item.id, item]));
  }

  function ensureStylesheet() {
    if (document.querySelector('link[href*="reader-continuity.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/continuity/reader-continuity.css?v=1";
    document.head.appendChild(link);
  }

  function articleRail(data, publication) {
    ensureStylesheet();
    const state = getState();
    state.visits = state.visits || {};
    state.visits[publication.id] = new Date().toISOString();
    setState(state);

    const thread = data.threads.find((item) => item.id === publication.primaryThread);
    const index = thread.path.indexOf(publication.id);
    const map = publicationMap(data);
    const previous = index > 0 ? map.get(thread.path[index - 1]) : null;
    const next = index > -1 && index < thread.path.length - 1 ? map.get(thread.path[index + 1]) : null;

    const rail = el("aside", "reader-continuity-rail");
    rail.setAttribute("aria-label", "Reader continuity");
    const heading = el("div", "reader-continuity-rail-heading");
    heading.append(el("p", "reader-continuity-eyebrow", "Reader continuity"));
    const title = el("h2", "", thread.title);
    const question = el("p", "reader-continuity-question", thread.question);
    heading.append(title, question);

    const actions = el("div", "reader-continuity-actions");
    const marked = Boolean((state.read || {})[publication.id]);
    const markButton = el("button", marked ? "is-read" : "", marked ? "Marked as read ✓" : "Mark as read");
    markButton.type = "button";
    markButton.addEventListener("click", function () {
      const current = getState();
      current.read = current.read || {};
      if (current.read[publication.id]) {
        delete current.read[publication.id];
        markButton.textContent = "Mark as read";
        markButton.classList.remove("is-read");
      } else {
        current.read[publication.id] = new Date().toISOString();
        markButton.textContent = "Marked as read ✓";
        markButton.classList.add("is-read");
      }
      setState(current);
    });
    actions.appendChild(markButton);

    if (previous) {
      const link = el("a", "reader-continuity-direction");
      link.href = previous.url;
      link.innerHTML = "<span>Previous in thread</span><strong></strong>";
      link.querySelector("strong").textContent = previous.title;
      actions.appendChild(link);
    }
    if (next) {
      const link = el("a", "reader-continuity-direction");
      link.href = next.url;
      link.innerHTML = "<span>Next in thread</span><strong></strong>";
      link.querySelector("strong").textContent = next.title;
      actions.appendChild(link);
    }
    const mapLink = el("a", "reader-continuity-map-link", "See the full trajectory →");
    mapLink.href = "/continuity/#" + thread.id;
    actions.appendChild(mapLink);
    rail.append(heading, actions);

    const footer = document.querySelector("footer");
    if (footer) footer.before(rail);
    else document.body.appendChild(rail);
  }

  function renderReaderState(data) {
    const panel = document.getElementById("reader-state");
    if (!panel) return;
    const state = getState();
    const readIds = Object.keys(state.read || {}).filter((id) => data.publications.some((item) => item.id === id));
    const previousContinuityVisit = state.continuityVisitedAt;
    const changes = data.publications.filter((item) => item.changedAt && previousContinuityVisit && new Date(item.changedAt) > new Date(previousContinuityVisit));
    panel.textContent = "";

    const count = el("p", "reader-state-count");
    count.innerHTML = "<strong></strong><span>marked as read on this device</span>";
    count.querySelector("strong").textContent = readIds.length + " / " + data.publications.length;
    panel.appendChild(count);

    if (!previousContinuityVisit) {
      panel.appendChild(el("p", "", "This is your local baseline. Mark a piece as read from any reading surface; your place will be waiting here."));
    } else if (changes.length) {
      const message = el("p", "", changes.length + (changes.length === 1 ? " public piece has" : " public pieces have") + " changed since your last visit.");
      panel.appendChild(message);
      const list = el("ul", "reader-state-changes");
      changes.forEach((item) => {
        const li = el("li");
        const link = el("a", "", item.title);
        link.href = item.url;
        li.appendChild(link);
        list.appendChild(li);
      });
      panel.appendChild(list);
    } else {
      panel.appendChild(el("p", "", "No explicitly recorded public changes since your last visit. The baseline is not being reconstructed from file dates."));
    }

    const privacy = el("p", "reader-state-privacy", "Stored only in this browser. Clear this site's local data to remove it.");
    panel.appendChild(privacy);
    state.continuityVisitedAt = new Date().toISOString();
    setState(state);
  }

  function renderContexts(data) {
    const register = document.getElementById("context-register");
    if (!register) return;
    data.contexts.forEach((item) => {
      const link = el("a", "context-record");
      link.href = item.url;
      link.innerHTML = "<span class=\"context-id\"></span><div><p class=\"context-status\"></p><h3></h3><p class=\"context-relation\"></p></div><i aria-hidden=\"true\">↗</i>";
      link.querySelector(".context-id").textContent = item.id;
      link.querySelector(".context-status").textContent = item.status;
      link.querySelector("h3").textContent = item.title;
      link.querySelector(".context-relation").textContent = item.relation;
      register.appendChild(link);
    });
  }

  function renderPublicationRegister(data) {
    const register = document.getElementById("publication-register");
    if (!register) return;
    const state = getState();
    const threads = new Map(data.threads.map((item) => [item.id, item]));
    register.textContent = "";
    data.publications.forEach((item) => {
      const link = el("a", "publication-record" + ((state.read || {})[item.id] ? " is-read" : ""));
      link.href = item.url;
      link.innerHTML = "<span class=\"publication-id\"></span><div><h3></h3><p></p></div><i aria-hidden=\"true\">→</i>";
      link.querySelector(".publication-id").textContent = item.id;
      link.querySelector("h3").textContent = item.title;
      link.querySelector("p").textContent = item.form + " / " + threads.get(item.primaryThread).title;
      register.appendChild(link);
    });
  }

  fetch(dataUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Continuity data unavailable");
      return response.json();
    })
    .then((data) => {
      if (document.body.classList.contains("continuity-page")) {
        renderReaderState(data);
        renderContexts(data);
        renderPublicationRegister(data);
        return;
      }
      const path = normalizedPath();
      const publication = data.publications.find((item) => item.url === path);
      if (publication) articleRail(data, publication);
    })
    .catch(() => {});
})();
