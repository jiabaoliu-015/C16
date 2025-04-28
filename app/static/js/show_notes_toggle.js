document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("show-notes");
    const toggleBg = document.getElementById("toggle-bg");
    const toggleKnob = document.getElementById("toggle-knob");
    const notesRows = document.querySelectorAll(".notes-row");

    const updateToggle = () => {
        if (toggle.checked) {
            toggleBg.classList.add("toggle-active");
            toggleKnob.style.transform = "translateX(16px)";
            notesRows.forEach(row => row.classList.remove("hidden"));
        } else {
            toggleBg.classList.remove("toggle-active");
            toggleKnob.style.transform = "translateX(0)";
            notesRows.forEach(row => row.classList.add("hidden"));
        }
    };

    toggle.addEventListener("change", updateToggle);

    // Initialize default state
    updateToggle();
});
