import { PrismaClient, type ObjectType, type ConfidenceLevel } from '@prisma/client';
import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MISSIONS, OBJECTS, SOURCES } from '@nexsolarix/astronomy';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

const prisma = new PrismaClient();

const objectTypeMap: Record<string, ObjectType> = {
  star: 'STAR',
  planet: 'PLANET',
  moon: 'MOON',
  'dwarf planet': 'DWARF_PLANET',
  exoplanet: 'EXOPLANET',
  asteroid: 'ASTEROID',
  comet: 'COMET',
  galaxy: 'GALAXY',
  nebula: 'NEBULA',
  'black hole': 'BLACK_HOLE'
};

const confidenceMap: Record<string, ConfidenceLevel> = {
  verified: 'VERIFIED',
  estimated: 'ESTIMATED',
  modeled: 'MODELED',
  candidate: 'CANDIDATE',
  unknown: 'UNKNOWN'
};

async function main() {
  for (const source of SOURCES) {
    await prisma.source.upsert({
      where: { id: source.id },
      update: { organization: source.organization, title: source.title, url: source.url, description: source.description, usageNotes: source.usage },
      create: { id: source.id, organization: source.organization, title: source.title, url: source.url, description: source.description, usageNotes: source.usage }
    });
  }

  for (const object of OBJECTS) {
    await prisma.celestialObject.upsert({
      where: { id: object.id },
      update: {
        name: object.name,
        designation: object.designation,
        objectType: objectTypeMap[object.kind] ?? 'PLANET',
        subtype: object.typeLabel,
        summary: object.description,
        parentId: object.parentId ?? null
      },
      create: {
        id: object.id,
        name: object.name,
        designation: object.designation,
        objectType: objectTypeMap[object.kind] ?? 'PLANET',
        subtype: object.typeLabel,
        summary: object.description,
        parentId: object.parentId ?? null
      }
    });

    for (const sourceId of new Set(object.facts.flatMap((item) => item.sourceIds))) {
      await prisma.objectSource.upsert({
        where: { objectId_sourceId: { objectId: object.id, sourceId } },
        update: {},
        create: { objectId: object.id, sourceId }
      });
    }

    for (const item of object.facts) {
      const storedFact = await prisma.scientificFact.upsert({
        where: { objectId_key: { objectId: object.id, key: item.key } },
        update: {
          label: item.label,
          value: item.value,
          unit: item.unit,
          confidence: confidenceMap[item.confidence] ?? 'UNKNOWN',
          note: item.note
        },
        create: {
          objectId: object.id,
          key: item.key,
          label: item.label,
          value: item.value,
          unit: item.unit,
          confidence: confidenceMap[item.confidence] ?? 'UNKNOWN',
          note: item.note
        }
      });
      for (const sourceId of item.sourceIds) {
        await prisma.factSource.upsert({
          where: { factId_sourceId: { factId: storedFact.id, sourceId } },
          update: {},
          create: { factId: storedFact.id, sourceId }
        });
      }
    }
  }

  for (const mission of MISSIONS) {
    await prisma.mission.upsert({
      where: { id: mission.id },
      update: { name: mission.name, agency: mission.agency, launchDate: new Date(mission.launched), status: mission.status, destination: mission.destination, description: mission.description },
      create: { id: mission.id, name: mission.name, agency: mission.agency, launchDate: new Date(mission.launched), status: mission.status, destination: mission.destination, description: mission.description }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(JSON.stringify({ level: 'error', message: 'Database seed failed', error: error instanceof Error ? error.message : 'unknown' }));
    await prisma.$disconnect();
    process.exitCode = 1;
  });
