import { useEffect, useState } from 'react';
import { MISSIONS, OBJECTS, SOURCES, getObject, type CelestialObject, type MissionRecord, type SourceRecord } from '@nexsolarix/astronomy';
import { fetchCatalog, fetchMissions, fetchObject, fetchSources } from '../services/catalogService';

export type DataOrigin = 'loading' | 'api-snapshot' | 'local-fallback';

export function useCatalogObjects() {
  const [objects, setObjects] = useState(OBJECTS);
  const [origin, setOrigin] = useState<DataOrigin>('loading');
  useEffect(() => {
    const controller = new AbortController();
    void fetchCatalog(controller.signal).then((result) => {
      setObjects(result.data.data);
      setOrigin(result.source);
    }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return { objects, origin };
}

export function useCatalogObject(id: string) {
  const [object, setObject] = useState<CelestialObject | undefined>(() => getObject(id));
  const [origin, setOrigin] = useState<DataOrigin>('loading');
  useEffect(() => {
    setObject(getObject(id));
    const controller = new AbortController();
    void fetchObject(id, controller.signal).then((result) => {
      setObject(result.data.data);
      setOrigin(result.source);
    }).catch(() => undefined);
    return () => controller.abort();
  }, [id]);
  return { object, origin };
}

export function useMissionRecords() {
  const [missions, setMissions] = useState<MissionRecord[]>(MISSIONS);
  const [origin, setOrigin] = useState<DataOrigin>('loading');
  useEffect(() => {
    const controller = new AbortController();
    void fetchMissions(controller.signal).then((result) => {
      setMissions(result.data.data);
      setOrigin(result.source);
    }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return { missions, origin };
}

export function useSourceRecords() {
  const [sources, setSources] = useState<SourceRecord[]>(SOURCES);
  const [origin, setOrigin] = useState<DataOrigin>('loading');
  useEffect(() => {
    const controller = new AbortController();
    void fetchSources(controller.signal).then((result) => {
      setSources(result.data.data);
      setOrigin(result.source);
    }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return { sources, origin };
}
