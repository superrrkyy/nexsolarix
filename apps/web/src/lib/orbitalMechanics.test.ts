import { describe, expect, it } from 'vitest';
import { PLANETS } from '@nexsolarix/astronomy';
import { heliocentricPosition, orbitPathAtDate } from './orbitalMechanics';

const earth = PLANETS.find((planet) => planet.id === 'earth')!;

function distance(position: { x: number; y: number; z: number }) {
  return Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
}

describe('JPL approximate orbital model', () => {
  it('keeps Earth near one astronomical unit at the J2000 epoch', () => {
    const position = heliocentricPosition(earth.orbitalElements!, new Date('2000-01-01T12:00:00.000Z'));
    expect(distance(position)).toBeGreaterThan(0.98);
    expect(distance(position)).toBeLessThan(1.02);
  });

  it('places the planets at different modeled locations on different dates', () => {
    const start = heliocentricPosition(earth.orbitalElements!, new Date('2000-01-01T12:00:00.000Z'));
    const later = heliocentricPosition(earth.orbitalElements!, new Date('2000-04-10T12:00:00.000Z'));
    expect(distance({ x: start.x - later.x, y: start.y - later.y, z: start.z - later.z })).toBeGreaterThan(0.5);
  });

  it('creates a closed orbit path with finite positions', () => {
    const points = orbitPathAtDate(earth.orbitalElements!, new Date('2026-01-01T00:00:00.000Z'), 120);
    expect(points).toHaveLength(120);
    expect(points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z))).toBe(true);
    expect(distance(points[0])).toBeGreaterThan(0.9);
  });
});
