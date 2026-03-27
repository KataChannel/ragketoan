let rawData = {};
let currentChart = null;

async function init() {
    try {
        const response = await fetch('data.json');
        rawData = await response.json();
        
        // Populate select years if more than 2 default options
        const select = document.getElementById('year-select');
        select.innerHTML = "";
        
        // Raw keys (years) sorted DESC
        const years = Object.keys(rawData).sort((a,b) => b-a);
        years.forEach(year => {
            const opt = document.createElement('option');
            opt.value = year;
            opt.textContent = year;
            select.appendChild(opt);
        });

        select.addEventListener('change', (e) => {
            updateDashboard(e.target.value);
        });

        // Initial update with latest year
        updateDashboard(years[0]);
    } catch (err) {
        console.error("Error loading data:", err);
    }
}

function updateDashboard(year) {
    const data = rawData[year] || {};
    
    // Convert to arrays for Chart.js
    const labels = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const revs = [];
    const costs = [];
    
    let totalRev = 0;
    let totalCost = 0;

    for(let m = 1; m <= 12; m++){
        const mKey = m.toString();
        const val = data[mKey] || { n: 0, x: 0 };
        revs.push(val.x);
        costs.push(val.n);
        totalRev += val.x;
        totalCost += val.n;
    }

    // Update stats
    document.getElementById('total-revenue').innerText = totalRev.toLocaleString() + " ₫";
    document.getElementById('total-cost').innerText = totalCost.toLocaleString() + " ₫";
    document.getElementById('net-margin').innerText = (totalRev - totalCost).toLocaleString() + " ₫";

    // Chart
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    if(currentChart) currentChart.destroy();

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: revs,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#6366f1'
                },
                {
                    label: 'Cost',
                    data: costs,
                    borderColor: '#f43f5e',
                    backgroundColor: 'rgba(244, 63, 94, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#f43f5e'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#94a3b8', font: { family: 'Outfit', size: 14 } }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', callback: (v) => v.toLocaleString() }
                }
            }
        }
    });
}

window.onload = init;
