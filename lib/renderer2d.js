import {
  ALIVE_COLOR,
  CELL_SIZE,
  DEAD_COLOR,
  GRID_COLOR,
  WIDTH,
  HEIGHT,
} from './constants';
import { memory } from '@berrunder/wasm-game-of-life/wasm_game_of_life_bg';
import { getIndex, isBitSet } from './utils';

export const drawGrid = (ctx) => {
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

export const drawCells = ({ ctx, universe }) => {
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
