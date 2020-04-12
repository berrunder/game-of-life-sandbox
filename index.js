import { Universe } from 'wasm-game-of-life';
import { memory } from 'wasm-game-of-life/wasm_game_of_life_bg';
import Fps from './Fps';

const CELL_SIZE = 8; // px
const GRID_COLOR = '#ccc';
const DEAD_COLOR = '#fff';
const ALIVE_COLOR = '#000';

const HEIGHT = 100;
const WIDTH = 128;
let renderTimeout = 100;

const canvas = document.getElementById('life-canvas');
// Add 1px for border
canvas.height = (CELL_SIZE + 1) * HEIGHT + 1;
canvas.width = (CELL_SIZE + 1) * WIDTH + 1;
let universe = Universe.new_copperhead(WIDTH, HEIGHT);

const ctx = canvas.getContext('2d');
const fps = new Fps('fps');

const getIndex = (row, col) => row * WIDTH + col;

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= WIDTH; i++) {
    const x = i * (CELL_SIZE + 1) + 1;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, (CELL_SIZE + 1) * HEIGHT + 1);
  }

  // Horizontal lines.
  for (let i = 0; i <= HEIGHT; i++) {
    const y = i * (CELL_SIZE + 1) + 1;
    ctx.moveTo(0, y);
    ctx.lineTo((CELL_SIZE + 1) * WIDTH + 1, y);
  }

  ctx.stroke();
};

const isBitSet = (byteArray, bitNumber) => {
  const byteNumber = Math.floor(bitNumber / 8);
  const mask = 1 << bitNumber % 8;

  return (byteArray[byteNumber] & mask) === mask;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, (WIDTH * HEIGHT) / 8);

  ctx.beginPath();

  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = isBitSet(cells, idx) ? ALIVE_COLOR : DEAD_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

let timeoutId;
const sleep = (timeout) =>
  new Promise((resolve) => {
    timeoutId = setTimeout(resolve, timeout);
  });

let animationId;

const isPaused = () => !animationId;

const renderLoop = () => {
  fps.render();
  drawCells();
  sleep(renderTimeout).then(() => {
    animationId = requestAnimationFrame(renderLoop);
  });
  universe.tick();
};

const playPauseBtn = document.getElementById('play-pause');
const resetBtn = document.getElementById('reset-btn');
const clearBtn = document.getElementById('clear-btn');
const delaySlider = document.getElementById('delay-slider');
renderTimeout = Number(delaySlider.value);

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

playPauseBtn.addEventListener('click', () => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

clearBtn.addEventListener('click', () => {
  // setting width or height clears all cells
  universe.set_width(WIDTH);
});

resetBtn.addEventListener('click', () => {
  universe = Universe.new(WIDTH, HEIGHT);
});

delaySlider.addEventListener('change', (event) => {
  renderTimeout = Number(event.target.value);
});

canvas.addEventListener('click', (event) => {
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

  drawCells();
});

drawGrid();
play();
