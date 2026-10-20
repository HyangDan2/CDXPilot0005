import { clamp, WORLD } from '../config/constants';
export function cameraTarget(playerX: number, worldEnd: number = WORLD.length, worldStart = 0) {
  return clamp(playerX - 330, worldStart, worldEnd - WORLD.width);
}
