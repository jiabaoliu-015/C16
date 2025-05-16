document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("courseInsightsChart").getContext("2d");
  const skeleton = document.getElementById("courseInsightsSkeleton");
  const exportBtn = document.getElementById("downloadCourseInsights");

  // --- Add Range Toggle ---
  // Insert toggle above chart if not present
  let rangeToggle = document.getElementById("courseInsightsRangeToggle");
  if (!rangeToggle) {
    rangeToggle = document.createElement("div");
    rangeToggle.id = "courseInsightsRangeToggle";
    rangeToggle.className = "flex gap-2 mb-2";
    rangeToggle.innerHTML = `
      <button data-range="week" class="ci-range-btn px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">Week</button>
      <button data-range="month" class="ci-range-btn px-2 py-1 rounded text-xs font-medium">Month</button>
      <button data-range="overall" class="ci-range-btn px-2 py-1 rounded text-xs font-medium">Overall</button>
    `;
    // Insert before chart
    const chartSection = ctx.canvas.closest("section") || ctx.canvas.parentElement;
    chartSection.insertBefore(rangeToggle, chartSection.firstChild);
  }

  // --- Icon SVGs ---
  const icons = {
    time: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    prod: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"/><circle cx="5" cy="19" r="1"/></svg>`,
    sess: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M16 3v4a1 1 0 001 1h4"/></svg>`
  };

  // --- Color Palettes for Light/Dark ---
  function getColors() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark
      ? {
          bar: "rgba(59, 130, 246, 0.85)", // blue-400
          barShadow: "rgba(59,130,246,0.25)",
          prodLine: "#c4b5fd", // purple-300
          prodFill: "#a78bfa33",
          sessionBar: "rgba(34,197,94,0.5)", // green-400
          grid: "#334155",
          font: "#f1f5f9",
          tick: "#cbd5e1"
        }
      : {
          bar: "rgba(59, 130, 246, 0.75)", // blue-500
          barShadow: "rgba(59,130,246,0.10)",
          prodLine: "#a78bfa", // purple-400
          prodFill: "#a78bfa33",
          sessionBar: "rgba(16, 185, 129, 0.5)", // green-500
          grid: "#e0e7ef",
          font: "#334155",
          tick: "#64748b"
        };
  }

  // --- Chart Instance (for update) ---
  let chart = null;
  let lastRange = "week";

  function fetchAndRender(range = "week") {
    skeleton.style.opacity = 1;
    skeleton.style.display = "";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Add this line to get the empty state div
    const emptyDiv = document.getElementById("courseInsightsEmpty");
    if (emptyDiv) emptyDiv.style.display = "none";

    let url = "/api/course-insights";
    if (range !== "overall") url += "?range=" + range;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        skeleton.style.opacity = 0;
        setTimeout(() => (skeleton.style.display = "none"), 300);

        if (!data.length) {
          // Hide canvas, show empty state
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          if (emptyDiv) emptyDiv.style.display = "";
          return;
        }
        // Hide empty state if data exists
        if (emptyDiv) emptyDiv.style.display = "none";

        // Sort by total_minutes descending and take top 4
        const topSubjects = data
          .sort((a, b) => b.total_minutes - a.total_minutes)
          .slice(0, 4);

        const labels = topSubjects.map((d) =>
          d.course.length > 10 ? d.course.slice(0, 9) + "…" : d.course
        );
        const totalMins = topSubjects.map((d) => d.total_minutes);
        const avgProd = topSubjects.map((d) => d.avg_productivity);
        const sessionCount = topSubjects.map((d) => d.session_count);

        const colors = getColors();

        // Destroy previous chart if exists
        if (chart) chart.destroy();

        chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Study Time (hrs)",
                data: totalMins.map((m) => (m / 60).toFixed(2)),
                backgroundColor: colors.bar,
                borderRadius: 12,
                maxBarThickness: 22,
                minBarLength: 4,
                yAxisID: "y",
                barPercentage: 0.7,
                categoryPercentage: 0.7,
                borderSkipped: false,
                borderWidth: 0,
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                shadowBlur: 6,
                shadowColor: colors.barShadow,
              },
              {
                label: "Avg. Productivity",
                data: avgProd,
                type: "line",
                borderColor: colors.prodLine,
                backgroundColor: colors.prodFill,
                tension: 0.5,
                yAxisID: "y1",
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: colors.prodLine,
                pointBorderColor: "#fff",
                borderWidth: 3,
                order: 2,
                fill: false,
                cubicInterpolationMode: "monotone",
              },
              {
                label: "Sessions",
                data: sessionCount,
                backgroundColor: colors.sessionBar,
                borderRadius: 10,
                maxBarThickness: 16,
                minBarLength: 4,
                yAxisID: "y2",
                type: "bar",
                order: 3,
                hidden: true // Hide by default for clarity
              },
            ],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 900,
              easing: "easeOutQuart"
            },
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: {
                  boxWidth: 0,
                  font: { family: "'Inter','Manrope',sans-serif", size: 13, weight: 500 },
                  color: colors.font,
                  generateLabels: (chart) => {
                    return [
                      {
                        text: `⏱️ Duration`,
                        fillStyle: colors.bar,
                        strokeStyle: colors.bar,
                        hidden: !chart.isDatasetVisible(0),
                        datasetIndex: 0
                      },
                      {
                        text: `📈 Rating`,
                        fillStyle: colors.prodLine,
                        strokeStyle: colors.prodLine,
                        hidden: !chart.isDatasetVisible(1),
                        datasetIndex: 1
                      },
                      {
                        text: `📊 Sessions`,
                        fillStyle: colors.sessionBar,
                        strokeStyle: colors.sessionBar,
                        hidden: !chart.isDatasetVisible(2),
                        datasetIndex: 2
                      }
                    ];
                  },
                  usePointStyle: false,
                  // Render SVG icons in legend
                  text: (legendItem) => legendItem.text,
                  padding: 18
                }
              },
              tooltip: {
                backgroundColor: "#18181b",
                borderColor: "#a5b4fc",
                borderWidth: 1,
                titleFont: { family: "'Inter','Manrope',sans-serif", size: 13, weight: 600 },
                bodyFont: { family: "'Inter','Manrope',sans-serif", size: 13 },
                displayColors: false,
                callbacks: {
                  label: function (ctx) {
                    if (ctx.dataset.label === "Study Time (hrs)") {
                      return `⏱️ Studied for ${ctx.raw} hours`;
                    }
                    if (ctx.dataset.label === "Avg. Productivity") {
                      return `📈 Avg. Productivity: ${ctx.raw}/10`;
                    }
                    if (ctx.dataset.label === "Sessions") {
                      return `📊 ${ctx.raw} sessions`;
                    }
                    return ctx.raw;
                  },
                  title: function (ctx) {
                    return `Course: ${ctx[0].label}`;
                  }
                }
              },
              title: { display: false }
            },
            layout: {
              padding: { left: 4, right: 4, top: 4, bottom: 4 }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: false },
                grid: { color: colors.grid, drawBorder: false },
                ticks: { font: { family: "'Inter','Manrope',sans-serif", size: 13 }, color: "#334155" }
              },
              x: {
                beginAtZero: true,
                title: { display: false },
                grid: { color: "#f1f5f9", drawBorder: false },
                ticks: { font: { family: "'Inter','Manrope',sans-serif", size: 12 }, color: colors.tick }
              },
              y1: {
                beginAtZero: true,
                position: "right",
                title: { display: false },
                grid: { drawOnChartArea: false },
                min: 0,
                max: 10,
                ticks: { stepSize: 2, font: { size: 11 }, color: colors.prodLine },
                display: false
              },
              y2: {
                beginAtZero: true,
                position: "right",
                title: { display: false },
                grid: { drawOnChartArea: false },
                offset: true,
                display: false,
              },
            },
            onClick: (evt, elements) => {
              // Clickable bars/points for details
              if (elements.length > 0) {
                const idx = elements[0].index;
                const course = labels[idx];
                // Show modal or alert with details (replace with your modal logic)
                const d = topSubjects[idx];
                alert(
                  `Course: ${d.course}\n` +
                  `Total Study Time: ${(d.total_minutes/60).toFixed(2)} hrs\n` +
                  `Avg. Productivity: ${d.avg_productivity}/10\n` +
                  `Sessions: ${d.session_count}`
                );
              }
            }
          },
          plugins: [{
            // Custom plugin for bar shadow (for depth)
            beforeDraw: (chart) => {
              const ctx = chart.ctx;
              chart.data.datasets.forEach((ds, i) => {
                if (i === 0) {
                  ctx.save();
                  ctx.shadowColor = colors.barShadow;
                  ctx.shadowBlur = 8;
                  ctx.shadowOffsetX = 2;
                  ctx.shadowOffsetY = 2;
                  ctx.restore();
                }
              });
            }
          }]
        });

        // Animate line drawing (Chart.js handles this with cubicInterpolationMode)
      })
      .catch(() => {
        skeleton.style.opacity = 0;
        setTimeout(() => (skeleton.style.display = "none"), 300);
        ctx.font = "14px 'Inter', 'Manrope', sans-serif";
        ctx.fillStyle = "#888";
        ctx.fillText("Failed to load course insights.", 24, 60);
      });
  }

  // --- Range Toggle Events ---
  rangeToggle.querySelectorAll(".ci-range-btn").forEach((btn) => {
    btn.onclick = function () {
      rangeToggle.querySelectorAll(".ci-range-btn").forEach(b => b.classList.remove("bg-blue-100", "text-blue-700"));
      this.classList.add("bg-blue-100", "text-blue-700");
      fetchAndRender(this.dataset.range);
      lastRange = this.dataset.range;
    };
  });

  // --- Export as image ---
  exportBtn.addEventListener("click", function () {
    if (!chart) return;
    const url = chart.toBase64Image();
    const a = document.createElement("a");
    a.href = url;
    a.download = "course_insights.png";
    a.click();
  });

  // --- Initial Render ---
  fetchAndRender(lastRange);

  // --- Dark mode re-render on theme change ---
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    fetchAndRender(lastRange);
  });
});