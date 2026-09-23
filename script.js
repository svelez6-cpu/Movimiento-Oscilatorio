const cover = document.querySelector('.cover');
const book = document.getElementById('book');
const pages = Array.from(document.querySelectorAll('.page'));
const indicator = document.getElementById('pageIndicator');
const totalPages = pages.length;
const totalSpreads = Math.ceil(totalPages / 2);
let inBookMode = false;
let currentSpread = 0;

function getVisibleIndexes() {
  const leftIndex = currentSpread * 2;
  const rightIndex = leftIndex + 1;
  return { leftIndex, rightIndex };
}

function updatePageIndicator() {
  if (!indicator) return;
  if (!inBookMode) {
    indicator.textContent = 'Portada';
    return;
  }

  const { leftIndex, rightIndex } = getVisibleIndexes();
  const leftNumber = leftIndex + 1;
  const rightNumber = rightIndex < totalPages ? rightIndex + 1 : null;
  indicator.textContent = rightNumber
    ? `Páginas ${leftNumber}-${rightNumber} de ${totalPages}`
    : `Página ${leftNumber} de ${totalPages}`;

  pages.forEach((page, index) => {
    const isLeft = index === leftIndex;
    const isRight = index === rightIndex && rightIndex < totalPages;
    const isSingle = index === leftIndex && rightIndex >= totalPages;
    const visible = isLeft || isRight || isSingle;
    page.classList.toggle('active', visible);
    page.classList.toggle('left-page', isLeft);
    page.classList.toggle('right-page', isRight);
    page.classList.toggle('single-page', isSingle);
  });
}

function setViewState() {
  const coverVisible = !inBookMode;
  if (cover) cover.classList.toggle('is-hidden', !coverVisible);
  if (book) book.classList.toggle('is-hidden', coverVisible);

  if (!inBookMode) {
    pages.forEach((page) => page.classList.remove('active', 'left-page', 'right-page', 'single-page'));
    if (indicator) indicator.textContent = 'Portada';
    return;
  }

  updatePageIndicator();
}

