document.addEventListener("DOMContentLoaded", () => {
    const requiredFields = ["new_date", "new_start", "new_end", "new_course", "new_productivity"];
    const submitButton = document.getElementById("create-session-btn");

    const checkFields = () => {
        const allFilled = requiredFields.every(id => {
            const field = document.getElementById(id);
            return field && field.value.trim() !== "";
        });
        submitButton.disabled = !allFilled;
    };

    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener("input", checkFields);
        }
    });

    checkFields(); // Initial check
});
