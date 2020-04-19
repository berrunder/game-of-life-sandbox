import { Universe } from '@berrunder/wasm-game-of-life';
import Fps from './lib/Fps';
import { CELL_SIZE, HEIGHT, WIDTH } from './lib/constants';
import { drawCells, drawGrid } from './lib/renderer2d';

let renderTimeout = 100;

const canvas = document.getElementById('life-canvas');
// Add 1px for border
canvas.height = (CELL_SIZE + 1) * HEIGHT + 1;
canvas.width = (CELL_SIZE + 1) * WIDTH + 1;
let universe = Universe.new_copperhead(WIDTH, HEIGHT);

const ctx = canvas.getContext('2d');
const fps = new Fps('fps');

let timeoutId;
const sleep = (timeout) =>
  new Promise((resolve) => {
    timeoutId = setTimeout(resolve, timeout);
  });

let animationId;

const isPaused = () => !animationId;

const renderLoop = () => {
  drawCells({ ctx, universe });
  fps.render();
  if (renderTimeout >= 10) {
    sleep(renderTimeout).then(() => {
      animationId = requestAnimationFrame(renderLoop);
    });
  } else {
    animationId = requestAnimationFrame(renderLoop);
  }
  universe.tick();
};

const playPauseBtn = document.getElementById('play-pause');

const play = () => {
  playPauseBtn.textContent = '⏸';
  renderLoop();
};

const pause = () => {
  playPauseBtn.textContent = '▶';
  clearTimeout(timeoutId);
  cancelAnimationFrame(animationId);
  animationId = null;
  timeoutId = null;
};

// Event handlers
const handlePlayPauseClick = () => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
};

let handleResetClick = () => {
  let wasPaused = isPaused();
  if (!wasPaused) {
    pause();
  }
  universe.set_width(WIDTH);
  universe.seed_random();
  drawCells({ ctx, universe });
  if (!wasPaused) {
    play();
  }
};

const handleClearClick = () => {
  if (!isPaused()) {
    pause();
  }
  // setting width or height clears all cells
  universe.set_width(WIDTH);
  drawCells({ ctx, universe });
};

const handleCanvasClick = (event) => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), HEIGHT - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), WIDTH - 1);

  if (event.ctrlKey && event.shiftKey) {
    universe.draw_pulsar(row, col);
  } else if (event.ctrlKey) {
    universe.draw_glider(row, col);
  } else {
    universe.toggle_cell(row, col);
  }

  drawCells({ ctx, universe });
};

playPauseBtn.addEventListener('click', handlePlayPauseClick);

const clearBtn = document.getElementById('clear-btn');
clearBtn.addEventListener('click', handleClearClick);

const resetBtn = document.getElementById('reset-btn');
resetBtn.addEventListener('click', handleResetClick);

const delaySlider = document.getElementById('delay-slider');
renderTimeout = Number(delaySlider.value);
delaySlider.addEventListener('change', (event) => {
  renderTimeout = Number(event.target.value);
});

canvas.addEventListener('click', handleCanvasClick);

// start rendering
drawGrid(ctx);
play();
