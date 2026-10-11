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

  const lines = root
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("x1", d => nodes[d.source].x)
    .attr("y1", d => nodes[d.source].y)
    .attr("x2", d => nodes[d.target].x)
    .attr("y2", d => nodes[d.target].y)
    .attr("stroke", getAccent())
    .attr("stroke-opacity", 0.19)
    .attr("stroke-width", 0.7);

  const dots = root
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.r)
    .attr("fill", getAccent())
    .attr("fill-opacity", d => d.r === 4 ? 0.95 : 0.55);

  // Animate unless the user prefers reduced motion.
  const motion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let frame;

  function animate(time) {
    const t = time * 0.00015;

    root.attr(
      "transform",
      `translate(${Math.sin(t) * 5}, ${Math.cos(t * 0.8) * 5})`
    );

    dots
      .attr("cx", d => d.x + Math.sin(t + d.id) * 2)
      .attr("cy", d => d.y + Math.cos(t + d.id * 0.7) * 2);

    frame = requestAnimationFrame(animate);
  }

  function updateMotion() {
    if (frame !== undefined) {
      cancelAnimationFrame(frame);
      frame = undefined;
    }

    root.attr("transform", null);

    dots
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    if (!motion.matches) {
      frame = requestAnimationFrame(animate);
    }
  }

  if (motion.addEventListener) {
    motion.addEventListener("change", updateMotion);
  } else {
    motion.addListener(updateMotion);
  }

  updateMotion();

  // Update visualization colors when the theme changes.
  const observer = new MutationObserver(() => {
    const color = getAccent();

    lines.attr("stroke", color);
    dots.attr("fill", color);
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
})();