document.querySelector('[data-action="inicio"]').addEventListener('click', () => {
  inBookMode = false;
  currentSpread = 0;
  setViewState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelector('[data-action="prev"]').addEventListener('click', () => {
  if (!inBookMode) return;
  if (currentSpread > 0) currentSpread -= 1;
  setViewState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelector('[data-action="next"]').addEventListener('click', () => {
  if (!inBookMode) {
    inBookMode = true;
    currentSpread = 0;
    setViewState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (currentSpread < totalSpreads - 1) currentSpread += 1;
  setViewState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

setViewState();
if (window.lucide) lucide.createIcons();

const canvas = document.getElementById('graphCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const stylePanel = document.getElementById('style-panel');
  const lineColorInput = document.getElementById('lineColor');
  const lineWidthInput = document.getElementById('lineWidth');
  const lineStyleInput = document.getElementById('lineStyle');
  const graphState = {
    scale: 38,
    panX: 0,
    panY: 0,
    activeTool: 'pan',
    lineColor: '#7c3aed',
    lineWidth: 3,
    lineStyle: 'solid'
  };
  const pointer = { active: false, lastX: 0, lastY: 0 };

  function worldToScreen(x, y) {
    return { x: canvas.width / 2 + (x - graphState.panX) * graphState.scale, y: canvas.height / 2 - (y - graphState.panY) * graphState.scale };
  }

  function screenToWorld(x, y) {
    return { x: (x - canvas.width / 2) / graphState.scale + graphState.panX, y: (canvas.height / 2 - y) / graphState.scale + graphState.panY };
  }

  function drawGrid() {
    const width = canvas.width;
    const height = canvas.height;
    const origin = worldToScreen(0, 0);
    const majorSpacing = 1;
    const minorSpacing = 0.2;

    ctx.clearRect(0, 0, width, height);
    const minWorldX = screenToWorld(0, 0).x;
    const maxWorldX = screenToWorld(width, 0).x;
    const minWorldY = screenToWorld(0, height).y;
    const maxWorldY = screenToWorld(0, 0).y;
    const majorXStart = Math.ceil(minWorldX / majorSpacing) * majorSpacing;
    const majorXEnd = Math.floor(maxWorldX / majorSpacing) * majorSpacing;
    const majorYStart = Math.ceil(minWorldY / majorSpacing) * majorSpacing;
    const majorYEnd = Math.floor(maxWorldY / majorSpacing) * majorSpacing;

    ctx.strokeStyle = 'rgba(126, 163, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let x = Math.ceil(minWorldX / minorSpacing) * minorSpacing; x <= maxWorldX; x += minorSpacing) {
      const p = worldToScreen(x, 0);
      ctx.beginPath();
      ctx.moveTo(p.x, 0);
      ctx.lineTo(p.x, height);
      ctx.stroke();
    }
    for (let y = Math.ceil(minWorldY / minorSpacing) * minorSpacing; y <= maxWorldY; y += minorSpacing) {
      const p = worldToScreen(0, y);
      ctx.beginPath();
      ctx.moveTo(0, p.y);
      ctx.lineTo(width, p.y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(126, 163, 255, 0.34)';
    ctx.lineWidth = 1.4;
    for (let x = majorXStart; x <= majorXEnd; x += majorSpacing) {
      const p = worldToScreen(x, 0);
      ctx.beginPath();
      ctx.moveTo(p.x, 0);
      ctx.lineTo(p.x, height);
      ctx.stroke();
    }
    for (let y = majorYStart; y <= majorYEnd; y += majorSpacing) {
      const p = worldToScreen(0, y);
      ctx.beginPath();
      ctx.moveTo(0, p.y);
      ctx.lineTo(width, p.y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.stroke();

    ctx.fillStyle = 'rgba(221, 233, 255, 0.85)';
    ctx.font = '12px Inter';
    for (let x = Math.round(minWorldX); x <= Math.round(maxWorldX); x++) {
      const p = worldToScreen(x, 0);
      if (Math.abs(p.x - origin.x) > 10) ctx.fillText(String(x), p.x + 6, origin.y + 18);
    }
    for (let y = Math.round(minWorldY); y <= Math.round(maxWorldY); y++) {
      const p = worldToScreen(0, y);
      if (Math.abs(p.y - origin.y) > 10) ctx.fillText(String(y), origin.x + 8, p.y - 8);
    }
  }

  function drawSignal() {
    const color = graphState.lineColor;
    const width = graphState.lineWidth;
    const dash = graphState.lineStyle === 'dashed' ? [9, 7] : graphState.lineStyle === 'dotted' ? [2, 6] : [];
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);

    const amplitude = 2.6;
    const frequency = 1.1;
    const timeSamples = 300;
    for (let i = 0; i <= timeSamples; i++) {
      const t = ((i / timeSamples) * 16) - 8;
      const x = amplitude * Math.sin(frequency * t);
      const pt = worldToScreen(t, x);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    const origin = worldToScreen(0, 0);
    const point = worldToScreen(0, amplitude);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = 'rgba(251,191,36,0.8)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  function renderGraph() { drawGrid(); drawSignal(); }
  function setActiveTool(tool) {
    graphState.activeTool = tool;
    if (tool === 'palette') stylePanel.classList.toggle('hidden');
    if (tool !== 'palette') stylePanel.classList.add('hidden');
  }

  if (lineColorInput) lineColorInput.addEventListener('input', (event) => { graphState.lineColor = event.target.value; renderGraph(); });
  if (lineWidthInput) lineWidthInput.addEventListener('input', (event) => { graphState.lineWidth = Number(event.target.value); renderGraph(); });
  if (lineStyleInput) lineStyleInput.addEventListener('change', (event) => { graphState.lineStyle = event.target.value; renderGraph(); });

  document.querySelectorAll('#mainToolbar .tool-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const tool = button.dataset.tool;
      if (tool === 'zoom-in') graphState.scale *= 1.15;
      else if (tool === 'zoom-out') graphState.scale /= 1.15;
      else if (tool === 'reset') { graphState.scale = 38; graphState.panX = 0; graphState.panY = 0; }
      else if (tool === 'palette') { setActiveTool(tool); return; }
      else setActiveTool(tool);
      renderGraph();
    });
  });

  canvas.addEventListener('pointerdown', (event) => { pointer.active = true; pointer.lastX = event.clientX; pointer.lastY = event.clientY; canvas.setPointerCapture(event.pointerId); });
  canvas.addEventListener('pointermove', (event) => {
    if (!pointer.active) return;
    const dx = event.clientX - pointer.lastX;
    const dy = event.clientY - pointer.lastY;
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    if (graphState.activeTool === 'pan') {
      graphState.panX -= dx / graphState.scale;
      graphState.panY += dy / graphState.scale;
      renderGraph();
    }
  });
  canvas.addEventListener('pointerup', () => { pointer.active = false; });
  canvas.addEventListener('pointerleave', () => { pointer.active = false; });
  canvas.addEventListener('wheel', (event) => { event.preventDefault(); const delta = event.deltaY > 0 ? 0.9 : 1.1; graphState.scale *= delta; renderGraph(); }, { passive: false });

  renderGraph();
}

const masCanvas = document.getElementById('masCanvas');
if (masCanvas) {
  const masCtx = masCanvas.getContext('2d');
  const masStylePanel = document.getElementById('style-panel-2');
  const signalColorInput = document.getElementById('signalColor');
  const velocityColorInput = document.getElementById('velocityColor');
  const accelColorInput = document.getElementById('accelColor');
  const timeSlider = document.getElementById('timeSlider');
  const timeValue = document.getElementById('timeValue');
  const masState = { amplitude: 2.4, omega: 1.8, time: 0, colorX: '#7c3aed', colorV: '#22c55e', colorA: '#f97316' };

  function drawMASGrid() {
    const w = masCanvas.width;
    const h = masCanvas.height;
    masCtx.clearRect(0, 0, w, h);
    masCtx.strokeStyle = 'rgba(126, 163, 255, 0.12)';
    masCtx.lineWidth = 1;
    for (let x = 0; x <= w; x += 40) { masCtx.beginPath(); masCtx.moveTo(x, 0); masCtx.lineTo(x, h); masCtx.stroke(); }
    for (let y = 0; y <= h; y += 40) { masCtx.beginPath(); masCtx.moveTo(0, y); masCtx.lineTo(w, y); masCtx.stroke(); }
    masCtx.strokeStyle = 'rgba(255,255,255,0.88)';
    masCtx.beginPath();
    masCtx.moveTo(0, h / 2); masCtx.lineTo(w, h / 2); masCtx.moveTo(w / 2, 0); masCtx.lineTo(w / 2, h); masCtx.stroke();
  }

  function drawMASPlot() {
    const A = masState.amplitude;
    const w = masCanvas.width;
    const h = masCanvas.height;
    const tMin = -Math.PI;
    const tMax = Math.PI;
    drawMASGrid();

    const xValues = [];
    const vValues = [];
    const aValues = [];
    for (let i = 0; i <= 250; i++) {
      const t = tMin + (i / 250) * (tMax - tMin);
      xValues.push({ x: t, y: A * Math.sin(masState.omega * t) });
      vValues.push({ x: t, y: A * masState.omega * Math.cos(masState.omega * t) });
      aValues.push({ x: t, y: -A * Math.pow(masState.omega, 2) * Math.sin(masState.omega * t) });
    }

    const mapPoint = (pt) => ({ x: ((pt.x - tMin) / (tMax - tMin)) * w, y: h - ((pt.y + 3.5) / 7) * h });
    const drawSeries = (values, color, lineWidth = 2) => {
      masCtx.beginPath();
      masCtx.strokeStyle = color;
      masCtx.lineWidth = lineWidth;
      values.forEach((pt, index) => {
        const p = mapPoint(pt);
        if (index === 0) masCtx.moveTo(p.x, p.y);
        else masCtx.lineTo(p.x, p.y);
      });
      masCtx.stroke();
    };

    drawSeries(xValues, masState.colorX, 3);
    drawSeries(vValues, masState.colorV, 2.5);
    drawSeries(aValues, masState.colorA, 2.5);

    const markerT = masState.time;
    const markerX = ((markerT - tMin) / (tMax - tMin)) * w;
    masCtx.strokeStyle = 'rgba(255,255,255,0.6)';
    masCtx.setLineDash([6, 6]);
    masCtx.beginPath();
    masCtx.moveTo(markerX, 0);
    masCtx.lineTo(markerX, h);
    masCtx.stroke();
    masCtx.setLineDash([]);

    const xAtT = A * Math.sin(masState.omega * markerT);
    const vAtT = A * masState.omega * Math.cos(masState.omega * markerT);
    const aAtT = -A * Math.pow(masState.omega, 2) * Math.sin(masState.omega * markerT);
    [{ value: xAtT, color: masState.colorX }, { value: vAtT, color: masState.colorV }, { value: aAtT, color: masState.colorA }].forEach(({ value, color }) => {
      const yPos = h - ((value + 3.5) / 7) * h;
      masCtx.beginPath();
      masCtx.fillStyle = color;
      masCtx.arc(markerX, yPos, 4, 0, Math.PI * 2);
      masCtx.fill();
    });
  }

  if (signalColorInput) signalColorInput.addEventListener('input', (event) => { masState.colorX = event.target.value; drawMASPlot(); });
  if (velocityColorInput) velocityColorInput.addEventListener('input', (event) => { masState.colorV = event.target.value; drawMASPlot(); });
  if (accelColorInput) accelColorInput.addEventListener('input', (event) => { masState.colorA = event.target.value; drawMASPlot(); });
  if (timeSlider) {
    timeSlider.addEventListener('input', (event) => {
      masState.time = Number(event.target.value);
      if (timeValue) timeValue.textContent = `${masState.time.toFixed(2)} rad`;
      drawMASPlot();
    });
  }
  document.querySelectorAll('#masToolbar .tool-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const tool = button.dataset.tool;
      if (tool === 'palette') { if (masStylePanel) masStylePanel.classList.toggle('hidden'); return; }
      if (tool === 'zoom-in') masState.omega = Math.min(4, masState.omega + 0.1);
      else if (tool === 'zoom-out') masState.omega = Math.max(0.6, masState.omega - 0.1);
      else if (tool === 'reset') { masState.omega = 1.8; masState.time = 0; if (timeSlider) timeSlider.value = '0'; if (timeValue) timeValue.textContent = '0.00 rad'; }
      drawMASPlot();
    });
  });

  drawMASPlot();
}

window.addEventListener('resize', () => { if (canvas) renderGraph(); if (masCanvas) drawMASPlot(); });
updatePageIndicator();

const energyCanvas = document.getElementById('energyCanvas');
const springCanvas = document.getElementById('springCanvas');
if (energyCanvas && springCanvas) {
  const energyCtx = energyCanvas.getContext('2d');
  const springCtx = springCanvas.getContext('2d');
  const amplitudeInput = document.getElementById('springAmplitude');
  const frequencyInput = document.getElementById('springFrequency');
  const springReadout = document.getElementById('springReadout');
  const springState = { amplitude: Number(amplitudeInput.value), frequency: Number(frequencyInput.value), time: 0 };

  function drawAxes(context, width, height) {
    context.clearRect(0, 0, width, height);
    context.strokeStyle = 'rgba(30, 41, 59, 0.25)';
    context.lineWidth = 1;
    for (let x = 0; x <= width; x += 45) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); }
    for (let y = 0; y <= height; y += 35) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); }
    context.strokeStyle = '#1e293b';
    context.beginPath(); context.moveTo(0, height / 2); context.lineTo(width, height / 2); context.stroke();
  }

  function drawAdditionalGraphs() {
    const width = energyCanvas.width;
    const height = energyCanvas.height;
    const omega = 2 * Math.PI * springState.frequency;
    drawAxes(energyCtx, width, height);
    energyCtx.beginPath();
    energyCtx.strokeStyle = '#7c3aed';
    energyCtx.lineWidth = 4;
    for (let i = 0; i <= width; i += 3) {
      const t = (i / width) * 2;
      const energy = Math.pow(Math.sin(omega * t), 2);
      const y = height - 20 - energy * (height - 40);
      if (i === 0) energyCtx.moveTo(i, y); else energyCtx.lineTo(i, y);
    }
    energyCtx.stroke();

    const springWidth = springCanvas.width;
    const springHeight = springCanvas.height;
    drawAxes(springCtx, springWidth, springHeight);
    const displacement = springState.amplitude * Math.sin(omega * springState.time);
    const anchorX = 90;
    const centerX = springWidth * 0.58;
    const massX = centerX + displacement * 90;
    const massY = springHeight / 2;
    springCtx.strokeStyle = '#2563eb';
    springCtx.lineWidth = 3;
    springCtx.beginPath();
    springCtx.moveTo(anchorX, massY);
    for (let i = 0; i <= 12; i += 1) {
      const x = anchorX + ((massX - anchorX) * i) / 12;
      const y = massY + (i === 0 || i === 12 ? 0 : (i % 2 === 0 ? -16 : 16));
      springCtx.lineTo(x, y);
    }
    springCtx.stroke();
    springCtx.fillStyle = '#7c3aed';
    springCtx.beginPath();
    springCtx.arc(massX, massY, 24, 0, Math.PI * 2);
    springCtx.fill();
    springCtx.fillStyle = '#000';
    springCtx.font = '18px Inter';
    springCtx.fillText(`x = ${displacement.toFixed(2)} m`, 24, 30);
    if (springReadout) springReadout.textContent = `A = ${springState.amplitude.toFixed(1)} m | f = ${springState.frequency.toFixed(1)} Hz | T = ${(1 / springState.frequency).toFixed(2)} s`;
  }

  amplitudeInput.addEventListener('input', (event) => { springState.amplitude = Number(event.target.value); drawAdditionalGraphs(); });
  frequencyInput.addEventListener('input', (event) => { springState.frequency = Number(event.target.value); drawAdditionalGraphs(); });
  springCanvas.addEventListener('pointermove', (event) => { if (event.buttons) { springState.time += 0.02; drawAdditionalGraphs(); } });
  drawAdditionalGraphs();
  let previousFrame = performance.now();
  function animateSpring(timestamp) {
    springState.time += Math.min((timestamp - previousFrame) / 1000, 0.05);
    previousFrame = timestamp;
    drawAdditionalGraphs();
    requestAnimationFrame(animateSpring);
  }
  requestAnimationFrame(animateSpring);
}
