import { WIDTH } from './constants';

export const getIndex = (row, col) => row * WIDTH + col;

export const isBitSet = (byteArray, bitNumber) => {
  const byteNumber = Math.floor(bitNumber / 8);
  const mask = 1 << bitNumber % 8;

  return (byteArray[byteNumber] & mask) === mask;
};
