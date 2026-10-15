import { describe, expect, it } from 'vitest';
import { MISSIONS, OBJECTS, SOURCES, getChildren, objectRelationshipPath, searchObjects } from '@nexsolarix/astronomy';

 describe('curated astronomical catalog', () => {
  it('keeps the Solar System core to the Sun and eight planets', () => {
    expect(OBJECTS.filter((object) => object.kind === 'planet')).toHaveLength(8);
    expect(OBJECTS.find((object) => object.id === 'sun')?.kind).toBe('star');
  });

  it('searches names, designations, and tags without inventing matches', () => {
    expect(searchObjects('TRAPPIST')).toHaveLength(0);
    expect(searchObjects('Europa').map((object) => object.id)).toContain('europa');
    expect(searchObjects('Jupiter II').map((object) => object.id)).toContain('europa');
  });

  it('preserves parent-child relationships for profile navigation', () => {
    expect(getChildren('sun').map((object) => object.kind)).toEqual(Array(8).fill('planet'));
    expect(objectRelationshipPath('europa').map((object) => object.id)).toEqual(['sun', 'jupiter', 'europa']);
  });

  it('marks missions with cited agency references', () => {
    expect(MISSIONS.length).toBeGreaterThan(0);
    expect(MISSIONS.every((mission) => mission.sourceIds.length > 0)).toBe(true);
  });

  it('links every scientific fact and mission to a known source record', () => {
    const sourceIds = new Set(SOURCES.map((source) => source.id));
    const factSourceIds = OBJECTS.flatMap((object) => object.facts.flatMap((fact) => fact.sourceIds));
    const missionSourceIds = MISSIONS.flatMap((mission) => mission.sourceIds);

    expect(OBJECTS.every((object) => object.facts.every((fact) => fact.sourceIds.length > 0))).toBe(true);
    expect([...factSourceIds, ...missionSourceIds].every((sourceId) => sourceIds.has(sourceId))).toBe(true);
  });
});
