document.addEventListener("DOMContentLoaded", async function() {
    const productivityOverview = document.getElementById("productivity-overview");
    
    // Create a canvas for the chart
    productivityOverview.innerHTML = `
        <div class="h-96 bg-white rounded-lg p-4">
            <canvas id="productivityChart" class="w-full h-full"></canvas>
        </div>
    `;
    
    try {
        // Fetch session data from your API
        const response = await fetch("/api/sessions");
        const sessions = await response.json();
        
        if (!sessions || sessions.length === 0) {
            throw new Error("No session data available");
        }
        
        // Helper: Parse date in format "DD/MM/YY" or "DD/MM/YYYY"
        function parseDate(dateStr) {
            const [day, month, year] = dateStr.split("/");
            let fullYear = year.length === 2 ? "20" + year : year;
            return new Date(fullYear, month - 1, day);
        }
        
        // Aggregate productivity by day for the last 2 weeks
        const today = new Date();
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(today.getDate() - 13); // includes today (14 days)
        
        const productivityByDay = {};
        
        sessions.forEach(session => {
            const date = parseDate(session.date);
            // Only include sessions from the last 2 weeks
            if (date >= twoWeeksAgo && date <= today) {
                const key = date.toISOString().slice(0,10); // YYYY-MM-DD
                if (!productivityByDay[key]) {
                    productivityByDay[key] = { total: 0, count: 0 };
                }
                productivityByDay[key].total += session.productivity;
                productivityByDay[key].count += 1;
            }
        });
        
        // Fill in missing days with null for gaps in the chart
        const labels = [];
        const data = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date(twoWeeksAgo);
            d.setDate(twoWeeksAgo.getDate() + i);
            const key = d.toISOString().slice(0,10);
            labels.push(key);
            if (productivityByDay[key]) {
                data.push(Number((productivityByDay[key].total / productivityByDay[key].count).toFixed(2)));
            } else {
                data.push(null);
            }
        }
        
        // Render Chart.js line chart
        const ctx = document.getElementById('productivityChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Avg Productivity',
                    data: data,
                    fill: true,
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.3,
                    pointRadius: 3,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        display: true,
                        ticks: {
                            autoSkip: false,
                            maxRotation: 60,
                            minRotation: 45,
                            color: '#6B7280',
                            font: { size: 10 },
                            callback: function(value, index, values) {
                                // Show as 'DD/MM'
                                const date = labels[index];
                                return date ? date.slice(8,10) + '/' + date.slice(5,7) : '';
                            }
                        },
                        title: { display: true, text: 'Date' }
                    },
                    y: {
                        min: 0,
                        max: 10,
                        title: { display: true, text: 'Productivity (0-10)' }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Failed to display productivity data:", error);
        productivityOverview.innerHTML = `
            <div class="text-red-500 font-bold text-center py-4">
                Failed to load productivity data. Please try again later.
            </div>`;
    }
});
