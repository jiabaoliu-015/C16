document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/sessions')
        .then(response => response.json())
        .then(sessions => {
            const courseData = processCourseData(sessions);
            const weeklyData = processWeeklyData(sessions);
            createPieChart(courseData);
            createBarChart(weeklyData);
        })
        .catch(error => console.error('Error fetching sessions:', error));
});

// Process course data
function processCourseData(sessions) {
    const courseData = {};
    sessions.forEach(session => {
        const course = session.course || "Uncategorized";
        const duration = parseDuration(session.duration);
        courseData[course] = (courseData[course] || 0) + duration;
    });
    return courseData;
}

// Process weekly data
function processWeeklyData(sessions) {
    const weeklyData = { 'S':0, 'M':0, 'T':0, 'W':0, 'Th':0, 'F':0, 'Sa':0 };
    sessions.forEach(session => {
        if (session.date) {
            const [day, month, year] = session.date.split('/');
            const date = new Date(year, month-1, day);
            const dayIndex = date.getDay();
            const days = ['S','M','T','W','Th','F','Sa'];
            const dayKey = days[dayIndex];
            weeklyData[dayKey] += parseDuration(session.duration);
        }
    });
    return weeklyData;
}

// Parse duration
function parseDuration(durationStr) {
    let minutes = 0;
    const hours = durationStr.match(/(\d+)h/);
    const mins = durationStr.match(/(\d+)m/);
    if (hours) minutes += parseInt(hours[1]) * 60;
    if (mins) minutes += parseInt(mins[1]);
    return minutes;
}

// create pie chart
function createPieChart(courseData) {
    const ctx = document.getElementById('course-pie-chart').getContext('2d');
    const labels = Object.keys(courseData);
    const data = Object.values(courseData);
    const total = data.reduce((a, b) => a + b, 0);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: generateColors(labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.raw;
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatTime(value)} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });

    createLegend(labels, data, total);
}

// create bar chart
function createBarChart(weeklyData) {
    const ctx = document.getElementById('weekly-bar-chart').getContext('2d');
    const labels = Object.keys(weeklyData);
    const data = Object.values(weeklyData);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Study Time',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Minutes' }
                },
                x: { title: { display: true, text: 'Day of Week' } }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => 
                            `${formatTime(context.raw)}`
                    }
                }
            }
        }
    });
}

// create legend for pie chart
function createLegend(labels, data, total) {
    const container = document.getElementById('course-legend');
    container.innerHTML = `
        <h3 class="text-lg font-semibold mb-3">Course Breakdown</h3>
        ${labels.map((label, i) => `
            <div class="flex items-center mb-2">
                <div class="w-4 h-4 rounded-full mr-2" style="background:${generateColors(labels.length)[i]}"></div>
                <div class="flex-1">
                    <div class="font-medium">${label}</div>
                    <div class="text-sm text-gray-600">
                        ${formatTime(data[i])} (${((data[i]/total)*100).toFixed(1)}%)
                    </div>
                </div>
            </div>
        `).join('')}
        <div class="mt-4 pt-2 border-t border-gray-200">
            <div class="font-bold">Total: ${formatTime(total)}</div>
        </div>
    `;
}

// create colors for pie chart
function generateColors(count) {
    const preset = ['#4f46e5','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6','#06b6d4'];
    while(preset.length < count) {
        preset.push(`hsl(${Math.random()*360}, 70%, 60%)`);
    }
    return preset.slice(0, count);
}

// format time in hours and minutes
function formatTime(minutes) {
    const hrs = Math.floor(minutes/60);
    const mins = minutes%60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}
