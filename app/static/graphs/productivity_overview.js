let productivityChartInstance = null;

async function fetchProductivityData() {
    const response = await fetch('/api/user-stats');
    if (!response.ok) {
        throw new Error('Failed to fetch productivity data');
    }
    return await response.json();
}

// Helper to fetch trend data for a given range
async function fetchTrendData(range = 'week') {
    const response = await fetch(`/api/productivity-trend?range=${range}`);
    if (!response.ok) throw new Error('Failed to fetch trend data');
    return await response.json();
}

async function renderProductivityChart(range = 'week') {
    const spinner = document.getElementById('productivitySpinner');
    const skeleton = document.getElementById('productivitySkeleton');
    if (skeleton) skeleton.style.opacity = '1';
    if (spinner) spinner.style.display = 'flex';
    try {
        const data = await fetchTrendData(range);
        const labels = data.map(d => d.date);
        const studyData = data.map(d => (d.study_minutes / 60).toFixed(2));
        const prodData = data.map(d => d.avg_productivity);

        const canvas = document.getElementById('productivityChart');
        if (!canvas) throw new Error('Canvas not found');
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99,102,241,0.7)');
        gradient.addColorStop(1, 'rgba(99,102,241,0.1)');

        if (window.productivityChartInstance) {
            window.productivityChartInstance.destroy();
        }

        window.productivityChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Study Time (hrs)',
                        data: studyData,
                        backgroundColor: gradient,
                        borderRadius: 14,
                        borderSkipped: false,
                        yAxisID: 'y',
                        barPercentage: 0.6,
                        categoryPercentage: 0.5,
                        hoverBackgroundColor: 'rgba(99,102,241,0.9)'
                    },
                    {
                        label: 'Avg Productivity (%)',
                        data: prodData,
                        type: 'line',
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99,102,241,0.15)',
                        tension: 0.45,
                        yAxisID: 'y1',
                        pointRadius: 5,
                        pointBackgroundColor: '#6366f1',
                        pointBorderWidth: 2,
                        fill: false,
                        hoverBorderColor: '#3730a3'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { 
                        position: 'top', 
                        labels: { font: { size: 15, weight: 'bold' } } 
                    },
                    tooltip: {
                        backgroundColor: '#18181b',
                        titleColor: '#fff',
                        bodyColor: '#d1d5db',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        padding: 14,
                        callbacks: {
                            label: ctx => {
                                if (ctx.dataset.label.includes('Study')) {
                                    return `${ctx.dataset.label}: ${ctx.raw} hrs`;
                                }
                                return `${ctx.dataset.label}: ${ctx.raw}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 13, weight: 'medium' }, color: '#6b7280' }
                    },
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Hours', font: { size: 14, weight: 'bold' } },
                        grid: { color: '#e5e7eb' },
                        ticks: { color: '#6b7280' }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        title: { display: true, text: 'Productivity (%)', font: { size: 14, weight: 'bold' } },
                        grid: { drawOnChartArea: false },
                        min: 0,
                        max: 100,
                        ticks: { color: '#6366f1' }
                    }
                },
                animation: {
                    duration: 1200,
                    easing: 'easeOutQuart'
                }
            }
        });
    } catch (error) {
        console.error('Error rendering productivity chart:', error);
    } finally {
        if (spinner) spinner.style.display = 'none';
        if (skeleton) skeleton.style.opacity = '0';
    }
}

// Modern toggle logic
function setupProdRangeToggle() {
    const buttons = document.querySelectorAll('.prod-range-btn');
    let current = 'week';
    buttons.forEach(btn => {
        btn.classList.toggle('bg-blue-500', btn.dataset.range === current);
        btn.classList.toggle('text-white', btn.dataset.range === current);
        btn.classList.toggle('bg-gray-200', btn.dataset.range !== current);
        btn.classList.toggle('text-blue-500', btn.dataset.range !== current);

        btn.addEventListener('click', () => {
            if (btn.dataset.range === current) return;
            current = btn.dataset.range;
            buttons.forEach(b => {
                b.classList.toggle('bg-blue-500', b.dataset.range === current);
                b.classList.toggle('text-white', b.dataset.range === current);
                b.classList.toggle('bg-gray-200', b.dataset.range !== current);
                b.classList.toggle('text-blue-500', b.dataset.range !== current);
            });
            renderProductivityChart(current);
        });
    });
}

// Export chart as PNG
function setupExportButton() {
    const btn = document.getElementById('downloadChart');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const chart = window.productivityChartInstance;
        if (!chart) return;
        const link = document.createElement('a');
        link.href = chart.toBase64Image();
        link.download = 'productivity_overview.png';
        link.click();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupProdRangeToggle();
    setupExportButton();
    renderProductivityChart('week');
});

