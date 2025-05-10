document.addEventListener("DOMContentLoaded", () => {
  // Configurable weekly goal (in minutes)
  const WEEKLY_GOAL_MINUTES = 20 * 60;

  fetch("/api/user-stats")
    .then(res => res.json())
    .then(stats => {
      // Find "This Week" and "Last Week" stats
      const thisWeek = stats.find(s => s.label === "This Week");
      // For last week, we need to calculate from the delta and this week's value
      // We'll fetch prev week value from the delta if possible, else fallback
      let lastWeekMinutes = null;
      let thisWeekMinutes = parseMinutes(thisWeek.value);

      if (thisWeek.delta !== "-" && thisWeek.delta !== undefined && thisWeek.delta !== null) {
        // delta = ((thisWeek - lastWeek) / lastWeek) * 100
        // => lastWeek = thisWeek / (1 + delta/100)
        let deltaNum = parseFloat(thisWeek.delta.replace("%", ""));
        if (!isNaN(deltaNum)) {
          lastWeekMinutes = Math.round(thisWeekMinutes / (1 + (deltaNum / 100)));
        }
      }
      // Fallback: just show "--" if not available
      document.getElementById("last-week-time").textContent = lastWeekMinutes !== null
        ? formatMinutes(lastWeekMinutes)
        : "--";
      document.getElementById("this-week-time").textContent = thisWeek.value;

      // Delta
      const deltaSpan = document.getElementById("week-delta");
      const deltaValue = document.getElementById("delta-value");
      const deltaArrow = document.getElementById("delta-arrow");
      const deltaArrowPath = document.getElementById("delta-arrow-path");
      deltaValue.textContent = thisWeek.delta;

      // Set color and arrow
      deltaSpan.classList.remove("text-green-600", "text-red-600", "text-gray-500");
      deltaArrow.classList.add("hidden");
      if (thisWeek.deltaType === "positive") {
        deltaSpan.classList.add("text-green-600");
        deltaArrow.classList.remove("hidden");
        deltaArrowPath.setAttribute("d", "M5 10l7-7 7 7"); // Up arrow
      } else if (thisWeek.deltaType === "negative") {
        deltaSpan.classList.add("text-red-600");
        deltaArrow.classList.remove("hidden");
        deltaArrowPath.setAttribute("d", "M19 14l-7 7-7-7"); // Down arrow
      } else {
        deltaSpan.classList.add("text-gray-500");
      }

      // Progress bar
      const progress = Math.min(100, (thisWeekMinutes / WEEKLY_GOAL_MINUTES) * 100);
      document.getElementById("week-progress-bar").style.width = `${progress}%`;

      // Motivational message
      const msg = document.getElementById("weekly-message");
      if (thisWeek.deltaType === "positive") {
        msg.textContent = "Awesome! You studied more than last week. 🎉";
      } else if (thisWeek.deltaType === "negative") {
        msg.textContent = "Try to beat last week's total next time!";
      } else {
        msg.textContent = "Consistent effort! Keep it up!";
      }
    })
    .catch(() => {
      document.getElementById("last-week-time").textContent = "--";
      document.getElementById("this-week-time").textContent = "--";
      document.getElementById("delta-value").textContent = "--";
      document.getElementById("weekly-message").textContent = "Unable to load weekly stats.";
    });

  function parseMinutes(str) {
    // Accepts "18h 45m" or "45m"
    let h = 0, m = 0;
    if (!str) return 0;
    const hMatch = str.match(/(\d+)h/);
    const mMatch = str.match(/(\d+)m/);
    if (hMatch) h = parseInt(hMatch[1]);
    if (mMatch) m = parseInt(mMatch[1]);
    return h * 60 + m;
  }
  function formatMinutes(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }
});