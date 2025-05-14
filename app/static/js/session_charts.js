document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/sessions')
        .then(response => response.json())
        .then(sessions => {
            const courseData = processCourseData(sessions);
            const weeklyData = processWeeklyData(sessions);
            createPieChart(courseData);
            createBarChart(weeklyData);
            analyzeStudyIntensity(sessions); // newly added function
        })
        .catch(error => console.error('Error fetching sessions:', error));
});

// newly added function to analyze study intensity
function analyzeStudyIntensity(sessions) {
    const thisWeekTotal = sessions
        .filter(session => {
            if (!session.date) return false;
            // Parse date in DD/MM/YYYY format
            const [day, month, year] = session.date.split('/');
            const sessionDate = new Date(year, month-1, day);
            return isThisWeek(sessionDate);
        })
        .reduce((sum, session) => sum + parseDuration(session.duration), 0);

    console.log("This week's total study time:", thisWeekTotal, "minutes");
    
    const messageBox = document.getElementById('performance-message');
    let message = '';
    
    if (thisWeekTotal < 240) { // 4hours
        message = `Classmate!!!!! According to this week's study records, your effective study time shows a significant gap compared to course requirements.  This level of learning intensity is insufficient for basic comprehension of knowledge points,  let alone ensuring the systematicity and completeness of the knowledge system. Of particular concern is that the current investment has formed a clear disconnection with course progress, `;
    } else if (thisWeekTotal < 600) { // 10hours
        message = `Classmate!! Your learning plan completion this week is commendable. The daily time arrangement demonstrates clear goal orientation and meets basic course requirements. However, it slightly falls below the recommended threshold for deep learning. While this pace ensures comfortable knowledge absorption, to achieve more solid mastery and grade breakthroughs, consider extending daily effective study time by 30-60 minutes with focused practice on weak areas.`;
    } else if (thisWeekTotal < 1500) { // 25hours
        message = `Classmate! Your study hours this week demonstrate remarkable perseverance. This investment level ensures timely digestion of new knowledge while allowing ample time for after-class exercises and internalization. Your current accumulation pace has laid a foundation for high-score Sprint! Maintain this focus level and expect surprise in final grades!`;
    } else {
        message = `Classmate! Your study hours this week are truly impressive! This level of investment not only meets course requirements but also sets a new benchmark for excellence. Your commitment to learning is commendable, and it’s clear that you are on the path to achieving outstanding results. Keep up the great work!`;
    }

    messageBox.innerHTML = `
        <div class="p-4 rounded-lg ${getMessageStyle(thisWeekTotal)} animate-fade-in-up">
            <div class="font-semibold mb-2 text-lg">${getStatusEmoji(thisWeekTotal)} ${getStatusTitle(thisWeekTotal)}</div>
            <p class="leading-relaxed">${message}</p>
        </div>
    `;
}

// Helper functions for message styling
function getMessageStyle(minutes) {
    if (minutes < 240) return 'bg-red-50 text-red-800 border-l-4 border-red-500';
    if (minutes < 600) return 'bg-orange-50 text-orange-800 border-l-4 border-orange-500';
    if (minutes < 1500) return 'bg-blue-50 text-blue-800 border-l-4 border-blue-500';
    return 'bg-purple-50 text-purple-800 border-l-4 border-purple-500';
}

function getStatusEmoji(minutes) {
    if (minutes < 240) return '🚨';
    if (minutes < 600) return '⚠️';
    if (minutes < 1500) return '👍';
    return '🎯';
}

function getStatusTitle(minutes) {
    if (minutes < 240) return 'Critical Alert: Learning Deficit Detected';
    if (minutes < 600) return 'Positive Progress: Room for Growth';
    if (minutes < 1500) return 'Excellent Commitment: On Track for Success';
    return 'Elite Performance: Academic Excellence Achieved';
}

function isThisWeek(date) {
    const currentDate = new Date();
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);
    
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

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
    if (!durationStr) return 0;
    
    let minutes = 0;
    
    // Handle different formats
    if (typeof durationStr === 'number') {
        // If it's already a number, assume it's minutes
        minutes = durationStr;
    } else if (typeof durationStr === 'string') {
        // Format: "Xh Ym" or variations
        const hours = durationStr.match(/(\d+)h/);
        const mins = durationStr.match(/(\d+)m/);
        
        if (hours) minutes += parseInt(hours[1]) * 60;
        if (mins) minutes += parseInt(mins[1]);
        
        // If no pattern matched but it's a numeric string, try parsing it directly
        if (!hours && !mins && !isNaN(durationStr)) {
            minutes = parseInt(durationStr);
        }
    }
    
    console.log("Parsed duration:", durationStr, "->", minutes, "minutes");
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