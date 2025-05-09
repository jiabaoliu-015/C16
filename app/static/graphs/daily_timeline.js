document.addEventListener("DOMContentLoaded", async () => {
  const timeline = document.getElementById("dailyTimeline");
  const skeleton = document.getElementById("dailyTimelineSkeleton");

  const formatDate = (date = new Date()) =>
    new Intl.DateTimeFormat("en-GB").format(date); // DD/MM/YYYY

  const formatTime = (time) => time.padStart(5, "0");

  const prodColor = (rating) => {
    if (rating >= 8) return "bg-green-400 border-green-500";
    if (rating >= 5) return "bg-yellow-300 border-yellow-400";
    return "bg-red-300 border-red-400";
  };

  const iconBreaks = () => `
    <svg class="inline w-4 h-4 text-blue-400 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
    </svg>`;

  const iconProd = () => `
    <svg class="inline w-4 h-4 text-purple-400 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path d="M12 20V4m0 0l-4 4m4-4l4 4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const renderSession = ({ time, duration, break_minutes = 0, course = "N/A", productivity = 0, notes = "" }) => {
    const [start, end] = time.split(" - ").map(formatTime);
    const breaks = break_minutes;
    const prod = productivity;
    const colorClass = prodColor(prod);

    return `
      <article class="relative flex items-start group mb-6 last:mb-0 animate-fade-in">
        <div class="absolute left-[-1.1rem] top-2">
          <div class="w-4 h-4 rounded-full border-4 ${colorClass} shadow transition-all duration-200"></div>
        </div>
        <div class="flex-1 ml-2 bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-lg transition relative">
          <div class="flex justify-between items-center mb-1">
            <time class="font-bold text-blue-700 text-base">${start}<span class="mx-1 text-gray-400">–</span>${end}</time>
            <span class="text-xs text-gray-400">${duration}</span>
          </div>
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-medium text-gray-700">${course}</span>
            <span class="text-xs text-gray-500 flex items-center">${iconBreaks()}${breaks}m break${breaks === 1 ? "" : "s"}</span>
          </div>
          ${notes ? `<p class="text-xs text-gray-500 mt-1 italic">"${notes}"</p>` : ""}
          <span class="absolute top-2 right-3 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold flex items-center shadow-sm">
            ${iconProd()}${prod}/10
          </span>
        </div>
      </article>`;
  };

  try {
    const res = await fetch("/api/sessions");
    const sessions = await res.json();
    const today = formatDate();
    const todaySessions = sessions.filter((s) => s.date === today);

    skeleton.classList.add("hidden");
    timeline.classList.remove("hidden");
    timeline.innerHTML = "";

    if (todaySessions.length === 0) {
      timeline.innerHTML = `<div class="text-gray-400 text-center py-8">No study sessions logged today.</div>`;
      return;
    }

    todaySessions.sort((a, b) => a.time.localeCompare(b.time));

    timeline.innerHTML = `
      <div class="relative pl-8">
        <div class="absolute left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 to-indigo-200 rounded-full opacity-70"></div>
        <div id="timelineSessions"></div>
      </div>`;

    const sessionList = document.getElementById("timelineSessions");
    const html = todaySessions.map(renderSession).join("");
    sessionList.innerHTML = html;

  } catch (error) {
    console.error(error);
    skeleton.classList.add("hidden");
    timeline.classList.remove("hidden");
    timeline.innerHTML = `<div class="text-red-400 text-center py-8">Failed to load timeline.</div>`;
  }
});
