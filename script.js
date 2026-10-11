/* =========================
   THEME TOGGLE
========================= */

(() => {
  const toggle = document.getElementById("themeToggle");

  if (!toggle) return;

  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("theme");
  } catch {
    // Storage may be unavailable.
  }

  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  function applyTheme(theme) {
    const dark = theme === "dark";

    document.body.classList.toggle("dark", dark);

    toggle.textContent = dark ? "☀️" : "🌙";

    toggle.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode"
    );

    toggle.setAttribute("aria-pressed", String(dark));

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#111410" : "#f7f7f2");
  }

  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  toggle.addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark");
    const theme = dark ? "dark" : "light";

    applyTheme(theme);

    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Theme switching still works without storage.
    }
  });
})();


/* =========================
   D3.JS HERO VISUALIZATION
========================= */

(() => {
  const svg = d3.select("#heroViz");

  if (svg.empty()) return;

  const width = 500;
  const height = 500;
  const count = 100;

  const hero = document.querySelector(".hero");

  const getAccent = () =>
    getComputedStyle(hero)
      .getPropertyValue("--hero-accent")
      .trim() || "#426b52";

  // Arrange points using a golden-angle spiral.
  const nodes = d3.range(count).map((i) => {
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    const radius = 25 + Math.sqrt(i / count) * 195;

    return {
      id: i,
      x: width / 2 + Math.cos(angle) * radius,
      y: height / 2 + Math.sin(angle) * radius,
      r: i % 9 === 0 ? 4 : 2
    };
  });

  // Connect nearby points.
  const links = [];

  nodes.forEach((node, i) => {
    nodes.slice(i + 1).forEach((other) => {
      const distance = Math.hypot(
        node.x - other.x,
        node.y - other.y
      );

      if (distance < 58) {
        links.push({
          source: node.id,
          target: other.id
        });
      }
    });
  });

  const root = svg.append("g");

  // Draw network connections.
  const lines = root
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("x1", (d) => nodes[d.source].x)
    .attr("y1", (d) => nodes[d.source].y)
    .attr("x2", (d) => nodes[d.target].x)
    .attr("y2", (d) => nodes[d.target].y)
    .attr("stroke", getAccent())
    .attr("stroke-opacity", 0.19)
    .attr("stroke-width", 0.7);

  // Draw network nodes.
  const dots = root
    .selectAll("circle.node")
    .data(nodes)
    .join("circle")
    .attr("class", "node")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", (d) => d.r)
    .attr("fill", getAccent())
    .attr("fill-opacity", (d) => d.r === 4 ? 0.95 : 0.55);

  /* =========================
     LIVELY NETWORK ANIMATION
  ========================= */

  const motion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // Give every node its own movement pattern.
  nodes.forEach((node) => {
    node.phase = Math.random() * Math.PI * 2;
    node.speed = 0.45 + Math.random() * 0.9;
    node.drift = 4 + Math.random() * 9;
    node.currentX = node.x;
    node.currentY = node.y;
  });

  // Highlight selected nodes as animated signals.
  const signals = root
    .selectAll("circle.signal")
    .data(nodes.filter((d) => d.id % 12 === 0))
    .join("circle")
    .attr("class", "signal")
    .attr("r", 4)
    .attr("fill", "#ffffff")
    .attr("stroke", getAccent())
    .attr("stroke-width", 2)
    .attr("pointer-events", "none");

  let frame;
  let startTime;

  function animate(time) {
    if (startTime === undefined) {
      startTime = time;
    }

    const elapsed = (time - startTime) / 1000;

    // Give the entire network a gentle floating motion.
    root.attr(
      "transform",
      `translate(${Math.sin(elapsed * 0.65) * 12}, ${Math.cos(elapsed * 0.5) * 12}) rotate(${Math.sin(elapsed * 0.22) * 2}, 250, 250)`
    );

    // Let every node drift independently.
    nodes.forEach((node) => {
      const t = elapsed * node.speed + node.phase;

      node.currentX =
        node.x + Math.cos(t) * node.drift;

      node.currentY =
        node.y + Math.sin(t * 0.83) * node.drift;
    });

    // Connections follow moving nodes and pulse gently.
    lines
      .attr("x1", (d) => nodes[d.source].currentX)
      .attr("y1", (d) => nodes[d.source].currentY)
      .attr("x2", (d) => nodes[d.target].currentX)
      .attr("y2", (d) => nodes[d.target].currentY)
      .attr("stroke-opacity", (d, i) =>
        0.12 +
        (0.16 * (1 + Math.sin(elapsed * 1.5 + i * 0.17))) / 2
      );

    // Nodes drift, pulse, and vary slightly in size.
    dots
      .attr("cx", (d) => d.currentX)
      .attr("cy", (d) => d.currentY)
      .attr("r", (d) =>
        (d.r === 4 ? 4 : 2) +
        (d.r === 4 ? 1.2 : 0.65) *
        (0.5 + 0.5 * Math.sin(elapsed * 2 + d.phase))
      )
      .attr("fill-opacity", (d) =>
        0.4 +
        0.6 * (0.5 + 0.5 * Math.sin(elapsed * 1.8 + d.phase))
      );

    // Highlighted points pulse as signals.
    signals
      .attr("cx", (d) => d.currentX)
      .attr("cy", (d) => d.currentY)
      .attr("r", (d) =>
        3 + 2 * (0.5 + 0.5 * Math.sin(elapsed * 3 + d.phase))
      )
      .attr("opacity", (d) =>
        0.45 +
        0.55 * (0.5 + 0.5 * Math.sin(elapsed * 2.5 + d.phase))
      );

    frame = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (frame !== undefined) {
      cancelAnimationFrame(frame);
      frame = undefined;
    }
  }

  function resetPositions() {
    root.attr("transform", null);

    nodes.forEach((node) => {
      node.currentX = node.x;
      node.currentY = node.y;
    });

    lines
      .attr("x1", (d) => nodes[d.source].x)
      .attr("y1", (d) => nodes[d.source].y)
      .attr("x2", (d) => nodes[d.target].x)
      .attr("y2", (d) => nodes[d.target].y)
      .attr("stroke-opacity", 0.19);

    dots
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.r)
      .attr("fill-opacity", (d) => d.r === 4 ? 0.95 : 0.55);

    signals.attr("opacity", 0);
  }

  function updateMotion() {
    stopAnimation();

    if (motion.matches) {
      resetPositions();
      return;
    }

    startTime = undefined;

    signals.attr("opacity", 1);

    frame = requestAnimationFrame(animate);
  }

  if (motion.addEventListener) {
    motion.addEventListener("change", updateMotion);
  } else {
    motion.addListener(updateMotion);
  }

  updateMotion();

  /* =========================
     THEME-AWARE COLORS
  ========================= */

  const observer = new MutationObserver(() => {
    const color = getAccent();

    lines.attr("stroke", color);
    dots.attr("fill", color);
    signals.attr("stroke", color);
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
})();
