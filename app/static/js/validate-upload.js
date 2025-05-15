document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById('file');
    const fileNameDisplay = document.getElementById('file-name');
    const fileError = document.getElementById('file-error');
    const uploadButton = document.getElementById('upload-btn');
    const createSessionBtn = document.getElementById('create-session-btn');
    const uploadForm = document.getElementById('upload-form');

    // Function to check if two time ranges overlap
    function doTimeRangesOverlap(start1, end1, start2, end2) {
        // Convert times to minutes since midnight for easier comparison
        const toMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const start1Minutes = toMinutes(start1);
        const end1Minutes = toMinutes(end1);
        const start2Minutes = toMinutes(start2);
        const end2Minutes = toMinutes(end2);

        // Handle cases where end time is on the next day
        const adjustedEnd1 = end1Minutes < start1Minutes ? end1Minutes + 24 * 60 : end1Minutes;
        const adjustedEnd2 = end2Minutes < start2Minutes ? end2Minutes + 24 * 60 : end2Minutes;

        return (
            (start1Minutes <= start2Minutes && start2Minutes < adjustedEnd1) ||
            (start2Minutes <= start1Minutes && start1Minutes < adjustedEnd2)
        );
    }

    // Function to validate time overlap with existing sessions
    async function validateTimeOverlap(date, startTime, endTime) {
        try {
            const response = await fetch('/api/sessions');
            const sessions = await response.json();
            
            // Filter sessions for the same date
            const sameDaySessions = sessions.filter(session => {
                const sessionDate = new Date(session.date.split('/').reverse().join('-'));
                const inputDate = new Date(date);
                return sessionDate.toDateString() === inputDate.toDateString();
            });

            // Check for overlaps
            for (const session of sameDaySessions) {
                const [sessionStart, sessionEnd] = session.time.split(' - ');
                if (doTimeRangesOverlap(startTime, endTime, sessionStart, sessionEnd)) {
                    return {
                        valid: false,
                        message: `Invalid timeslot selected: overlaps with existing session (${session.time})`
                    };
                }
            }
            return { valid: true };
        } catch (error) {
            console.error('Error validating time overlap:', error);
            return { valid: true }; // Allow submission if validation fails
        }
    }

    // Add form submission handler
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const date = document.getElementById('new_date').value;
            const startTime = document.getElementById('new_start').value;
            const endTime = document.getElementById('new_end').value;

            // Validate time overlap
            const validation = await validateTimeOverlap(date, startTime, endTime);
            if (!validation.valid) {
                // Create a hidden input for the flash message
                const flashInput = document.createElement('input');
                flashInput.type = 'hidden';
                flashInput.name = 'flash_message';
                flashInput.value = validation.message;
                this.appendChild(flashInput);
            }

            // Always submit the form - let the backend handle the validation
            this.submit();
        });
    }

    const validateCSVFile = () => {
        fileError.classList.add('hidden');
        uploadButton.disabled = true;
        uploadButton.classList.add('bg-gray-400', 'text-gray-200', 'cursor-not-allowed');
        uploadButton.classList.remove('bg-gradient-to-r', 'from-blue-400', 'to-blue-600', 'hover:from-blue-500', 'hover:to-blue-700', 'text-white', 'cursor-pointer');

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileNameDisplay.textContent = file.name;

            if (!file.name.endsWith('.csv')) {
                fileError.textContent = 'Error: The selected file is not a CSV. Please upload a file with a .csv extension.';
                fileError.classList.remove('hidden');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const lines = e.target.result.split('\n').map(line => line.trim()).filter(line => line);
                const header = lines[0].split(',');
                if (header.length !== 7 || header[0] !== 'date' || header[1] !== 'subject' || header[2] !== 'start' || header[3] !== 'end' || header[4] !== 'break' || header[5] !== 'activity' || header[6] !== 'rating') {
                    fileError.textContent = 'Error: The CSV header is invalid. Ensure the header contains exactly 7 columns: "date", "subject", "start", "end", "break", "activity", and "rating".';
                    fileError.classList.remove('hidden');
                    return;
                }

                for (let i = 1; i < lines.length; i++) {
                    const row = lines[i].split(',');
                    if (row.length !== 7) {
                        fileError.textContent = `Error: Line ${i + 1} does not contain exactly 7 columns. Please check your data.`;
                        fileError.classList.remove('hidden');
                        return;
                    }
                    if (isNaN(Date.parse(row[0]))) {
                        fileError.textContent = `Error: Invalid date format on line ${i + 1}. Ensure the date is in a recognizable format (e.g., YYYY-MM-DD).`;
                        fileError.classList.remove('hidden');
                        return;
                    }
                    if (!row[1]) {
                        fileError.textContent = `Error: Missing subject on line ${i + 1}. The "subject" field cannot be empty.`;
                        fileError.classList.remove('hidden');
                        return;
                    }
                    if (!/^\d{2}:\d{2}$/.test(row[2]) || !/^\d{2}:\d{2}$/.test(row[3])) {
                        fileError.textContent = `Error: Invalid time format on line ${i + 1}. Ensure "start" and "end" times are in HH:MM format.`;
                        fileError.classList.remove('hidden');
                        return;
                    }
                    if (isNaN(row[4]) || row[4] < 0) {
                        fileError.textContent = `Error: Invalid break duration on line ${i + 1}. The "break" field must be a non-negative number.`;
                        fileError.classList.remove('hidden');
                        return;
                    }
                    if (row[5] && typeof row[5] !== 'string') {
                        fileError.textContent = `Error: Invalid activity description on line ${i + 1}. The "activity" field must be a string.`;
                        fileError.classList.remove('hidden');
                        return;
                    }
                    if (isNaN(row[6]) || row[6] < 0 || row[6] > 10) {
                        fileError.textContent = `Error: Invalid rating on line ${i + 1}. The "rating" field must be a number between 0 and 10.`;
                        fileError.classList.remove('hidden');
                        return;
                    }
                }

                uploadButton.disabled = false;
                uploadButton.classList.remove('bg-gray-400', 'text-gray-200', 'cursor-not-allowed');
                uploadButton.classList.add('bg-gradient-to-r', 'from-blue-400', 'to-blue-600', 'hover:from-blue-500', 'hover:to-blue-700', 'text-white', 'cursor-pointer');
            };
            reader.readAsText(file);
        } else {
            fileNameDisplay.textContent = 'No file selected';
        }
    };

    fileInput.addEventListener('change', validateCSVFile);
});
