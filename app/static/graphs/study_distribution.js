document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("studyDistChart").getContext("2d");
  const skeleton = document.getElementById("studyDistSkeleton");
  let chart;

  fetch("/api/study-distribution")
    .then(res => res.json())
    .then(data => {
      skeleton.style.opacity = 0;
      setTimeout(() => skeleton.style.display = "none", 300);

      // Use modern short labels
      const shortLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const minutes = data.map(d => d.minutes);

      chart = new Chart(ctx, {
        type: "radar",
        data: {
          labels: shortLabels,
          datasets: [{
            label: "Study Minutes",
            data: minutes,
            fill: true,
            backgroundColor: "rgba(59,130,246,0.15)",
            borderColor: "#2563eb",
            borderWidth: 3,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#2563eb",
            pointRadius: 7,
            pointHoverRadius: 11,
            pointBorderWidth: 2,
            pointHoverBackgroundColor: "#2563eb",
            pointHoverBorderColor: "#fff"
          }]
        },
        options: {
          responsive: true,
          layout: {
            padding: 0
          },
          plugins: {
            legend: { display: false },
            title: { display: false },
            subtitle: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: "#fff",
              titleColor: "#2563eb",
              bodyColor: "#334155",
              borderColor: "#2563eb",
              borderWidth: 1,
              callbacks: {
                title: ctx => ctx[0].label,
                label: ctx => ` ${ctx.formattedValue} min`
              },
              padding: 10,
              caretSize: 7,
              cornerRadius: 8
            },
            datalabels: {
              display: false
            }
          },
          elements: {
            line: {
              borderJoinStyle: "round"
            }
          },
          scales: {
            r: {
              angleLines: { color: "rgba(59,130,246,0.25)", lineWidth: 1.5 },
              grid: { color: "rgba(59,130,246,0.13)", lineWidth: 1.5 },
              pointLabels: {
                font: { size: 12, weight: "500", family: "'Inter', 'Segoe UI', sans-serif" },
                color: "#64748b",
                padding: 10
              },
              ticks: {
                display: false
              },
              min: 0,
              suggestedMax: Math.max(...minutes, 60) < 60 ? 60 : Math.ceil(Math.max(...minutes) / 30) * 30,
              beginAtZero: true
            }
          }
        },
        plugins: [ChartDataLabels]
      });
    });

  // Download as image
  document.getElementById("downloadStudyDist").addEventListener("click", () => {
    if (!chart) return;
    const link = document.createElement("a");
    link.href = chart.toBase64Image();
    link.download = "study-distribution.png";
    link.click();
  });
});