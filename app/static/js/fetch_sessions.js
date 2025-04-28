document.addEventListener("DOMContentLoaded", () => {
    const sessionList = document.getElementById("session-list");
    const sessionCount = document.getElementById("session-count"); // Reference to session count element
    const dateToggle = document.getElementById("date-toggle");
    const showNotesToggle = document.getElementById("show-notes");
    const selectAllCheckbox = document.getElementById("select-all");
    let sessions = [];
    let sortOrder = "desc";

    // Fetch sessions from the server
    async function fetchSessions() {
        try {
            const response = await fetch("/api/sessions");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            sessions = await response.json();
            sessionCount.textContent = `• ${sessions.length}`; // Update session count
            renderSessions();
            applyProductivityColors();
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            sessionList.innerHTML = `
                <div class="text-red-500 font-bold text-center py-4">
                    Failed to load sessions. Please try again later.
                </div>`;
        }
    }

    // Render sessions in the DOM
    function renderSessions() {
        if (sessions.length === 0) {
            sessionList.innerHTML = `
                <div class="text-gray-500 font-medium text-center py-4">
                    No sessions available.
                </div>`;
            return;
        }

        sessionList.innerHTML = sessions
            .map(session => `
                <div class="grid grid-cols-6 md:grid-cols-7 items-center text-gray-700 text-sm py-2 border-b border-gray-300 notes-row">
                    <div class="flex items-center">
                        <input type="checkbox" class="entry-checkbox form-checkbox h-4 w-4 text-blue-600">
                    </div>
                    <div class="flex items-center">
                        <span class="bg-gray-200 text-black font-bold rounded-full px-2 py-1">${session.date}</span>
                    </div>
                    <div class="flex items-center">
                        <span class="relative group">
                            🍵 ${session.time}
                            <span class="absolute left-1/2 transform -translate-x-1/2 -translate-y-full bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Break: ${session.break_minutes || 0}m
                            </span>
                        </span>
                    </div>
                    <div class="flex items-center font-bold">
                        <span>${session.duration}</span>
                    </div>
                    <div class="flex items-center">
                        <span class="bg-black text-white font-bold rounded-full px-2 py-1">${session.course}</span>
                    </div>
                    <div class="flex items-center">
                        <span class="font-bold rounded-full px-2 py-1" data-productivity="${session.productivity}">
                            ${session.productivity}
                        </span>
                    </div>
                    <div class="flex items-center justify-between notes-column col-span-2 md:col-span-1">
                        <span>${session.notes || "No notes available"}</span>
                        <button class="text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h.01M12 12h.01M18 12h.01" />
                            </svg>
                        </button>
                    </div>
                </div>
            `)
            .join("");
    }

    // Apply productivity colors
    function applyProductivityColors() {
        const productivityElements = document.querySelectorAll(".productivity-color");
        productivityElements.forEach(el => {
            const productivity = parseInt(el.dataset.productivity, 10);
            if (productivity <= 3) {
                el.classList.add("bg-red-500", "text-white");
            } else if (productivity <= 6) {
                el.classList.add("bg-yellow-500", "text-black");
            } else {
                el.classList.add("bg-green-500", "text-white");
            }
        });
    }

    // Sort sessions by date
    function sortSessionsByDate() {
        sessions.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
        sortOrder = sortOrder === "asc" ? "desc" : "asc";
        renderSessions();
        applyProductivityColors();
    }

    // Toggle notes visibility
    function toggleNotesVisibility() {
        const notesRows = document.querySelectorAll(".notes-row .notes-column");
        notesRows.forEach(row => {
            row.classList.toggle("hidden", !showNotesToggle.checked);
        });
    }

    // Select all checkboxes
    function toggleSelectAll() {
        const entryCheckboxes = document.querySelectorAll(".entry-checkbox");
        entryCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    }

    // Initialize event listeners
    dateToggle.addEventListener("click", sortSessionsByDate);
    showNotesToggle.addEventListener("change", toggleNotesVisibility);
    selectAllCheckbox.addEventListener("change", toggleSelectAll);

    // Fetch and render sessions on page load
    fetchSessions();
});
