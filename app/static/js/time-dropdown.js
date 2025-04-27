document.addEventListener('DOMContentLoaded', () => {
    const toggleDropdown = (inputId, dropdownId) => {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);

        // Toggle dropdown visibility on input click
        input.addEventListener('click', () => {
            dropdown.classList.toggle('hidden');
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!input.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.add('hidden');
            }
        });
    };

    const adjustTime = (inputId, dropdownId, durationId) => {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        const durationDisplay = document.getElementById(durationId);

        dropdown.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                const adjustment = parseInt(event.target.getAttribute('data-adjust'), 10);
                const currentTime = input.value.split(':');
                let hours = parseInt(currentTime[0], 10);
                let minutes = parseInt(currentTime[1], 10);

                minutes += adjustment;
                while (minutes >= 60) {
                    minutes -= 60;
                    hours += 1;
                }
                while (minutes < 0) {
                    minutes += 60;
                    hours -= 1;
                }
                hours = (hours + 24) % 24; // Ensure hours stay within 0-23

                const newTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                input.value = newTime; // Update the input field
                durationDisplay.textContent = newTime; // Update the duration display
                updateSessionDuration(); // Update the session duration
            }
        });
    };

    const updateSessionDuration = () => {
        const startInput = document.getElementById('new_start');
        const endInput = document.getElementById('new_end');
        const sessionDurationDisplay = document.getElementById('session-duration');
        const sessionProgress = document.getElementById('session-progress');

        if (startInput.value && endInput.value) {
            const [startHours, startMinutes] = startInput.value.split(':').map(Number);
            const [endHours, endMinutes] = endInput.value.split(':').map(Number);

            let durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
            if (durationMinutes < 0) {
                durationMinutes += 24 * 60; // Handle overnight sessions
            }

            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            sessionDurationDisplay.innerHTML = `Duration: <strong>${hours}h ${minutes}m</strong>`;

            // Update progress bar
            const progressPercentage = Math.min((durationMinutes / 75) * 100, 100);
            sessionProgress.style.width = `${progressPercentage}%`;
        }
    };

    // Initialize dropdowns and time adjustment functionality
    toggleDropdown('new_start', 'start-dropdown');
    toggleDropdown('new_end', 'end-dropdown');
    adjustTime('new_start', 'start-dropdown', 'start-duration');
    adjustTime('new_end', 'end-dropdown', 'end-duration');

    // Update session duration on input changes
    document.getElementById('new_start').addEventListener('change', updateSessionDuration);
    document.getElementById('new_end').addEventListener('change', updateSessionDuration);
});
