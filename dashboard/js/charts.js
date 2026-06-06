/**
 * Dashboard Chart.js Initialization
 */

let userGrowthChart, contentTypeChart, revenueHistoryChart, revenuePlansChart;

function initCharts() {
  const chartCtx1 = document.getElementById('chart-user-growth');
  if (chartCtx1) {
    const ctx = chartCtx1.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(79, 124, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(79, 124, 255, 0.0)');

    userGrowthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Active Users',
          data: [1500, 2400, 3800, 5200, 6800, 8500],
          borderColor: '#4f7cff',
          borderWidth: 3,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8c98c5' } },
          x: { grid: { display: false }, ticks: { color: '#8c98c5' } }
        }
      }
    });
  }

  const chartCtx2 = document.getElementById('chart-content-type');
  if (chartCtx2) {
    contentTypeChart = new Chart(chartCtx2, {
      type: 'doughnut',
      data: {
        labels: ['Video', 'Audio', 'Document', 'Text'],
        datasets: [{
          data: [45, 20, 25, 10],
          backgroundColor: ['#4f7cff', '#7c4dff', '#00d4ff', '#ffc107'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#e0e6ff', padding: 20 }
          }
        }
      }
    });
  }

  const chartCtx3 = document.getElementById('chart-revenue-history');
  if (chartCtx3) {
    const ctx = chartCtx3.getContext('2d');
    revenueHistoryChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'MRR',
          data: [5000, 7500, 9200, 11000, 12450, 14200],
          borderColor: '#00d4ff',
          borderWidth: 3,
          tension: 0.2,
          fill: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8c98c5' } },
          x: { grid: { display: false }, ticks: { color: '#8c98c5' } }
        }
      }
    });
  }

  const chartCtx4 = document.getElementById('chart-revenue-plans');
  if (chartCtx4) {
    revenuePlansChart = new Chart(chartCtx4, {
      type: 'bar',
      data: {
        labels: ['Free', 'Starter', 'Pro', 'Enterprise'],
        datasets: [{
          data: [40, 30, 20, 10],
          backgroundColor: '#7c4dff',
          borderWidth: 0,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8c98c5' } },
          x: { grid: { display: false }, ticks: { color: '#8c98c5' } }
        }
      }
    });
  }
}
