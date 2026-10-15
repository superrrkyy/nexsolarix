import { MISSIONS, OBJECTS, SOURCES, getObject, searchObjects, type CelestialObject, type MissionRecord, type SourceRecord } from '@nexsolarix/astronomy';

const API_BASE_URL = import.meta.env.API_BASE_URL?.replace(/\/$/, '') || '/api';

export interface CatalogResult<T> {
  data: T;
  source: 'api-snapshot' | 'local-fallback';
}

async function request<T>(path: string, fallback: T, signal?: AbortSignal): Promise<CatalogResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
    const payload = await response.json() as T;
    return { data: payload, source: 'api-snapshot' };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    return { data: fallback, source: 'local-fallback' };
  }
}

export function fetchCatalog(signal?: AbortSignal): Promise<CatalogResult<{ data: CelestialObject[] }>> {
  return request('/objects?limit=100', { data: OBJECTS }, signal);
}

export function fetchObject(id: string, signal?: AbortSignal): Promise<CatalogResult<{ data?: CelestialObject }>> {
  return request(`/objects/${encodeURIComponent(id)}`, { data: getObject(id) }, signal);
}

export function fetchSearch(query: string, signal?: AbortSignal): Promise<CatalogResult<{ data: CelestialObject[] }>> {
  return request(`/search?q=${encodeURIComponent(query)}`, { data: searchObjects(query) }, signal);
}

export function fetchMissions(signal?: AbortSignal): Promise<CatalogResult<{ data: MissionRecord[] }>> {
  return request('/missions', { data: MISSIONS }, signal);
}

export function fetchSources(signal?: AbortSignal): Promise<CatalogResult<{ data: SourceRecord[] }>> {
  return request('/sources', { data: SOURCES }, signal);
}
