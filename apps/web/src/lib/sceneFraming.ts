import { PLANETS } from '@nexsolarix/astronomy';
import { ORBIT_DISPLAY_SCALE } from './orbitalMechanics';

const DEFAULT_VERTICAL_FOV_DEGREES = 43;
const VIEW_MARGIN = 1.08;

export const SOLAR_SYSTEM_SCENE_RADIUS = Math.max(...PLANETS.flatMap((planet) => {
  if (!planet.orbitalElements) return [];
  const { a, e } = planet.orbitalElements;
  const orbitRadius = a * (1 + Math.abs(e)) * ORBIT_DISPLAY_SCALE;
  const visualExtent = planet.visualRadius * (planet.id === 'saturn' ? 2.2 : 1);
  return [orbitRadius + visualExtent];
}));

/** Distance needed to keep the modeled system inside a perspective camera's frustum. */
export function overviewCameraDistance(aspectRatio: number, verticalFovDegrees = DEFAULT_VERTICAL_FOV_DEGREES): number {
  const aspect = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
  const fov = Number.isFinite(verticalFovDegrees) && verticalFovDegrees > 0 && verticalFovDegrees < 179
    ? verticalFovDegrees
    : DEFAULT_VERTICAL_FOV_DEGREES;
  const verticalHalfAngle = (fov * Math.PI) / 360;
  const limitingHalfAngle = Math.atan(Math.tan(verticalHalfAngle) * Math.min(aspect, 1));
  return (SOLAR_SYSTEM_SCENE_RADIUS * VIEW_MARGIN) / Math.sin(limitingHalfAngle);
}
