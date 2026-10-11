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

  const motion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const root = svg.append("g");
  const accent = getAccent();

  const columns = ["ID", "X", "Y", "GROUP"];
  const rows = d3.range(12).map((i) => {
    const x = 12 + i * 6.1;
    const y = 18 + Math.sin(i * 0.8) * 5 + i * 2.2;

    return {
      id: String(1042 + i),
      x,
      y,
      group: i % 3 === 0 ? "B" : "A",
      tableX: 90 + (i % 4) * 85,
      tableY: 145 + Math.floor(i / 4) * 75
    };
  });

  const xScale = d3.scaleLinear()
    .domain([0, 85])
    .range([95, 405]);

  const yScale = d3.scaleLinear()
    .domain([0, 50])
    .range([395, 105]);

  // Small label at the top of the visualization.
  const label = root.append("text")
    .attr("x", 250)
    .attr("y", 65)
    .attr("text-anchor", "middle")
    .attr("font-family", "monospace")
    .attr("font-size", 11)
    .attr("letter-spacing", 2)
    .attr("fill", accent)
    .text("RAW DATA");

  // Table headings.
  const table = root.append("g");

  table.selectAll("text.heading")
    .data(columns)
    .join("text")
    .attr("class", "heading")
    .attr("x", (d, i) => 78 + i * 92)
    .attr("y", 112)
    .attr("font-family", "monospace")
    .attr("font-size", 10)
    .attr("fill", accent)
    .text((d) => d);

  // Table rows.
  const tableRows = table.selectAll("g.row")
    .data(rows)
    .join("g")
    .attr("class", "row")
    .attr("transform", (d, i) => `translate(0, ${130 + i * 25})`);

  tableRows.append("line")
    .attr("x1", 70)
    .attr("x2", 430)
    .attr("y1", 8)
    .attr("y2", 8)
    .attr("stroke", accent)
    .attr("stroke-opacity", 0.18);

  tableRows.each(function (d) {
    const row = d3.select(this);
    const values = [d.id, d.x.toFixed(1), d.y.toFixed(1), d.group];

    row.selectAll("text")
      .data(values)
      .join("text")
      .attr("x", (value, i) => 78 + i * 92)
      .attr("y", 0)
      .attr("font-family", "monospace")
      .attr("font-size", 10)
      .attr("fill", accent)
      .attr("fill-opacity", 0.85)
      .text((value) => value);
  });

  // Chart axes, initially hidden.
  const chart = root.append("g")
    .attr("opacity", 0);

  chart.append("line")
    .attr("x1", 85)
    .attr("x2", 85)
    .attr("y1", 100)
    .attr("y2", 405)
    .attr("stroke", accent)
    .attr("stroke-opacity", 0.6);

  chart.append("line")
    .attr("x1", 85)
    .attr("x2", 420)
    .attr("y1", 405)
    .attr("y2", 405)
    .attr("stroke", accent)
    .attr("stroke-opacity", 0.6);

  chart.append("text")
    .attr("x", 250)
    .attr("y", 445)
    .attr("text-anchor", "middle")
    .attr("font-family", "monospace")
    .attr("font-size", 11)
    .attr("fill", accent)
    .text("VARIABLE X");

  chart.append("text")
    .attr("transform", "translate(45,250) rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-family", "monospace")
    .attr("font-size", 11)
    .attr("fill", accent)
    .text("VARIABLE Y");

  // Points start in table-like positions, then move into the chart.
  const points = root.selectAll("circle.point")
    .data(rows)
    .join("circle")
    .attr("class", "point")
    .attr("cx", (d) => d.tableX)
    .attr("cy", (d) => d.tableY)
    .attr("r", 4)
    .attr("fill", accent)
    .attr("fill-opacity", 0);

  const trend = chart.append("line")
    .attr("x1", xScale(5))
    .attr("y1", yScale(8))
    .attr("x2", xScale(80))
    .attr("y2", yScale(38))
    .attr("stroke", accent)
    .attr("stroke-width", 2.5)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", "500")
    .attr("stroke-dashoffset", 500);

  let timers = [];
  let cycleId = 0;

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
    root.selectAll("*").interrupt();
  }

  function later(callback, delay, id) {
    timers.push(setTimeout(() => {
      if (id === cycleId) callback();
    }, delay));
  }

  function showTable() {
    const id = ++cycleId;
    clearTimers();

    label.text("RAW DATA");
    table.interrupt().attr("opacity", 1);
    chart.interrupt().attr("opacity", 0);
    trend.interrupt().attr("stroke-dashoffset", 500);

    points.interrupt()
      .attr("cx", (d) => d.tableX)
      .attr("cy", (d) => d.tableY)
      .attr("r", 4)
      .attr("fill-opacity", 0);

    if (motion.matches) {
      showChart(true);
      return;
    }

    later(() => showChart(false), 2300, id);
  }

  function showChart(instant = false) {
    const id = cycleId;
    const duration = instant ? 0 : 1500;

    label.text("PATTERNS EMERGE");

    table.transition()
      .duration(duration)
      .attr("opacity", 0);

    chart.transition()
      .duration(duration)
      .attr("opacity", 1);

    points.transition()
      .duration(duration)
      .delay((d, i) => instant ? 0 : i * 35)
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 5)
      .attr("fill-opacity", 0.9);

    if (!instant) {
      later(() => {
        label.text("TREND REVEALED");

        trend.transition()
          .duration(1100)
          .attr("stroke-dashoffset", 0);
      }, 1750, id);

      later(showTable, 5200, id);
    }
  }

  // Update colors when the light/dark theme changes.
  const observer = new MutationObserver(() => {
    const color = getAccent();

    root.selectAll("text").attr("fill", color);
    root.selectAll("line").attr("stroke", color);
    points.attr("fill", color);
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  if (motion.matches) {
    showTable();
  } else {
    showTable();
  }

  function handleMotionChange() {
    showTable();
  }

  if (motion.addEventListener) {
    motion.addEventListener("change", handleMotionChange);
  } else {
    motion.addListener(handleMotionChange);
  }
})();


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
