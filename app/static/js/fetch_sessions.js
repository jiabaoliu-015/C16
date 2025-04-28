document.addEventListener("DOMContentLoaded", () => {
    const sessionList = document.getElementById("session-list");
    const sessionCount = document.getElementById("session-count"); // Reference to session count element
    const dateToggle = document.getElementById("date-toggle");
    const selectAllCheckbox = document.getElementById("select-all");
    let sortOrder = "desc";
    let currentPage = 1;
    const sessionsPerPage = 10;

    // Fetch sessions from the server
    async function fetchSessions() {
        try {
            const response = await fetch("/upload/api/sessions");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            sessions = Array.isArray(data) ? data : []; // Ensure sessions is an array
            sessionCount.textContent = `• ${sessions.length}`; // Update session count
            sortSessionsByDate(); // Sort sessions before rendering
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            sessionList.innerHTML = `
                <div class="text-red-500 font-bold text-center py-4">
                    Failed to load sessions. Please try again later.
                </div>`;
        }
    }

    let sessions = []; // Initialize sessions as an empty array

    // Render sessions in the DOM with pagination
    function renderSessions() {
        const startIndex = (currentPage - 1) * sessionsPerPage;
        const endIndex = startIndex + sessionsPerPage;
        const paginatedSessions = sessions.slice(startIndex, endIndex);

        if (!paginatedSessions || paginatedSessions.length === 0) {
            sessionList.innerHTML = `
                <div class="text-gray-500 font-medium text-center py-4">
                    No sessions available.
                </div>`;
            return;
        }

        sessionList.innerHTML = paginatedSessions
            .map(session => {
                const productivityClass = getProductivityClass(session.productivity || 0); // Fallback for missing productivity
                return `
                    <div class="flex items-center text-gray-700 text-sm py-2 border-b border-gray-300 notes-row hover:bg-blue-100">
                        <div class="flex items-center w-24">
                            <input type="checkbox" class="entry-checkbox form-checkbox h-4 w-4 text-blue-600">
                        </div>
                        <div class="flex items-center w-24">
                            <span class="bg-gray-200 text-black font-bold rounded-full px-2 py-1">${session.date || "N/A"}</span>
                        </div>
                        <div class="flex items-center w-48">
                            <span class="relative group">
                                🍵 ${session.time || "N/A"}
                                <span class="absolute left-1/2 transform -translate-x-1/2 -translate-y-full bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Break: ${session.break_minutes || 0}m
                                </span>
                            </span>
                        </div>
                        <div class="flex items-center font-bold w-24">
                            <span>${session.duration || "N/A"}</span>
                        </div>
                        <div class="flex items-center w-32">
                            <span class="bg-black text-white font-bold rounded-full px-2 py-1">${session.course || "N/A"}</span>
                        </div>
                        <div class="flex items-center w-20">
                            <span class="w-8 h-8 flex items-center justify-center rounded-full font-bold ${productivityClass}">
                                ${session.productivity || 0}
                            </span>
                        </div>
                        <div class="flex items-center justify-between notes-column w-64 pl-4">
                            <span>${session.notes || "No notes available"}</span>
                            <button class="relative text-gray-500 hover:text-gray-700">
                                <div class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h.01M12 12h.01M18 12h.01" />
                                    </svg>
                                </div>
                                <span class="absolute left-1/2 transform -translate-x-1/2 -translate-y-full bg-black text-white text-xs rounded px-2 py-1 opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Edit session
                                </span>
                            </button>
                        </div>
                    </div>
                `;
            })
            .join("");

        updatePaginationInfo();
        attachCheckboxListeners(); // Add this line
        updateDeleteButtonVisibility(); // Add this line
    }

    // Update pagination info and button states
    function updatePaginationInfo() {
        const totalPages = Math.ceil(sessions.length / sessionsPerPage);
        const pageInfo = document.getElementById("page-info");
        const prevPageButton = document.getElementById("prev-page");
        const nextPageButton = document.getElementById("next-page");

        const startRange = (currentPage - 1) * sessionsPerPage + 1;
        const endRange = Math.min(currentPage * sessionsPerPage, sessions.length);

        pageInfo.textContent = `Page ${currentPage} (${startRange}-${endRange})`;

        // Update previous button state
        if (currentPage === 1) {
            prevPageButton.classList.add("cursor-not-allowed", "bg-gray-300", "text-gray-500");
            prevPageButton.disabled = true;
        } else {
            prevPageButton.classList.remove("cursor-not-allowed", "bg-gray-300", "text-gray-500");
            prevPageButton.disabled = false;
        }

        // Update next button state
        if (currentPage === totalPages) {
            nextPageButton.classList.add("cursor-not-allowed", "bg-gray-300", "text-gray-500");
            nextPageButton.disabled = true;
        } else {
            nextPageButton.classList.remove("cursor-not-allowed", "bg-gray-300", "text-gray-500");
            nextPageButton.disabled = false;
        }
    }

    // Handle page navigation
    function goToPage(page) {
        const totalPages = Math.ceil(sessions.length / sessionsPerPage);
        if (page < 1 || page > totalPages) return;

        currentPage = page;
        renderSessions();
    }

    // Helper function to determine the class for productivity rating
    function getProductivityClass(productivity) {
        if (productivity >= 0 && productivity <= 5) {
            return "bg-red-200 text-red-800";
        } else if (productivity >= 6 && productivity <= 7) {
            return "bg-yellow-200 text-yellow-800";
        } else if (productivity >= 8 && productivity <= 10) {
            return "bg-green-200 text-green-800";
        }
        return "bg-gray-200 text-gray-800"; // Default fallback for invalid values
    }

    // Sort sessions by date and then by start time
    function sortSessionsByDate() {
        sessions.sort((a, b) => {
            // Validate and parse dates
            const dateA = a.date ? new Date(a.date.split("/").reverse().join("-")) : null;
            const dateB = b.date ? new Date(b.date.split("/").reverse().join("-")) : null;

            if (dateA && dateB) {
                if (dateA - dateB !== 0) {
                    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                }
            } else if (dateA) {
                return sortOrder === "asc" ? -1 : 1;
            } else if (dateB) {
                return sortOrder === "asc" ? 1 : -1;
            }

            // Validate and parse start times
            const timeA = a.time ? new Date(`1970-01-01T${a.time.split(" - ")[0]}`) : null;
            const timeB = b.time ? new Date(`1970-01-01T${b.time.split(" - ")[0]}`) : null;

            if (timeA && timeB) {
                return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
            } else if (timeA) {
                return sortOrder === "asc" ? -1 : 1;
            } else if (timeB) {
                return sortOrder === "asc" ? 1 : -1;
            }

            return 0; // Fallback if both date and time are invalid or equal
        });

        // Toggle sortOrder and update button attribute
        sortOrder = sortOrder === "asc" ? "desc" : "asc";
        const dateToggle = document.getElementById("date-toggle");
        dateToggle.setAttribute("data-sort", sortOrder);

        // Re-render sessions
        renderSessions();
    }

    // Select all checkboxes
    function toggleSelectAll() {
        const entryCheckboxes = document.querySelectorAll(".entry-checkbox");
        entryCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        updateDeleteButtonVisibility(); // Add this line
    }

    // Show or hide the delete button based on selected checkboxes
    function updateDeleteButtonVisibility() {
        const deleteButton = document.getElementById("delete-selected");
        const selectedCheckboxes = document.querySelectorAll(".entry-checkbox:checked");
        deleteButton.classList.toggle("hidden", selectedCheckboxes.length === 0);
    }

    // Handle delete confirmation
    function handleDeleteSelected() {
        const selectedCheckboxes = document.querySelectorAll(".entry-checkbox:checked");
        const count = selectedCheckboxes.length;

        if (count > 0) {
            const confirmation = confirm(`Are you sure you want to delete ${count} session(s)?`);
            if (confirmation) {
                // Logic to delete sessions (e.g., send a request to the server)
                console.log(`${count} session(s) deleted.`);
            }
        }
    }

    // Attach event listeners to checkboxes
    function attachCheckboxListeners() {
        const entryCheckboxes = document.querySelectorAll(".entry-checkbox");
        entryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener("change", updateDeleteButtonVisibility);
        });
    }

    // Initialize event listeners
    dateToggle.addEventListener("click", sortSessionsByDate);
    selectAllCheckbox.addEventListener("change", toggleSelectAll);
    document.getElementById("prev-page").addEventListener("click", () => goToPage(currentPage - 1));
    document.getElementById("next-page").addEventListener("click", () => goToPage(currentPage + 1));
    document.getElementById("delete-selected").addEventListener("click", handleDeleteSelected); // Add this line

    // Fetch and render sessions on page load
    fetchSessions();
});


