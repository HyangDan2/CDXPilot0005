import { clamp, WORLD } from '../config/constants';
export function cameraTarget(playerX: number) {
  return clamp(playerX - 330, 0, WORLD.length - WORLD.width);
}
