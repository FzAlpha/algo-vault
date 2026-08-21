// Native Canvas & SVG Chart Visualizations

export class ChartRenderer {
  // 1. Render 365-Day Heatmap Grid
  static renderHeatmap(containerId, heatmapData = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const scrollArea = document.createElement('div');
    scrollArea.className = 'heatmap-scroll-area';

    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';

    heatmapData.forEach(entry => {
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      cell.setAttribute('data-level', entry.level || 0);
      cell.title = `${entry.date}: ${entry.count} submission${entry.count === 1 ? '' : 's'}`;
      grid.appendChild(cell);
    });

    scrollArea.appendChild(grid);
    container.appendChild(scrollArea);
  }

  // 2. Render Language Donut Chart on HTML5 Canvas
  static renderLanguageDonut(canvasId, langData = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const colors = {
      'C++': '#4ade80',
      'C': '#22d3ee',
      'Python': '#38bdf8',
      'Python3': '#38bdf8',
      'Java': '#fbbf24',
      'Rust': '#f87171',
      'TypeScript': '#a855f7',
      'JavaScript': '#eab308',
      'Go': '#06b6d4',
      'Kotlin': '#ec4899',
      'Bash': '#a3e635',
      'Swift': '#f97316',
      'Ruby': '#e11d48',
      'PHP': '#818cf8',
      'SQL': '#2dd4bf'
    };

    const entries = Object.entries(langData);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    if (total === 0) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const innerRadius = radius * 0.65;

    let startAngle = -Math.PI / 2;

    entries.forEach(([lang, count]) => {
      const sliceAngle = (count / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const color = colors[lang] || '#9ca3af';

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      startAngle = endAngle;
    });

    // Center total text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 6);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText('SOLVED', centerX, centerY + 14);
  }

  // 3. Render Speed Percentile Speedometer
  static renderSpeedometer(canvasId, percentile = 88) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height * 0.75;
    const radius = width * 0.4;

    // Background track arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#1e2d26';
    ctx.stroke();

    // Foreground filled arc
    const fillEnd = Math.PI + (percentile / 100) * Math.PI;
    const gradient = ctx.createLinearGradient(0, centerY, width, centerY);
    gradient.addColorStop(0, '#38bdf8');
    gradient.addColorStop(0.5, '#4ade80');
    gradient.addColorStop(1, '#a855f7');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, fillEnd);
    ctx.lineWidth = 14;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${percentile}%`, centerX, centerY - 20);

    ctx.fillStyle = '#4ade80';
    ctx.font = '500 12px "Inter", sans-serif';
    ctx.fillText('Faster than others', centerX, centerY + 6);
  }
}
