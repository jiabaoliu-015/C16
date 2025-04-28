document.addEventListener("DOMContentLoaded", () => {
    sortSessionsByDate(); // Sort sessions by default on page load
});

function sortSessionsByDate() {
    const toggleButton = document.getElementById("date-toggle");
    const sortOrder = toggleButton.getAttribute("data-sort");
    const sessionsContainer = document.querySelectorAll(".notes-row");

    // Convert NodeList to an array for sorting
    const sessionsArray = Array.from(sessionsContainer);

    // Sort sessions based on date and time
    sessionsArray.sort((a, b) => {
        const dateA = new Date(a.querySelector(".bg-gray-200").textContent.trim());
        const dateB = new Date(b.querySelector(".bg-gray-200").textContent.trim());
        const timeA = a.querySelector(".notes-row span:nth-child(2)").textContent.trim();
        const timeB = b.querySelector(".notes-row span:nth-child(2)").textContent.trim();

        if (sortOrder === "desc") {
            return dateB - dateA || timeA.localeCompare(timeB);
        } else {
            return dateA - dateB || timeB.localeCompare(timeA);
        }
    });

    // Update the DOM with sorted sessions
    const parentContainer = document.querySelector(".max-w-6xl");
    sessionsArray.forEach(session => parentContainer.appendChild(session));

    // Toggle sort order and arrow direction
    toggleButton.setAttribute("data-sort", sortOrder === "desc" ? "asc" : "desc");
    const arrowPath = toggleButton.querySelector("path");
    arrowPath.setAttribute("d", sortOrder === "desc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7");
}
