(() => {
  const root = document.getElementById("alt-return-field");
  if (!root) return;

  const svg = root.querySelector(".alt-plot");
  const trackLabel = root.querySelector(".alt-track");
  const artistLabel = root.querySelector(".alt-artist");
  const detailLabel = root.querySelector(".alt-detail");
  const loadingLabel = root.querySelector(".alt-record-loading");
  const NS = "http://www.w3.org/2000/svg";
  const exportDate = new Date("2026-08-08T00:09:09Z");
  const dataUrl = "../../assets/articles/alt-a-record-of-return/alt-sanitized.json";

  const make = (name, attrs = {}, text = "") => {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    return node;
  };

  const compactDate = value => {
    if (!value) return "not recorded";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(`${value}Z`));
  };

  fetch(dataUrl)
    .then(response => {
      if (!response.ok) throw new Error(`Dataset request failed: ${response.status}`);
      return response.json();
    })
    .then(data => {
      let selected = data.reduce((best, item) => item.plays > best.plays ? item : best, data[0]);

      const updateSelection = item => {
        selected = item;
        trackLabel.textContent = item.title;
        artistLabel.textContent = ` — ${item.artist}`;
        detailLabel.textContent = `favorite ${String(item.order).padStart(3, "0")} · ${item.plays.toLocaleString()} plays · carried since ${item.dateAdded ? item.dateAdded.slice(0, 4) : "unknown"} · last played ${compactDate(item.lastPlayed)}`;
        svg.querySelectorAll("[data-track]").forEach(node => {
          const active = Number(node.getAttribute("data-track")) === item.order;
          node.setAttribute("stroke", active ? "var(--alt-green)" : node.getAttribute("data-base-stroke"));
          node.setAttribute("opacity", active ? "1" : node.getAttribute("data-base-opacity"));
        });
      };

      const render = () => {
        svg.replaceChildren();
        const narrow = root.clientWidth < 560;
        const W = narrow ? 720 : 1100;
        const H = narrow ? 760 : 650;
        const margin = narrow ? {left: 62, right: 40} : {left: 78, right: 58};
        const baseline = narrow ? 365 : 318;
        const topHeight = narrow ? 278 : 234;
        const lowerHeight = narrow ? 245 : 202;
        const plotWidth = W - margin.left - margin.right;
        const maxLog = Math.log1p(Math.max(...data.map(item => item.plays)));
        const maxAge = Math.max(...data.map(item => item.dateAdded ? (exportDate - new Date(`${item.dateAdded}Z`)) / 31557600000 : 0));
        const x = order => margin.left + ((order - 1) / (data.length - 1)) * plotWidth;
        const recurrence = plays => (Math.log1p(plays) / maxLog) * topHeight;
        const age = date => date ? ((exportDate - new Date(`${date}Z`)) / 31557600000 / maxAge) * lowerHeight : 0;

        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.append(
          make("title", {id: "alt-svg-title"}, "Favorite sequence and recurrence field"),
          make("desc", {id: "alt-svg-desc"}, "Two hundred and two favorite songs appear in exported favorite order. Height above the center line represents recorded play count on a logarithmic scale. Depth below represents years carried in the music library.")
        );

        const grid = make("g", {"aria-hidden": "true"});
        [0.25, 0.5, 0.75, 1].forEach(fraction => {
          const yTop = baseline - topHeight * fraction;
          const yBottom = baseline + lowerHeight * fraction;
          grid.append(
            make("line", {x1: margin.left, y1: yTop, x2: W - margin.right, y2: yTop, stroke: "var(--alt-line)", opacity: "0.7", "stroke-width": "1"}),
            make("line", {x1: margin.left, y1: yBottom, x2: W - margin.right, y2: yBottom, stroke: "var(--alt-line)", opacity: "0.55", "stroke-width": "1"})
          );
        });
        grid.append(make("line", {x1: margin.left, y1: baseline, x2: W - margin.right, y2: baseline, stroke: "var(--alt-cream)", opacity: "0.55", "stroke-width": "1.5"}));
        svg.append(grid);

        const labelSize = narrow ? 23 : 17;
        const axisStyle = {fill: "var(--alt-muted)", "font-size": String(labelSize), "font-weight": "600", "letter-spacing": "2"};
        svg.append(
          make("text", {x: margin.left, y: 34, ...axisStyle}, "RECURRENCE / RECORDED PLAYS"),
          make("text", {x: margin.left, y: baseline + lowerHeight + 48, ...axisStyle}, "TIME CARRIED IN LIBRARY"),
          make("text", {x: margin.left, y: baseline - 12, ...axisStyle}, "01"),
          make("text", {x: W - margin.right, y: baseline - 12, "text-anchor": "end", ...axisStyle}, "202"),
          make("text", {x: W / 2, y: baseline - 12, "text-anchor": "middle", ...axisStyle}, "FAVORITE SEQUENCE / EXPORTED ORDER")
        );

        const marks = make("g");
        data.forEach(item => {
          const px = x(item.order);
          const top = baseline - recurrence(item.plays);
          const bottom = baseline + age(item.dateAdded);
          const playOpacity = (0.18 + 0.72 * Math.sqrt(item.plays / 1140)).toFixed(2);
          const playWidth = (0.8 + 2.6 * Math.sqrt(item.plays / 1140)).toFixed(2);
          const selectedNow = item.order === selected.order;
          const play = make("line", {
            x1: px,
            y1: baseline,
            x2: px,
            y2: top,
            stroke: selectedNow ? "var(--alt-green)" : "var(--alt-blue)",
            "data-base-stroke": "var(--alt-blue)",
            opacity: selectedNow ? "1" : playOpacity,
            "data-base-opacity": playOpacity,
            "stroke-width": playWidth,
            "stroke-linecap": "round",
            "data-track": item.order
          });
          const carried = make("line", {
            x1: px,
            y1: baseline,
            x2: px,
            y2: bottom,
            stroke: selectedNow ? "var(--alt-green)" : "var(--alt-amber)",
            "data-base-stroke": "var(--alt-amber)",
            opacity: selectedNow ? "1" : "0.42",
            "data-base-opacity": "0.42",
            "stroke-width": selectedNow ? "2.8" : "1.2",
            "data-track": item.order
          });
          const hit = make("line", {
            x1: px,
            y1: top - 5,
            x2: px,
            y2: bottom + 5,
            stroke: "transparent",
            "stroke-width": narrow ? "10" : "7",
            "data-item": item.order,
            role: "button",
            tabindex: "0",
            "aria-label": `${item.title} by ${item.artist}, ${item.plays.toLocaleString()} recorded plays`
          });
          hit.addEventListener("pointerenter", () => updateSelection(item));
          hit.addEventListener("click", () => updateSelection(item));
          hit.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              updateSelection(item);
            }
          });
          marks.append(play, carried, hit);
        });
        svg.append(marks);

        const annotations = [
          {title: "DEVOTION", order: 72, side: -1},
          {title: "ORDINARY", order: 147, side: -1},
          {title: "DENIAL IS A RIVER", order: 180, side: -1},
          {title: "DO I WANNA KNOW?", order: 28, side: 1},
          {title: "DELICATE", order: 75, side: 1}
        ];
        const annotationSize = narrow ? 21 : 15;
        annotations.forEach(note => {
          const item = data.find(entry => entry.order === note.order);
          const px = x(item.order);
          const y = note.side < 0 ? baseline - recurrence(item.plays) - 12 : baseline + age(item.dateAdded) + 24;
          const anchor = item.order > 165 ? "end" : item.order < 40 ? "start" : "middle";
          const text = note.side < 0 ? `${note.title} / ${item.plays.toLocaleString()}` : `${note.title} / SINCE ${item.dateAdded.slice(0, 4)}`;
          svg.append(make("text", {
            x: px,
            y,
            fill: "var(--alt-cream)",
            stroke: "#101312",
            "stroke-width": narrow ? "7" : "5",
            "paint-order": "stroke",
            "text-anchor": anchor,
            "font-size": annotationSize,
            "font-weight": "600"
          }, text));
        });

        updateSelection(selected);
      };

      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(render, 120);
      });
      render();
      loadingLabel.hidden = true;
    })
    .catch(error => {
      loadingLabel.textContent = "The interactive record could not be loaded.";
      console.error(error);
    });
})();
