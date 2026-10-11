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
  const hero = document.querySelector(".hero");

  const getAccent = () =>
    getComputedStyle(hero)
      .getPropertyValue("--hero-accent")
      .trim() || "#426b52";

  const accent = getAccent();
  const motion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const root = svg.append("g").attr("class", "hero-data-viz");

  // Synthetic data for the table and scatter plot.
  const data = d3.range(12).map((i) => ({
    id: 1042 + i,
    x: 8 + i * 6.1,
    y: 12 + i * 2.15 + Math.sin(i * 1.1) * 5,
    group: i % 3 === 0 ? "B" : "A"
  }));

  const xScale = d3.scaleLinear()
    .domain([0, 85])
    .range([95, 415]);

  const yScale = d3.scaleLinear()
    .domain([0, 50])
    .range([400, 110]);

  // Small heading above the graphic.
  const heading = root.append("text")
    .attr("class", "viz-label")
    .attr("x", width / 2)
    .attr("y", 70)
    .attr("text-anchor", "middle")
    .attr("font-family", "monospace")
    .attr("font-size", 11)
    .attr("letter-spacing", 2)
    .attr("fill", accent)
    .text("RAW DATA");

  // -------------------------
  // TABLE
  // -------------------------

  const table = root.append("g")
    .attr("class", "data-table");

  const columns = [
    { label: "ID", x: 76 },
    { label: "X", x: 165 },
    { label: "Y", x: 255 },
    { label: "GROUP", x: 345 }
  ];

  table.selectAll(".table-heading")
    .data(columns)
    .join("text")
    .attr("class", "table-heading")
    .attr("x", (d) => d.x)
    .attr("y", 112)
    .attr("font-family", "monospace")
    .attr("font-size", 10)
    .attr("fill", accent)
    .text((d) => d.label);

  const rows = table.selectAll(".table-row")
    .data(data)
    .join("g")
    .attr("class", "table-row")
    .attr("transform", (d, i) =>
      `translate(0, ${137 + i * 22})`
    );

  rows.append("line")
    .attr("class", "table-rule")
    .attr("x1", 68)
    .attr("x2", 430)
    .attr("y1", 6)
    .attr("y2", 6)
    .attr("stroke", accent)
    .attr("stroke-opacity", 0.2);

  rows.each(function (d) {
    const values = [
      d.id,
      d.x.toFixed(1),
      d.y.toFixed(1),
      d.group
    ];

    d3.select(this)
      .selectAll("text")
      .data(values)
      .join("text")
      .attr("class", "table-value")
      .attr("x", (value, i) => columns[i].x)
      .attr("y", 0)
      .attr("font-family", "monospace")
      .attr("font-size", 10)
      .attr("fill", accent)
      .attr("fill-opacity", 0.85)
      .text((value) => value);
  });

  // -------------------------
  // SCATTER PLOT
  // -------------------------

  const chart = root.append("g")
    .attr("class", "data-chart")
    .attr("opacity", 0);

  const grid = chart.append("g")
    .attr("class", "chart-grid");

  grid.selectAll("line")
    .data([10, 20, 30, 40])
    .join("line")
    .attr("x1", 85)
    .attr("x2", 420)
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d))
    .attr("stroke", accent)
    .attr("stroke-opacity", 0.14)
    .attr("stroke-dasharray", "3 5");

  const axes = chart.append("g")
    .attr("class", "chart-axes")
    .attr("fill", "none")
    .attr("stroke", accent)
    .attr("stroke-opacity", 0.75);

  axes.append("line")
    .attr("x1", 85)
    .attr("x2", 85)
    .attr("y1", 105)
    .attr("y2", 405);

  axes.append("line")
    .attr("x1", 85)
    .attr("x2", 420)
    .attr("y1", 405)
    .attr("y2", 405);

  chart.append("text")
    .attr("class", "axis-label")
    .attr("x", 250)
    .attr("y", 445)
    .attr("text-anchor", "middle")
    .attr("font-family", "monospace")
    .attr("font-size", 10)
    .attr("fill", accent)
    .text("VARIABLE X");

  chart.append("text")
    .attr("class", "axis-label")
    .attr("transform", "translate(48,255) rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-family", "monospace")
    .attr("font-size", 10)
    .attr("fill", accent)
    .text("VARIABLE Y");

  // Points begin in table-like positions.
  const points = chart.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("class", "chart-point")
    .attr("cx", (d, i) => 80 + (i % 4) * 88)
    .attr("cy", (d, i) => 145 + Math.floor(i / 4) * 65)
    .attr("r", 4)
    .attr("fill", accent)
    .attr("fill-opacity", 0);

  const trend = chart.append("line")
    .attr("class", "trend-line")
    .attr("x1", xScale(5))
    .attr("y1", yScale(15))
    .attr("x2", xScale(75))
    .attr("y2", yScale(35))
    .attr("stroke", accent)
    .attr("stroke-width", 2.5)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", 400)
    .attr("stroke-dashoffset", 400);

  // -------------------------
  // ANIMATION
  // -------------------------

  let cycleTimer;
  let destroyed = false;

  function stopTransitions() {
    root.selectAll("*").interrupt();

    if (cycleTimer) {
      clearTimeout(cycleTimer);
      cycleTimer = undefined;
    }
  }

  function showStaticChart() {
    stopTransitions();

    table.attr("opacity", 0);
    heading.text("PATTERNS EMERGE");

    chart.attr("opacity", 1);

    points
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4.5)
      .attr("fill-opacity", 0.9);

    trend.attr("stroke-dashoffset", 0);
  }

  function runCycle() {
    if (destroyed) return;

    stopTransitions();

    if (motion.matches) {
      showStaticChart();
      return;
    }

    // Start with the dense data table.
    heading.text("RAW DATA");
    table.attr("opacity", 1);

    points
      .attr("cx", (d, i) => 80 + (i % 4) * 88)
      .attr("cy", (d, i) => 145 + Math.floor(i / 4) * 65)
      .attr("r", 3)
      .attr("fill-opacity", 0);

    chart.attr("opacity", 0);
    trend.attr("stroke-dashoffset", 400);

    // Fade the table away.
    table.transition()
      .delay(2200)
      .duration(500)
      .attr("opacity", 0)
      .on("end", () => {
        if (destroyed || motion.matches) return;

        heading.text("PATTERNS EMERGE");

        chart.transition()
          .duration(600)
          .attr("opacity", 1);

        // Transform the data points into the scatter plot.
        points.transition()
          .duration(1300)
          .delay((d, i) => i * 35)
          .attr("cx", (d) => xScale(d.x))
          .attr("cy", (d) => yScale(d.y))
          .attr("r", 4.5)
          .attr("fill-opacity", 0.9);

        // Reveal the trend after the points have appeared.
        cycleTimer = setTimeout(() => {
          if (destroyed || motion.matches) return;

          heading.text("TREND REVEALED");

          trend.transition()
            .duration(1000)
            .attr("stroke-dashoffset", 0)
            .on("end", () => {
              if (destroyed || motion.matches) return;

              cycleTimer = setTimeout(runCycle, 1800);
            });
        }, 1900);
      });
  }

  function updateMotion() {
    stopTransitions();

    if (motion.matches) {
      showStaticChart();
    } else {
      runCycle();
    }
  }

  if (motion.addEventListener) {
    motion.addEventListener("change", updateMotion);
  } else {
    motion.addListener(updateMotion);
  }

  // Keep visualization colors synchronized with the theme.
  const observer = new MutationObserver(() => {
    const color = getAccent();

    root.selectAll(
      ".viz-label, .table-heading, .table-value, .axis-label"
    ).attr("fill", color);

    root.selectAll(
      ".table-rule, .chart-grid line, .chart-axes line, .trend-line"
    ).attr("stroke", color);

    points.attr("fill", color);
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  updateMotion();

  // Clean up when leaving the page.
  window.addEventListener("pagehide", () => {
    destroyed = true;
    stopTransitions();
    observer.disconnect();
  }, { once: true });
})();
