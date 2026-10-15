import type { OrbitalElements } from '@nexsolarix/astronomy';

const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
const DEG = Math.PI / 180;

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

function wrapDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

function solveEccentricAnomaly(meanAnomaly: number, eccentricity: number): number {
  let estimate = meanAnomaly + eccentricity * Math.sin(meanAnomaly);
  for (let iteration = 0; iteration < 8; iteration += 1) {
    const delta = (estimate - eccentricity * Math.sin(estimate) - meanAnomaly) / (1 - eccentricity * Math.cos(estimate));
    estimate -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }
  return estimate;
}

/**
 * Returns a heliocentric ecliptic position from the JPL published approximate
 * mean-element model. Values are in AU before the caller applies display scaling.
 */
export function heliocentricPosition(elements: OrbitalElements, date: Date): Vector3Tuple {
  const daysSinceJ2000 = (date.getTime() - J2000) / 86_400_000;
  const centuries = daysSinceJ2000 / 36_525;
  const a = elements.a + elements.aRate * centuries;
  const eccentricity = elements.e + elements.eRate * centuries;
  const inclination = (elements.inclination + elements.inclinationRate * centuries) * DEG;
  const meanLongitude = elements.meanLongitude + elements.meanLongitudeRate * centuries;
  const perihelion = elements.longitudePerihelion + elements.longitudePerihelionRate * centuries;
  const ascendingNode = elements.longitudeAscendingNode + elements.longitudeAscendingNodeRate * centuries;
  const meanAnomaly = wrapDegrees(meanLongitude - perihelion) * DEG;
  const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, eccentricity);
  const orbitalX = a * (Math.cos(eccentricAnomaly) - eccentricity);
  const orbitalY = a * Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(eccentricAnomaly);
  const argumentOfPerihelion = (perihelion - ascendingNode) * DEG;
  const node = ascendingNode * DEG;
  const cosNode = Math.cos(node);
  const sinNode = Math.sin(node);
  const cosArg = Math.cos(argumentOfPerihelion);
  const sinArg = Math.sin(argumentOfPerihelion);
  const cosInclination = Math.cos(inclination);
  const sinInclination = Math.sin(inclination);

  const x = (cosNode * cosArg - sinNode * sinArg * cosInclination) * orbitalX
    + (-cosNode * sinArg - sinNode * cosArg * cosInclination) * orbitalY;
  const y = (sinNode * cosArg + cosNode * sinArg * cosInclination) * orbitalX
    + (-sinNode * sinArg + cosNode * cosArg * cosInclination) * orbitalY;
  const z = sinArg * sinInclination * orbitalX + cosArg * sinInclination * orbitalY;

  // Three.js uses Y as up; map ecliptic north to scene up.
  return { x, y: z, z: -y };
}

export function orbitPathAtDate(elements: OrbitalElements, date: Date, segments = 180): Vector3Tuple[] {
  const daysSinceJ2000 = (date.getTime() - J2000) / 86_400_000;
  const centuries = daysSinceJ2000 / 36_525;
  const a = elements.a + elements.aRate * centuries;
  const eccentricity = elements.e + elements.eRate * centuries;
  const inclination = (elements.inclination + elements.inclinationRate * centuries) * DEG;
  const perihelion = elements.longitudePerihelion + elements.longitudePerihelionRate * centuries;
  const ascendingNode = elements.longitudeAscendingNode + elements.longitudeAscendingNodeRate * centuries;
  const argumentOfPerihelion = (perihelion - ascendingNode) * DEG;
  const node = ascendingNode * DEG;
  const points: Vector3Tuple[] = [];

  for (let i = 0; i < segments; i += 1) {
    const eccentricAnomaly = (i / segments) * Math.PI * 2;
    const orbitalX = a * (Math.cos(eccentricAnomaly) - eccentricity);
    const orbitalY = a * Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(eccentricAnomaly);
    const cosNode = Math.cos(node);
    const sinNode = Math.sin(node);
    const cosArg = Math.cos(argumentOfPerihelion);
    const sinArg = Math.sin(argumentOfPerihelion);
    const cosInclination = Math.cos(inclination);
    const sinInclination = Math.sin(inclination);
    const x = (cosNode * cosArg - sinNode * sinArg * cosInclination) * orbitalX
      + (-cosNode * sinArg - sinNode * cosArg * cosInclination) * orbitalY;
    const y = (sinNode * cosArg + cosNode * sinArg * cosInclination) * orbitalX
      + (-sinNode * sinArg + cosNode * cosArg * cosInclination) * orbitalY;
    const z = sinArg * sinInclination * orbitalX + cosArg * sinInclination * orbitalY;
    points.push({ x, y: z, z: -y });
  }
  return points;
}

export const ORBIT_DISPLAY_SCALE = 0.58;
