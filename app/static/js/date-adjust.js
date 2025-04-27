document.addEventListener('DOMContentLoaded', () => {
    const adjustDate = (inputId, prevButtonId, nextButtonId, minDate, maxDate) => {
        const input = document.getElementById(inputId);
        const prevButton = document.getElementById(prevButtonId);
        const nextButton = document.getElementById(nextButtonId);

        // Set the min and max attributes for the date input
        input.setAttribute('min', minDate);
        input.setAttribute('max', maxDate);

        // Set the current date as the default value
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        input.value = formattedToday >= minDate && formattedToday <= maxDate ? formattedToday : minDate;

        const updateButtonState = () => {
            const currentDate = new Date(input.value);
            prevButton.disabled = currentDate <= new Date(minDate);
            nextButton.disabled = currentDate >= new Date(maxDate);

            prevButton.classList.toggle('disabled:bg-gray-200', prevButton.disabled);
            prevButton.classList.toggle('disabled:text-gray-400', prevButton.disabled);
            nextButton.classList.toggle('disabled:bg-gray-200', nextButton.disabled);
            nextButton.classList.toggle('disabled:text-gray-400', nextButton.disabled);
        };

        const incrementDate = (days) => {
            const currentDate = new Date(input.value);
            currentDate.setDate(currentDate.getDate() + days);
            input.value = currentDate.toISOString().split('T')[0];
            updateButtonState();
        };

        prevButton.addEventListener('click', () => incrementDate(-1));
        nextButton.addEventListener('click', () => incrementDate(1));

        // Initialize button states
        updateButtonState();
    };

    adjustDate('new_date', 'prev-day', 'next-day', '2025-04-26', '2025-04-30');
});
