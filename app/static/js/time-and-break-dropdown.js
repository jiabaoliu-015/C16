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

    const showBreakMaxToast = (message) => {
        const flashContainer = document.querySelector('.flash-container');
        const flashMessage = document.createElement('div');
        flashMessage.className = 'flash-message';
        flashMessage.innerHTML = `
            <div class="alert bg-violet-100 text-black border border-violet-200 shadow-lg rounded-lg p-4 max-w-md mx-auto" style="color: black !important;">
                ${message}
            </div>
        `;
        flashContainer.appendChild(flashMessage);

        // Remove the message after 2 seconds
        setTimeout(() => {
            flashMessage.classList.add('fade-out');
            setTimeout(() => {
                flashMessage.remove();
            }, 500);
        }, 2000);
    };

    const updateSessionDuration = () => {
        const startInput = document.getElementById('new_start');
        const endInput = document.getElementById('new_end');
        const breakInput = document.getElementById('new_break'); // Added break input
        const sessionDurationDisplay = document.getElementById('session-duration');
        const sessionProgress = document.getElementById('session-progress');

        let sessionMinutes = 0;
        if (startInput.value && endInput.value) {
            const [startHours, startMinutes] = startInput.value.split(':').map(Number);
            const [endHours, endMinutes] = endInput.value.split(':').map(Number);

            sessionMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
            if (sessionMinutes < 0) {
                sessionMinutes += 24 * 60; // Handle overnight sessions
            }
        }

        let breakMinutes = parseInt(breakInput.value, 10) || 0; // Get break value
        // Cap break at session duration
        if (breakMinutes > sessionMinutes) {
            breakMinutes = sessionMinutes;
            breakInput.value = breakMinutes;
            showBreakMaxToast('Break cannot exceed session duration');
        }

        let durationMinutes = Math.max(0, sessionMinutes - breakMinutes); // Subtract break and ensure non-negative

        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        sessionDurationDisplay.innerHTML = `Duration: <strong>${hours}h ${minutes}m</strong>`;

        // Update progress bar
        const progressPercentage = Math.min((durationMinutes / 75) * 100, 100);
        sessionProgress.style.width = `${progressPercentage}%`;
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

                // Get session duration
                const startInput = document.getElementById('new_start');
                const endInput = document.getElementById('new_end');
                let sessionMinutes = 0;
                if (startInput.value && endInput.value) {
                    const [startHours, startMinutes] = startInput.value.split(':').map(Number);
                    const [endHours, endMinutes] = endInput.value.split(':').map(Number);
                    sessionMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
                    if (sessionMinutes < 0) sessionMinutes += 24 * 60;
                }
                if (currentBreak > sessionMinutes) {
                    currentBreak = sessionMinutes;
                    showBreakMaxToast('Break cannot exceed session duration');
                }

                input.value = currentBreak; // Update the input field
                durationDisplay.textContent = `${currentBreak}m`; // Update the duration display
                updateSessionDuration(); // Update session duration dynamically
            }
        });

        // Ensure input field value cannot be negative
        input.addEventListener('input', () => {
            let currentBreak = parseInt(input.value, 10) || 0;
            if (currentBreak < 0) {
                currentBreak = 0;
            }

            // Get session duration
            const startInput = document.getElementById('new_start');
            const endInput = document.getElementById('new_end');
            let sessionMinutes = 0;
            if (startInput.value && endInput.value) {
                const [startHours, startMinutes] = startInput.value.split(':').map(Number);
                const [endHours, endMinutes] = endInput.value.split(':').map(Number);
                sessionMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
                if (sessionMinutes < 0) sessionMinutes += 24 * 60;
            }
            if (currentBreak > sessionMinutes) {
                currentBreak = sessionMinutes;
                showBreakMaxToast('Break cannot exceed session duration');
            }

            input.value = currentBreak;
            durationDisplay.textContent = `${currentBreak}m`; // Update the duration display
            updateSessionDuration(); // Update session duration dynamically
        });
    };

    // Initialize dropdowns and time/break adjustment functionality
    toggleDropdown('new_start', 'start-dropdown');
    toggleDropdown('new_end', 'end-dropdown');
    toggleDropdown('new_break', 'break-dropdown');
    adjustTime('new_start', 'start-dropdown', 'start-duration');
    adjustTime('new_end', 'end-dropdown', 'end-duration');
    adjustBreak('new_break', 'break-dropdown', 'break-duration');

    // Update session duration on input changes
    document.getElementById('new_start').addEventListener('change', updateSessionDuration);
    document.getElementById('new_end').addEventListener('change', updateSessionDuration);
});
