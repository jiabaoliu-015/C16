document.addEventListener("DOMContentLoaded", () => {
    const selectAllCheckbox = document.getElementById("select-all");
    const entryCheckboxes = document.querySelectorAll(".entry-checkbox");

    selectAllCheckbox.addEventListener("change", () => {
        entryCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });
});
