document.addEventListener('DOMContentLoaded', () => {
    const toggleDropdown = (inputId, dropdownId) => {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);

        // Toggle dropdown visibility on input click
        input.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering document click listener
            dropdown.classList.toggle('hidden');
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!input.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.add('hidden');
            }
        });
    };

    const adjustBreak = (inputId, dropdownId, durationId) => {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        const durationDisplay = document.getElementById(durationId);

        dropdown.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                const adjustment = parseInt(event.target.getAttribute('data-adjust'), 10);
                let currentBreak = parseInt(input.value, 10) || 0;

                currentBreak += adjustment;
                currentBreak = Math.max(0, currentBreak); // Ensure break duration is not negative

                input.value = currentBreak; // Update the input field
                durationDisplay.textContent = `${currentBreak}m`; // Update the duration display
            }
        });

        // Ensure input field value cannot be negative
        input.addEventListener('input', () => {
            let currentBreak = parseInt(input.value, 10) || 0;
            if (currentBreak < 0) {
                input.value = 0;
            }
        });
    };

    // Initialize dropdown and break adjustment functionality
    toggleDropdown('new_break', 'break-dropdown');
    adjustBreak('new_break', 'break-dropdown', 'break-duration');
});
