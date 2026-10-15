import { describe, expect, it } from 'vitest';
import { overviewCameraDistance, SOLAR_SYSTEM_SCENE_RADIUS } from './sceneFraming';

describe('Solar System overview framing', () => {
  it('fits the outer orbit and visual extent inside a narrow portrait viewport', () => {
    const portraitDistance = overviewCameraDistance(390 / 844);
    const landscapeDistance = overviewCameraDistance(16 / 9);

    expect(SOLAR_SYSTEM_SCENE_RADIUS).toBeGreaterThan(17);
    expect(portraitDistance).toBeGreaterThan(landscapeDistance);
    expect(portraitDistance).toBeLessThan(140);
  });

  it('uses a safe default for invalid viewport dimensions', () => {
    expect(overviewCameraDistance(0)).toBeCloseTo(overviewCameraDistance(1));
    expect(Number.isFinite(overviewCameraDistance(Number.NaN))).toBe(true);
  });
});
