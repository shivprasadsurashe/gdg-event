/**
 * PulseFlow Canvas Telemetry Chart
 * High-performance, zero-dependency, responsive canvas visualization
 * with smooth bezier curves, glowing area fills, and interactive crosshair.
 */

class TelemetryChart {
  constructor(canvasId, tooltipId) {
    this.canvas = document.getElementById(canvasId);
    this.tooltip = document.getElementById(tooltipId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.currentRange = '24h';
    this.data = [];
    this.hoverIndex = -1;
    this.animationProgress = 1;
    this.isLive = false;
    this.liveInterval = null;

    this.init();
  }

  init() {
    this.generateData(this.currentRange);
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Mouse interaction
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());

    // Initial render
    this.render();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    this.render();
  }

  generateData(range) {
    this.data = [];
    let count = 24;
    let labelPrefix = 'Hour ';
    let baseVal = 18;

    if (range === '24h') {
      count = 24;
      for (let i = 0; i < count; i++) {
        const time = `${(i + 1).toString().padStart(2, '0')}:00`;
        const val = +(baseVal + Math.sin(i / 2.5) * 5 + (Math.random() - 0.5) * 3).toFixed(1);
        this.data.push({ label: time, value: Math.max(10, val), agents: Math.floor(1200 + val * 18) });
      }
    } else if (range === '7d') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      days.forEach((day, idx) => {
        const val = +(baseVal + Math.sin(idx) * 4 + (Math.random() - 0.5) * 2).toFixed(1);
        this.data.push({ label: day, value: Math.max(10, val), agents: Math.floor(1300 + val * 15) });
      });
    } else if (range === '30d') {
      count = 30;
      for (let i = 1; i <= count; i++) {
        const val = +(baseVal + Math.sin(i / 4) * 6 + (Math.random() - 0.5) * 4).toFixed(1);
        this.data.push({ label: `Day ${i}`, value: Math.max(10, val), agents: Math.floor(1250 + val * 16) });
      }
    } else if (range === 'live') {
      count = 20;
      for (let i = 0; i < count; i++) {
        const val = +(baseVal + (Math.random() - 0.5) * 4).toFixed(1);
        this.data.push({ label: `t-${count - i}s`, value: Math.max(10, val), agents: Math.floor(1400 + val * 12) });
      }
    }
  }

  setRange(range) {
    this.currentRange = range;
    if (this.liveInterval) {
      clearInterval(this.liveInterval);
      this.liveInterval = null;
    }

    this.generateData(range);

    if (range === 'live') {
      this.liveInterval = setInterval(() => {
        const last = this.data[this.data.length - 1];
        const nextVal = +(18 + (Math.random() - 0.5) * 5).toFixed(1);
        this.data.shift();
        this.data.push({
          label: 'now',
          value: Math.max(10, nextVal),
          agents: Math.floor(1400 + nextVal * 12)
        });
        this.render();
      }, 1400);
    }

    this.render();
  }

  simulateSpike() {
    if (this.data.length === 0) return;
    const mid = Math.floor(this.data.length / 2);
    this.data[mid].value = +(this.data[mid].value + 16).toFixed(1);
    if (this.data[mid + 1]) this.data[mid + 1].value += 11;
    if (this.data[mid - 1]) this.data[mid - 1].value += 8;
    this.render();

    // Pulse feedback toast
    if (window.Toast) {
      window.Toast.info('Load Test Injected', 'Simulated 50,000 synthetic queries across cluster nodes.');
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = { top: 25, right: 30, bottom: 35, left: 45 };
    const chartWidth = this.width - padding.left - padding.right;

    if (x < padding.left || x > this.width - padding.right) {
      this.handleMouseLeave();
      return;
    }

    const step = chartWidth / (this.data.length - 1);
    const index = Math.round((x - padding.left) / step);

    if (index >= 0 && index < this.data.length) {
      this.hoverIndex = index;
      const point = this.data[index];
      const pointX = padding.left + index * step;

      // Update tooltip
      if (this.tooltip) {
        this.tooltip.innerHTML = `
          <div style="font-weight:700;margin-bottom:2px;">${point.label}</div>
          <div style="color:var(--primary-light);">Latency: <strong>${point.value} ms</strong></div>
          <div style="color:var(--accent-cyan);font-size:0.75rem;">Agents: <strong>${point.agents.toLocaleString()}</strong></div>
        `;
        this.tooltip.style.left = `${pointX - 40}px`;
        this.tooltip.style.top = `${y - 65}px`;
        this.tooltip.style.opacity = '1';
      }

      this.render();
    }
  }

  handleMouseLeave() {
    this.hoverIndex = -1;
    if (this.tooltip) {
      this.tooltip.style.opacity = '0';
    }
    this.render();
  }

  render() {
    if (!this.ctx || !this.width || !this.height) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const padding = { top: 25, right: 30, bottom: 35, left: 45 };
    const chartWidth = this.width - padding.left - padding.right;
    const chartHeight = this.height - padding.top - padding.bottom;

    if (this.data.length < 2) return;

    // Determine scale
    let maxVal = Math.max(...this.data.map(d => d.value), 35);
    maxVal = Math.ceil(maxVal / 5) * 5;
    const minVal = 0;

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (chartHeight / gridSteps) * i;
      const val = Math.round(maxVal - (maxVal / gridSteps) * i);

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(this.width - padding.right, y);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}ms`, padding.left - 8, y + 3);
    }
    ctx.setLineDash([]); // Reset dash

    // Calculate Coordinates
    const points = this.data.map((item, idx) => {
      const x = padding.left + (chartWidth / (this.data.length - 1)) * idx;
      const y = padding.top + chartHeight - ((item.value - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, ...item };
    });

    // Draw Gradient Area Under Curve
    const areaGradient = ctx.createLinearGradient(0, padding.top, 0, this.height - padding.bottom);
    areaGradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    areaGradient.addColorStop(0.6, 'rgba(6, 182, 212, 0.15)');
    areaGradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(cx, p0.y, cx, p1.y, p1.x, p1.y);
    }

    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.lineTo(points[0].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // Draw Smooth Line Stroke
    const strokeGradient = ctx.createLinearGradient(padding.left, 0, this.width - padding.right, 0);
    strokeGradient.addColorStop(0, '#6366f1');
    strokeGradient.addColorStop(0.5, '#818cf8');
    strokeGradient.addColorStop(1, '#06b6d4');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(cx, p0.y, cx, p1.y, p1.x, p1.y);
    }
    ctx.strokeStyle = strokeGradient;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw X-axis tick labels (sparse)
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    const stepLabel = Math.ceil(points.length / 6);
    points.forEach((p, idx) => {
      if (idx % stepLabel === 0 || idx === points.length - 1) {
        ctx.fillText(p.label, p.x, this.height - 12);
      }
    });

    // Draw Hover Crosshair and Dot
    if (this.hoverIndex !== -1 && points[this.hoverIndex]) {
      const hp = points[this.hoverIndex];

      // Vertical line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hp.x, padding.top);
      ctx.lineTo(hp.x, padding.top + chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Outer glow circle
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(hp.x, hp.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else {
      // Highlight the latest data point with pulse
      const lastPoint = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }
}

window.TelemetryChart = TelemetryChart;
