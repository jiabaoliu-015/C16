document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('studyTimeGraph').getContext('2d');

    // Ensure the canvas fits properly within the container
    const canvas = document.getElementById('studyTimeGraph');
    canvas.style.width = '100%';
    canvas.style.height = 'auto';

    // Hardcoded data for the graph
    const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const studyTimes = [2, 3, 1.5, 4, 2.5, 3.5, 2];

    // Render the chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Study Time (hours)',
                data: studyTimes,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderWidth: 2,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Day of the Week',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Hours',
                    },
                    beginAtZero: true,
                },
            },
        },
    });
});
