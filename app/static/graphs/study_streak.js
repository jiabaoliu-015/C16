document.addEventListener("DOMContentLoaded", () => {
  const circles = document.getElementById("streak-circles");
  const message = document.getElementById("streak-message");
  const fire = document.getElementById("streak-fire");
  const longest = document.getElementById("longest-streak");
  const freezeBtn = document.getElementById("streak-freeze-btn");
  const shareBtn = document.getElementById("share-streak-btn");
  const toast = document.getElementById("streak-toast");
  const exportBtn = document.getElementById("export-streak-btn");

  function showToast(msg, color = "bg-green-600") {
    toast.textContent = msg;
    toast.className = `fixed bottom-6 right-6 ${color} text-white px-4 py-2 rounded-lg shadow-lg opacity-100 z-50`;
    setTimeout(() => {
      toast.className += " opacity-0 pointer-events-none";
    }, 2500); // Change 2500 to your desired duration in ms
  }

  async function loadStreak() {
    try {
      const res = await fetch("/api/study-streak");
      const data = await res.json();
      const streak = data.current_streak || 0;
      const maxStreak = data.longest_streak || streak;
      const freezeAvailable = data.freeze_available;

      // Render 7-day streak circles (no pulse, use .active for filled)
      let html = "";
      for (let i = 0; i < 7; i++) {
        html += `<div class="w-4 h-4 rounded-full border ${i < streak ? "active" : "bg-gray-200"}"></div>`;
      }
      circles.innerHTML = html;

      // Message
      if (streak > 0) {
        message.textContent = `You're on a ${streak}-day streak! Keep it up!`;
      } else {
        message.textContent = "No streak yet. Start studying today!";
      }

      // Fire icon for streak >= 3
      fire.style.display = streak >= 3 ? "inline" : "none";

      // Longest streak
      longest.textContent = `Longest streak: ${maxStreak} days`;

      // Freeze button
      if (freezeAvailable && streak === 0) {
        freezeBtn.classList.remove("hidden");
      } else {
        freezeBtn.classList.add("hidden");
      }
    } catch (e) {
      message.textContent = "Couldn't load streak data.";
      circles.innerHTML = "";
      fire.style.display = "none";
      longest.textContent = "";
      freezeBtn.classList.add("hidden");
    }
  }

  freezeBtn?.addEventListener("click", async () => {
    freezeBtn.disabled = true;
    try {
      const res = await fetch("/api/study-streak", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("Streak freeze used! Your streak is safe. 🧊");
        await loadStreak();
      } else {
        showToast(data.message || "Could not use streak freeze.", "bg-red-600");
      }
    } catch {
      showToast("Error using streak freeze.", "bg-red-600");
    }
    freezeBtn.disabled = false;
  });

  shareBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/study-streak");
      const data = await res.json();
      const streak = data.current_streak || 0;
      const shareText = `I'm on a ${streak}-day study streak with StudyTrackr! 📚🔥 #StudyTrackr`;
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        showToast("Streak copied! Share it anywhere.");
      }
    } catch {
      showToast("Couldn't share streak.", "bg-red-600");
    }
  });

  // Export streak as CSV
  exportBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/study-streak");
      const data = await res.json();
      const csv = `Current Streak,Longest Streak\n${data.current_streak},${data.longest_streak}\n`;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "study_streak.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Streak exported as CSV!");
    } catch {
      showToast("Couldn't export streak.", "bg-red-600");
    }
  });

  loadStreak();
});