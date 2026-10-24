/** Authored smooth-bow frame 7 (512px canvas, origin [256, 420], display scale 0.5). */
export const bowReleaseAnchor = {
  frame: 7,
  sourceX: 348,
  sourceY: 246,
  originX: 256,
  originY: 420,
  displayScale: 0.5,
  arrowTipLength: 7,
} as const;

export const playerArrowVisual = {
  shaftLength: 58,
  outlineWidth: 4,
  shaftWidth: 2,
  tipLength: bowReleaseAnchor.arrowTipLength,
  tipHalfHeight: 3.5,
  featherLength: 7,
  featherHalfHeight: 4,
} as const;

export const bowReleaseOffset = {
  x: (bowReleaseAnchor.sourceX - bowReleaseAnchor.originX) * bowReleaseAnchor.displayScale,
  z: (bowReleaseAnchor.originY - bowReleaseAnchor.sourceY) * bowReleaseAnchor.displayScale,
};
