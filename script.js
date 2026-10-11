
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
  const hero = document.querySelector(".hero");

  if (!hero) return;

  const getAccent = () =>
    getComputedStyle(hero)
      .getPropertyValue("--hero-accent")
      .trim() || "#426b52";

  const groupColor = (group) =>
    group === "A" ? getAccent() : "#d97757";

  const motion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const root = svg.append("g").attr("class", "hero-data-viz");

  // -------------------------
  // DATA
  // -------------------------

  const data = d3.range(12).map((i) => ({
    id: 1042 + i,
    x: 8 + i * 6.1,
    y: 12 + i * 2.15 + Math.sin(i * 1.1) * 5,
    group: i % 3 === 0 ? "B" : "A"
  }));

  const groups = ["A", "B"];

  const xScale = d3.scaleLinear()
    .domain([0, 85])
    .range([95, 415]);

  const yScale = d3.scaleLinear()
    .domain([0, 50])
    .range([400, 110]);

  // Calculate a separate least-squares regression for each group.
  function calculateTrend(groupData) {
    const n = groupData.length;

    const meanX = d3.mean(groupData, (d) => d.x);
    const meanY = d3.mean(groupData, (d) => d.y);

    const numerator = d3.sum(
      groupData,
      (d) => (d.x - meanX) * (d.y - meanY)
    );

    const denominator = d3.sum(
      groupData,
      (d) => (d.x - meanX) ** 2
    );

    const slope = denominator ? numerator / denominator : 0;
    const intercept = meanY - slope * meanX;

    const minX = d3.min(groupData, (d) => d.x);
    const maxX = d3.max(groupData, (d) => d.x);

    return {
      group: groupData[0].group,
      x1: xScale(minX),
      y1: yScale(intercept + slope * minX),
      x2: xScale(maxX),
      y2: yScale(intercept + slope * maxX)
    };
  }

  const trends = groups.map((group) =>
    calculateTrend(data.filter((d) => d.group === group))
  );

  // -------------------------
  // HEADING
  // -------------------------

  const heading = root.append("text")
    .attr("class", "viz-label")
    .attr("x", width / 2)
    .attr("y", 70)
    .attr("text-anchor", "middle")
    .attr("font-family", "monospace")
    .attr("font-size", 11)
    .attr("letter-spacing", 2)
    .attr("fill", getAccent())
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
    .attr("fill", getAccent())
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
    .attr("stroke", getAccent())
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
      .attr("fill", getAccent())
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
    .attr("stroke", getAccent())
    .attr("stroke-opacity", 0.14)
    .attr("stroke-dasharray", "3 5");

  const axes = chart.append("g")
    .attr("class", "chart-axes")
    .attr("fill", "none")
    .attr("stroke", getAccent())
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
    .attr("fill", getAccent())
    .text("VARIABLE X");

  chart.append("text")
    .attr("class", "axis-label")
    .attr("transform", "translate(48,255) rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-family", "monospace")
    .attr("font-size", 10)
    .attr("fill", getAccent())
    .text("VARIABLE Y");

  // Points retain their group-specific colors.
  const points = chart.selectAll(".chart-point")
    .data(data)
    .join("circle")
    .attr("class", "chart-point")
    .attr("cx", (d, i) => 80 + (i % 4) * 88)
    .attr("cy", (d, i) => 145 + Math.floor(i / 4) * 65)
    .attr("r", 4)
    .attr("fill", (d) => groupColor(d.group))
    .attr("fill-opacity", 0);

  // One independently calculated trend line per group.
  const trendLines = chart.selectAll(".trend-line")
    .data(trends)
    .join("line")
    .attr("class", (d) => `trend-line trend-${d.group.toLowerCase()}`)
    .attr("x1", (d) => d.x1)
    .attr("y1", (d) => d.y1)
    .attr("x2", (d) => d.x2)
    .attr("y2", (d) => d.y2)
    .attr("stroke", (d) => groupColor(d.group))
    .attr("stroke-width", 2.5)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", 400)
    .attr("stroke-dashoffset", 400);

  // -------------------------
  // LEGEND
  // -------------------------

  const legend = chart.append("g")
    .attr("class", "chart-legend")
    .attr("transform", "translate(165,475)");

  const legendItems = legend.selectAll(".legend-item")
    .data(groups)
    .join("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(${i * 110}, 0)`);

  legendItems.append("circle")
    .attr("r", 4)
    .attr("fill", (d) => groupColor(d));

  legendItems.append("text")
    .attr("x", 10)
    .attr("y", 4)
    .attr("font-family", "monospace")
    .attr("font-size", 10)
    .attr("fill", (d) => groupColor(d))
    .text((d) => `GROUP ${d}`);

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
    heading.text("GROUP TRENDS REVEALED");

    chart.attr("opacity", 1);

    points
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4.5)
      .attr("fill", (d) => groupColor(d.group))
      .attr("fill-opacity", 0.9);

    trendLines.attr("stroke-dashoffset", 0);
  }

  function runCycle() {
    if (destroyed) return;

    stopTransitions();

    if (motion.matches) {
      showStaticChart();
      return;
    }

    heading.text("RAW DATA");
    table.attr("opacity", 1);

    points
      .attr("cx", (d, i) => 80 + (i % 4) * 88)
      .attr("cy", (d, i) => 145 + Math.floor(i / 4) * 65)
      .attr("r", 3)
      .attr("fill", (d) => groupColor(d.group))
      .attr("fill-opacity", 0);

    chart.attr("opacity", 0);
    trendLines.attr("stroke-dashoffset", 400);

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

        points.transition()
          .duration(1300)
          .delay((d, i) => i * 35)
          .attr("cx", (d) => xScale(d.x))
          .attr("cy", (d) => yScale(d.y))
          .attr("r", 4.5)
          .attr("fill", (d) => groupColor(d.group))
          .attr("fill-opacity", 0.9);

        // Reveal both group-specific trends after the points appear.
        cycleTimer = setTimeout(() => {
          if (destroyed || motion.matches) return;

          heading.text("GROUP TRENDS REVEALED");

          trendLines.transition()
            .duration(1000)
            .attr("stroke-dashoffset", 0)
            .on("end", function (d, i, nodes) {
              if (i !== nodes.length - 1) return;
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

  // -------------------------
  // THEME COLOR UPDATES
  // -------------------------

  const observer = new MutationObserver(() => {
    const color = getAccent();

    root.selectAll(
      ".viz-label, .table-heading, .table-value, .axis-label"
    ).attr("fill", color);

    root.selectAll(
      ".table-rule, .chart-grid line, .chart-axes line"
    ).attr("stroke", color);

    // Group A follows the theme; Group B remains coral.
    points.attr("fill", (d) => groupColor(d.group));

    trendLines.attr("stroke", (d) => groupColor(d.group));

    legendItems.select("circle")
      .attr("fill", (d) => groupColor(d));

    legendItems.select("text")
      .attr("fill", (d) => groupColor(d));
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  updateMotion();

  // -------------------------
  // CLEANUP
  // -------------------------

  window.addEventListener("pagehide", () => {
    destroyed = true;
    stopTransitions();
    observer.disconnect();

    if (motion.removeEventListener) {
      motion.removeEventListener("change", updateMotion);
    } else {
      motion.removeListener(updateMotion);
    }
  }, { once: true });
})();
