const statsData = [
    {
      label: "Today",
      icon: "clock",
      value: "30m / 1h",
      delta: "+10%",
      deltaType: "positive",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      textColor: "text-blue-800",
    },
    {
      label: "Sessions",
      icon: "play-circle",
      value: "2",
      delta: "-1",
      deltaType: "negative",
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
      textColor: "text-green-800",
    },
    {
      label: "Avg. Duration",
      icon: "timer",
      value: "48m",
      delta: "+5%",
      deltaType: "positive",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-500",
      textColor: "text-yellow-800",
    },
    {
      label: "Avg. Productivity",
      icon: "activity",
      value: "78%",
      delta: "+2%",
      deltaType: "positive",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
      textColor: "text-purple-800",
    },
    {
      label: "This Week",
      icon: "calendar-days",
      value: "18h 45m",
      delta: "+1h",
      deltaType: "positive",
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
      textColor: "text-red-800",
    },
  ];
  
function renderStats(stats) {
    const container = document.getElementById("stats-container");
    container.innerHTML = ""; // Clear previous

    stats.forEach(stat => {
        let deltaIcon, deltaColor;
        if (stat.deltaType === "positive") {
            deltaIcon = "arrow-up-right";
            deltaColor = "text-green-500";
        } else if (stat.deltaType === "negative") {
            deltaIcon = "arrow-down-right";
            deltaColor = "text-red-500";
        } else {
            deltaIcon = "minus";
            deltaColor = "text-gray-400";
        }

        const card = document.createElement("div");
        card.className = `flex items-center gap-2 ${stat.bgColor} px-4 py-2 rounded-xl shadow-sm transition-transform hover:scale-105 group`;

        card.innerHTML = `
            <i class="lucide ${stat.iconColor}" data-lucide="${stat.icon}"></i>
            <div class="flex flex-col items-start">
                <span class="text-xs text-gray-500">${stat.label}</span>
                <span class="font-semibold ${stat.textColor} flex items-center gap-1">
                    ${stat.value}
                    <span class="ml-1 ${deltaColor} flex items-center text-xs">
                        <i class="lucide ${deltaColor}" data-lucide="${deltaIcon}"></i>${stat.delta}
                    </span>
                </span>
            </div>
        `;

        container.appendChild(card);
    });

    lucide.createIcons();
}

// Fetch stats from backend
document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/user-stats")
        .then(res => res.json())
        .then(data => renderStats(data))
        .catch(() => renderStats([]));
});
