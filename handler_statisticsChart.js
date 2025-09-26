//>>>This File: handler_statisticsChart.js<<<

// Get the canvas element & the 'no data' message element
const activityChartContext = document.getElementById('activityChart').getContext('2d');
const noDataMessage = document.getElementById('noDataMessage');
const chartCanvas = document.getElementById('activityChart');

// Holds chart instance to be updated later
let activityLineChart = null;

//----READS ALL ACTIVITIES & UPDATES THE GRAPHIC CHART----
function updateStatisticsGraphicSection() {
    // Gets all the rendered Activity Boxes in the Recent Activities Section
    const activityElements = document.querySelectorAll('.submittedActivityBox');

    // If no activities exist, hides or removes the canvas, shows message & terminates function
    if (activityElements.length === 0) {
        chartCanvas.classList.add('hidden');
        noDataMessage.classList.remove('hidden');
        if (activityLineChart) {
            activityLineChart.destroy();
            activityLineChart = null;
        }
        return; 
    }

    // If activities exist, ensures the chart is visible & the message is hidden
    chartCanvas.classList.remove('hidden');
    noDataMessage.classList.add('hidden');

    // Hold the labels (dates) and data points (scores)
    const labels = [];
    const dataPoints = [];

    // Reverses & holds the activities so they can be displayed in the correct chronological order
    const reversedActivities = Array.from(activityElements).reverse();

    // Builds labels & data points
    reversedActivities.forEach(element => {
        const timestamp = element.querySelector('.submittedActivityDate')?.getAttribute("data-timestamp");
        const score = parseInt(element.querySelector('.impactScore')?.textContent || '0', 10);
        if (timestamp) {
            labels.push(new Date(timestamp));
            dataPoints.push(score);
        }
    });

    // If the Graphic Chart exists, ensures is updated, otherwise creates a new one
    if (activityLineChart) {
        activityLineChart.data.labels = labels;
        activityLineChart.data.datasets[0].data = dataPoints;
        activityLineChart.update();
    } else {
        activityLineChart = new Chart(activityChartContext, {
            // Adjusts Chart visual characteristics
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Impact Points Over Time',
                    data: dataPoints,
                    backgroundColor: '#ff9100',
                    borderColor: '#01612c',
                    borderWidth: 3,
                    tension: 0.05,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            // Adjusts Chart structure & elements
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Impact Score' },
                        ticks: {
                            stepSize: 5
                        }
                    },
                    x: {
                        type: 'time', 
                        time: {
                            unit: 'day',
                            displayFormats: {
                                minute: 'MMM d, HH:mm',
                                hour: 'MMM d, HH:mm',
                                day: 'MMM d'
                            }
                        },
                        title: { display: true, text: 'Time of Activity' }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top' }
                }
            }
        });
    }

    console.log("Chart update triggered with", labels.length, "points");
    
}

// Initial call to set the correct state (e.g., show "no data" message) when the page loads
updateStatisticsGraphicSection();
