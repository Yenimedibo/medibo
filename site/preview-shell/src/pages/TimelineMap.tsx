import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature as topojsonFeature } from 'topojson-client';
import worldTopology from 'world-atlas/countries-110m.json';
import type { TimelineEvent, TimelineGeometry, TimelineResponse } from '../lib/timeline';
import './TimelineMap.css';

type GeoGeometry = { type: string; coordinates: unknown };
type GeoFeature = { type: 'Feature'; properties: Record<string, never>; geometry: GeoGeometry };

const MIN_YEAR = 500;
const MAX_YEAR = 2026;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const topology = worldTopology as unknown as Parameters<typeof topojsonFeature>[0];

function validPoint(value: unknown): value is [number, number] {
  return Array.isArray(value)
    && value.length >= 2
    && typeof value[0] === 'number'
    && typeof value[1] === 'number'
    && Number.isFinite(value[0])
    && Number.isFinite(value[1])
    && value[0] >= -180 && value[0] <= 180
    && value[1] >= -90 && value[1] <= 90;
}

function cleanGeometry(geometry?: TimelineGeometry): GeoGeometry | null {
  if (!geometry || !['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].includes(geometry.type)) return null;
  const coordinates = geometry.coordinates;
  const check = (value: unknown, depth: number): boolean => {
    if (depth === 0) return validPoint(value);
    return Array.isArray(value) && value.length > 0 && value.every((part) => check(part, depth - 1));
  };
  const depth: Record<string, number> = { Point: 0, MultiPoint: 1, LineString: 1, MultiLineString: 2, Polygon: 2, MultiPolygon: 3 };
  if (!check(coordinates, depth[geometry.type])) return null;
  return { type: geometry.type, coordinates };
}

function eventGeometry(event: TimelineEvent): GeoGeometry | null {
  if (event.locationPrecision !== 'verified' || event.startYear === null) return null;
  if (validPoint([event.longitude, event.latitude])) return { type: 'Point', coordinates: [event.longitude, event.latitude] };
  return cleanGeometry(event.geometry);
}

function yearLabel(event: TimelineEvent): string {
  if (event.startYear == null) return 'Date incomplete';
  const fmt = (year: number) => year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
  const start = event.startYear;
  const end = event.endYear ?? start;
  return end !== start ? `${fmt(start)}–${fmt(end)}` : fmt(start);
}

function safeSourceUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : null;
  } catch {
    return null;
  }
}

const statusCopy: Record<TimelineResponse['status'], string> = {
  ready: 'Timeline data is available.',
  disconnected: 'The timeline source is disconnected.',
  'no-approved-data': 'No approved records are available for public viewing.',
  error: 'The timeline service reported an error.',
};

export default function TimelineMap() {
  const [from, setFrom] = useState(MIN_YEAR);
  const [to, setTo] = useState(MAX_YEAR);
  const [region, setRegion] = useState('');
  const [topic, setTopic] = useState('');
  const [period, setPeriod] = useState('');
  const [mode, setMode] = useState<'public' | 'preview'>('public');
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[] | null>(null);
  const [response, setResponse] = useState<TimelineResponse | null>(null);
  const [optionsResponse, setOptionsResponse] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [mapView, setMapView] = useState({ zoom: 1, x: 0, y: 0 });
  const dragRef = useRef<{ id: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const knownLayerIdsRef = useRef<Set<string>>(new Set());

  const fetchTimeline = useCallback(async (query: URLSearchParams, signal: AbortSignal) => {
    const result = await fetch(`${basePath}/api/timeline-map?${query.toString()}`, { signal, headers: { Accept: 'application/json' } });
    if (!result.ok) throw new Error(`Timeline request failed (${result.status})`);
    return await result.json() as TimelineResponse;
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      from: String(from),
      to: String(to),
      region,
      topic,
      period,
      mode,
    });
    if (selectedLayerIds !== null) params.set('layers', selectedLayerIds.join(','));
    return params.toString();
  }, [from, to, region, topic, period, mode, selectedLayerIds]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(queryString);
    const options = new URLSearchParams({ from: String(from), to: String(to), region: '', topic: '', period: '', mode });
    if (selectedLayerIds !== null) options.set('layers', selectedLayerIds.join(','));
    setLoading(true);
    setRequestError(false);
    Promise.all([
      fetchTimeline(params, controller.signal),
      fetchTimeline(options, controller.signal),
    ]).then(([data, allOptions]) => {
      setResponse(data);
      setOptionsResponse(allOptions);
      setSelectedLayerIds((current) => {
        const available = new Set(data.layers.map((layer) => layer.id));
        const known = knownLayerIdsRef.current;
        if (current === null) {
          knownLayerIdsRef.current = available;
          return data.selectedLayerIds;
        }
        const next = new Set(current.filter((id) => available.has(id)));
        for (const layer of data.layers) {
          if (!known.has(layer.id) && layer.defaultVisible) next.add(layer.id);
        }
        knownLayerIdsRef.current = available;
        const nextIds = data.layers.filter((layer) => next.has(layer.id)).map((layer) => layer.id);
        return current.length === nextIds.length && current.every((id, index) => id === nextIds[index])
          ? current
          : nextIds;
      });
      setSelectedId((current) => data.events.some((event) => event.id === current) ? current : null);
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setRequestError(true);
      setResponse(null);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [fetchTimeline, queryString, from, to, mode, refreshTick, selectedLayerIds]);

  useEffect(() => {
    const timer = window.setInterval(() => setRefreshTick((tick) => tick + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleLayerIds = selectedLayerIds ?? response?.selectedLayerIds ?? [];
  const availableEvents = (optionsResponse?.events ?? response?.events ?? [])
    .filter((event) => visibleLayerIds.includes(event.layerId));
  const regions = useMemo(() => [...new Set(availableEvents.map((event) => event.region).filter(Boolean))].sort(), [availableEvents]);
  const types = useMemo(() => [...new Set(availableEvents.map((event) => event.eventType).filter(Boolean))].sort(), [availableEvents]);
  const periods = useMemo(() => [...new Set(availableEvents.map((event) => event.period).filter(Boolean))].sort(), [availableEvents]);
  const events = useMemo(() => (response?.events ?? []).filter((event) =>
    visibleLayerIds.includes(event.layerId)
    &&
    (!region || event.region === region)
    && (!topic || event.eventType === topic)
    && (!period || event.period === period)
    && (event.startYear == null || (
      event.startYear <= to
      && (event.endYear ?? event.startYear) >= from
    )),
  ), [response, region, topic, period, from, to, visibleLayerIds]);
  const selected = events.find((event) => event.id === selectedId) ?? null;

  const world = useMemo(() => {
    const countries = topojsonFeature(topology, 'countries') as unknown as
      | { type: 'FeatureCollection'; features: GeoFeature[] }
      | GeoFeature;
    return 'features' in countries ? countries.features : [countries];
  }, []);
  const projection = useMemo(() => geoEqualEarth().fitExtent([[10, 12], [890, 428]], {
    type: 'FeatureCollection',
    features: world,
  } as never), [world]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const mapEvents = useMemo(() => events.flatMap((event) => {
    const geometry = eventGeometry(event);
    if (!geometry) return [];
    const point: [number, number] | null = geometry.type === 'Point' && validPoint(geometry.coordinates)
      ? projection(geometry.coordinates) as [number, number] | null
      : null;
    return [{ event, geometry, point }];
  }), [events, projection]);

  const clampYear = (value: string, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(MIN_YEAR, Math.min(MAX_YEAR, Math.round(parsed))) : fallback;
  };
  const resetFilters = () => {
    setFrom(MIN_YEAR);
    setTo(MAX_YEAR);
    setRegion('');
    setTopic('');
    setPeriod('');
  };
  const toggleLayer = (id: string) => {
    setSelectedLayerIds((current) => {
      const next = new Set(current ?? response?.selectedLayerIds ?? []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return (response?.layers ?? [])
        .filter((layer) => next.has(layer.id))
        .map((layer) => layer.id);
    });
  };
  const mapTransform = `translate(${mapView.x} ${mapView.y}) translate(450 220) scale(${mapView.zoom}) translate(-450 -220)`;
  const startMapDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('.timeline-map-controls, .timeline-map-marker')) return;
    if (event.button !== 0) return;
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: mapView.x, originY: mapView.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveMapDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setMapView((view) => ({
      ...view,
      x: Math.max(-360, Math.min(360, drag.originX + ((event.clientX - drag.x) / bounds.width) * 900)),
      y: Math.max(-220, Math.min(220, drag.originY + ((event.clientY - drag.y) / bounds.height) * 440)),
    }));
  };
  const endMapDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id === event.pointerId) dragRef.current = null;
  };
  const adjustZoom = (amount: number) => setMapView((view) => ({ ...view, zoom: Math.max(1, Math.min(4, Number((view.zoom + amount).toFixed(1)))) }));
  const panMap = (x: number, y: number) => setMapView((view) => ({
    ...view,
    x: Math.max(-360, Math.min(360, view.x + x)),
    y: Math.max(-220, Math.min(220, view.y + y)),
  }));

  return (
    <section className="timeline-page" aria-labelledby="timeline-title">
      <div className="timeline-wrap">
        <header className="timeline-intro">
          <p className="timeline-kicker">Medibo / research instrument / 01</p>
          <div className="timeline-heading">
            <div>
              <h1 id="timeline-title">Timeline <em>Map</em></h1>
              <p className="timeline-deck">A historical record, located only where the evidence supports it.</p>
            </div>
            <p className="timeline-principle"><span aria-hidden="true">01—</span> Geography is evidence too.<br />Absence of a marker is not absence of an event.</p>
          </div>
          <div className="timeline-mode-row">
            <span className={`timeline-live-indicator${response?.lastSyncedAt ? ' is-connected' : response?.status === 'error' || response?.status === 'disconnected' ? ' is-unavailable' : ''}`} aria-hidden="true" />
            <span>{mode === 'preview' ? 'EDITOR PREVIEW — DRAFTS MAY APPEAR' : 'PUBLIC VIEW'}</span>
            {response?.lastSyncedAt && <span className="timeline-updated">Source timestamp: {response.lastSyncedAt}</span>}
            {response?.canPreviewDrafts && (
              <button className="timeline-mode-toggle" type="button" onClick={() => setMode(mode === 'public' ? 'preview' : 'public')} aria-pressed={mode === 'preview'} data-testid="button-timeline-preview">
                {mode === 'public' ? 'Open editor preview' : 'Return to public view'}
              </button>
            )}
          </div>
        </header>

        {mode === 'preview' && (
          <div className="timeline-preview-banner" role="note">
            <strong>EDITOR PREVIEW</strong>
            <span>Draft and unpublished records may be visible. This view is not the public record.</span>
          </div>
        )}

        <section className="timeline-workspace" aria-label="Historical timeline map">
          <div className="timeline-map-column">
            <div className="timeline-section-head">
              <div><p className="timeline-label">Spatial view</p><h2>Where the record can be placed</h2></div>
              <span className="timeline-map-count">{mapEvents.length} mapped</span>
            </div>
            <div
              className={`timeline-map-frame${dragRef.current ? ' is-dragging' : ''}`}
              role="group"
              aria-label="Interactive map. Drag to pan; use zoom controls or keyboard."
              onPointerDown={startMapDrag}
              onPointerMove={moveMapDrag}
              onPointerUp={endMapDrag}
              onPointerCancel={endMapDrag}
              data-testid="map-timeline"
            >
              <svg className="timeline-map-svg" viewBox="0 0 900 440" role="img" aria-labelledby="map-title map-description">
                <title id="map-title">World map of verified historical locations</title>
                <desc id="map-description">Only records with verified location precision and valid geographic information are shown here. Other records remain in the chronology.</desc>
                <rect x="0" y="0" width="900" height="440" className="timeline-map-ground" />
                <g transform={mapTransform}>
                  {[0, 1, 2, 3, 4].map((line) => <path key={`lat-${line}`} className="timeline-graticule" d={`M0 ${70 + line * 75} H900`} />)}
                  {world.map((feature, index) => <path key={index} className="timeline-land" d={path(feature as never) ?? ''} />)}
                  {mapEvents.map(({ event, geometry }) => geometry.type === 'Point' ? null : (
                    <path key={`geometry-${event.id}`} className="timeline-event-geometry" d={path(geometry as never) ?? ''} />
                  ))}
                </g>
              </svg>
              <div className="timeline-map-markers" style={{ transform: `translate(${mapView.x / 9}%, ${mapView.y / 4.4}%) scale(${mapView.zoom})` }}>
                {mapEvents.filter((item) => item.point).map(({ event, point }) => point && (
                  <button
                    key={event.id}
                    type="button"
                    className={`timeline-map-marker${selectedId === event.id ? ' is-selected' : ''}`}
                    style={{ left: `${point[0] / 9}%`, top: `${point[1] / 4.4}%` }}
                    aria-label={`Select mapped event: ${event.title}, ${yearLabel(event)}`}
                    aria-pressed={selectedId === event.id}
                    onClick={() => setSelectedId(event.id)}
                    data-testid={`marker-event-${event.id}`}
                  ><span /></button>
                ))}
              </div>
              <div className="timeline-map-controls" aria-label="Map controls">
                <button type="button" aria-label="Pan map north" onClick={() => panMap(0, -60)} data-testid="button-map-pan-north">↑</button>
                <button type="button" aria-label="Pan map west" onClick={() => panMap(-60, 0)} data-testid="button-map-pan-west">←</button>
                <button type="button" aria-label="Pan map east" onClick={() => panMap(60, 0)} data-testid="button-map-pan-east">→</button>
                <button type="button" aria-label="Pan map south" onClick={() => panMap(0, 60)} data-testid="button-map-pan-south">↓</button>
                <button type="button" aria-label="Zoom in" onClick={() => adjustZoom(.5)} disabled={mapView.zoom >= 4} data-testid="button-map-zoom-in">+</button>
                <button type="button" aria-label="Zoom out" onClick={() => adjustZoom(-.5)} disabled={mapView.zoom <= 1} data-testid="button-map-zoom-out">−</button>
                <button type="button" aria-label="Reset map view" onClick={() => setMapView({ zoom: 1, x: 0, y: 0 })} data-testid="button-map-reset">Reset</button>
              </div>
              {mapEvents.length === 0 && !loading && (
                <div className="timeline-map-empty"><span className="timeline-empty-cross" aria-hidden="true">×</span><p>No verified locations in this view.</p><small>Approximate, disputed, and incomplete geography is not pinned.</small></div>
              )}
              {loading && <div className="timeline-map-loading" aria-label="Loading map"><span /><span /><span /></div>}
            </div>
            <div className="timeline-map-caption">
              <span>Equal Earth projection</span>
              <span>Natural Earth 110m · modern outlines, not historical borders</span>
            </div>
            <div className="timeline-legend" aria-label="Record confidence legend">
              <span><i className="legend-dot legend-verified" />Verified</span>
              <span><i className="legend-dot legend-approximate" />Approximate</span>
              <span><i className="legend-dot legend-disputed" />Disputed</span>
              <span><i className="legend-dot legend-incomplete" />Incomplete</span>
            </div>
          </div>

          <aside className="timeline-filters" aria-labelledby="filter-title">
            <div className="timeline-section-head timeline-filter-head"><div><p className="timeline-label">Refine the record</p><h2 id="filter-title">Filters</h2></div></div>
            {response?.layers.length ? (
              <fieldset className="timeline-layer-fieldset">
                <legend>Map layers</legend>
                <p className="timeline-layer-help">Choose which record groups appear in both the map and chronology.</p>
                <div className="timeline-layer-list">
                  {response.layers.map((layer, index) => {
                    const checked = (selectedLayerIds ?? response.selectedLayerIds).includes(layer.id);
                    const descriptionId = `timeline-layer-description-${index}`;
                    return (
                      <button
                        key={layer.id}
                        className={`timeline-layer-switch${checked ? ' is-on' : ''}`}
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        aria-label={layer.name}
                        aria-describedby={layer.description ? descriptionId : undefined}
                        onClick={() => toggleLayer(layer.id)}
                        data-testid={`switch-layer-${layer.id}`}
                      >
                        <span className="timeline-layer-switch-track" aria-hidden="true"><span /></span>
                        <span className="timeline-layer-switch-copy">
                          <strong>{layer.name}</strong>
                          {layer.description && <small id={descriptionId}>{layer.description}</small>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : (
              <p className="timeline-layer-empty" role="status">
                {loading ? 'Loading available map layers…' : 'No public map layers are currently available.'}
              </p>
            )}
            <div className="timeline-year-fields">
              <label>From year
                <input type="number" min={MIN_YEAR} max={MAX_YEAR} value={from} onChange={(event) => setFrom(Math.min(clampYear(event.target.value, from), to))} aria-label="Start year from 500 to 2026" data-testid="input-timeline-from" />
              </label>
              <span aria-hidden="true">to</span>
              <label>To year
                <input type="number" min={MIN_YEAR} max={MAX_YEAR} value={to} onChange={(event) => setTo(Math.max(clampYear(event.target.value, to), from))} aria-label="End year from 500 to 2026" data-testid="input-timeline-to" />
              </label>
            </div>
            <div className="timeline-range-control" aria-label="Year range slider">
              <label htmlFor="timeline-range-from">Start year <output>{from}</output></label>
              <input id="timeline-range-from" type="range" min={MIN_YEAR} max={MAX_YEAR} step="1" value={from} onChange={(event) => setFrom(Math.min(Number(event.target.value), to))} data-testid="slider-timeline-from" />
              <label htmlFor="timeline-range-to">End year <output>{to}</output></label>
              <input id="timeline-range-to" type="range" min={MIN_YEAR} max={MAX_YEAR} step="1" value={to} onChange={(event) => setTo(Math.max(Number(event.target.value), from))} data-testid="slider-timeline-to" />
              <div className="timeline-range-bounds"><span>500</span><span>2026</span></div>
            </div>
            <label className="timeline-select-label">Region
              <select value={region} onChange={(event) => setRegion(event.target.value)} data-testid="select-timeline-region">
                <option value="">All regions</option>{regions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="timeline-select-label">Event type
              <select value={topic} onChange={(event) => setTopic(event.target.value)} data-testid="select-timeline-type">
                <option value="">All event types</option>{types.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="timeline-select-label">Period
              <select value={period} onChange={(event) => setPeriod(event.target.value)} data-testid="select-timeline-period">
                <option value="">All periods</option>{periods.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <button className="timeline-reset" type="button" onClick={resetFilters} data-testid="button-reset-timeline-filters">Reset filters</button>
            <p className="timeline-filter-note">Filters remain available when the record is empty. A missing location is never inferred from a region label.</p>
          </aside>
        </section>

        <section className="timeline-chronology" aria-labelledby="chronology-title">
          <div className="timeline-chronology-heading">
            <div><p className="timeline-label">Chronology</p><h2 id="chronology-title">The record, in time</h2></div>
            <p aria-live="polite" className="timeline-result-count">{loading ? 'Updating record…' : `${events.length} ${events.length === 1 ? 'record' : 'records'}`}</p>
          </div>
          {loading && !response && (
            <div className="timeline-skeleton" aria-label="Loading historical records"><span /><span /><span /></div>
          )}
          {requestError && !loading && (
            <div className="timeline-message timeline-message--error" role="alert">
              <span className="timeline-message-mark" aria-hidden="true">!</span>
              <div><h3>Unable to reach the timeline service</h3><p>The request did not return a response. Check your connection and try again.</p></div>
              <button type="button" onClick={() => setRefreshTick((tick) => tick + 1)} data-testid="button-retry-timeline">Retry</button>
            </div>
          )}
          {!requestError && response && response.status !== 'ready' && !loading && (
            <div className={`timeline-message timeline-message--${response.status}`} role="status">
              <span className="timeline-message-mark" aria-hidden="true">{response.status === 'disconnected' ? '—' : 'i'}</span>
              <div><h3>{response.status === 'no-approved-data' && mode === 'preview' ? 'No records are available in the editor preview.' : statusCopy[response.status]}</h3><p>{response.message}</p></div>
            </div>
          )}
          {!loading && !requestError && response?.status === 'ready' && events.length === 0 && (
            <div className="timeline-empty-record" role="status">
              <span className="timeline-empty-index">00 / NO MATCHES</span>
              <div><h3>No records match this view.</h3><p>Try widening the year range or clearing one of the filters. No historical entries have been added to fill this space.</p></div>
            </div>
          )}
          {events.length > 0 && (
            <div className="timeline-record-list">
              {events.map((event, index) => (
                <article
                  className={`timeline-record confidence-${event.confidence}${selectedId === event.id ? ' is-selected' : ''}`}
                  key={event.id}
                  id={`event-${event.id}`}
                  data-layer-id={event.layerId}
                  data-linked-map-feature-id={event.linkedMapFeatureId}
                >
                  <div className="timeline-record-year"><span>{yearLabel(event)}</span><i aria-hidden="true" /></div>
                  <div className="timeline-record-main">
                    <div className="timeline-record-meta"><span>{event.period || 'Period not specified'}</span><span>{event.region || 'Region not specified'}</span></div>
                    <h3>{event.title}</h3>
                    <p className="timeline-record-description">{event.description}</p>
                    <div className="timeline-record-tags">
                      <span className={`timeline-confidence confidence-tag--${event.confidence}`}>{event.confidence}</span>
                      {event.datePrecision && <span className="timeline-date-precision">Date precision: {event.datePrecision}</span>}
                      <span>{event.layerName}</span>
                      {event.layerSubtype && <span>{event.layerSubtype}</span>}
                      <span>{event.eventType || 'Type not specified'}</span>
                      <span>{event.locationPrecision === 'none' ? 'Geography incomplete' : `Location ${event.locationPrecision}`}</span>
                      {mode === 'preview' && <span className="timeline-publication">{event.publicationStatus || 'Publication status not supplied'}</span>}
                    </div>
                    <div className="timeline-record-actions">
                      <button type="button" className="timeline-detail-link" aria-expanded={selectedId === event.id} aria-controls={`details-${event.id}`} onClick={() => setSelectedId(selectedId === event.id ? null : event.id)} data-testid={`button-details-${event.id}`}>
                        {selectedId === event.id ? 'Close details' : 'Details & sources'} <span aria-hidden="true">{selectedId === event.id ? '−' : '+'}</span>
                      </button>
                      {eventGeometry(event) && <button type="button" className="timeline-map-link" onClick={() => { setSelectedId(event.id); document.querySelector('.timeline-map-column')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); }} data-testid={`button-locate-${event.id}`}>View verified location</button>}
                    </div>
                    {selectedId === event.id && (
                      <div className="timeline-details" id={`details-${event.id}`}>
                        <dl>
                          <div><dt>Verification</dt><dd>{event.verificationStatus || 'Not specified'}</dd></div>
                          <div><dt>Date precision</dt><dd>{event.datePrecision || 'Not supplied'}</dd></div>
                          {event.locationName && <div><dt>Location name</dt><dd>{event.locationName}</dd></div>}
                          {event.linkedMapFeatureId && <div><dt>Linked map feature</dt><dd>{event.linkedMapFeatureId}</dd></div>}
                          <div><dt>Location precision</dt><dd>{event.locationPrecision}</dd></div>
                          {mode === 'preview' && <div><dt>Publication</dt><dd>{event.publicationStatus || 'Not specified'}</dd></div>}
                        </dl>
                        <div className="timeline-sources"><h4>Sources ({event.sources.length})</h4>
                          {event.sources.length ? <ol>{event.sources.map((source, sourceIndex) => {
                            const href = safeSourceUrl(source.url);
                            return <li key={`${event.id}-${sourceIndex}`}>{href ? <a href={href} target="_blank" rel="noreferrer">{source.label || href}<span className="timeline-external" aria-hidden="true"> ↗</span></a> : <span>{source.label || 'Source label not supplied'}</span>}</li>;
                          })}</ol> : <p>No sources are attached to this record.</p>}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="timeline-record-number">{String(index + 1).padStart(2, '0')}</span>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="timeline-context" aria-labelledby="timeline-context-title">
          <div>
            <p className="timeline-label">Reference</p>
            <h2 id="timeline-context-title">{mode === 'preview' ? 'Editor-only Master Timeline context' : 'Approved Master Timeline context'}</h2>
          </div>
          <details>
            <summary>{mode === 'preview' ? 'Editor-only sources and methodology' : 'Sources and Methodology'}</summary>
            <div className="timeline-context-content">
              {response?.context?.length ? (
                <ul className="timeline-context-list">
                  {response.context.map((item, index) => (
                    <li key={`${item.year ?? 'undated'}-${item.title}-${index}`}>
                      {item.year !== null && <span className="timeline-context-year">{item.year}</span>}
                      <div><h3>{item.title}</h3><p>{item.summary}</p></div>
                    </li>
                  ))}
                </ul>
              ) : <p className="timeline-context-empty">{mode === 'preview' ? 'No editor-preview Master Timeline context was returned.' : 'No approved Master Timeline context was returned.'}</p>}
              <div className="timeline-methodology">
                <h3>{mode === 'preview' ? 'Editor-only methodology' : 'Sources and Methodology'}</h3>
                {response?.methodology?.length ? (
                  <ul>{response.methodology.map((source, index) => {
                    const href = safeSourceUrl(source.url);
                    return (
                      <li key={`${source.label}-${index}`}>
                        {href ? <a href={href} target="_blank" rel="noreferrer">{source.label || href}</a> : <span>{source.label || 'Source label not supplied'}</span>}
                        {source.detail && <p>{source.detail}</p>}
                      </li>
                    );
                  })}</ul>
                ) : <p className="timeline-context-empty">{mode === 'preview' ? 'No editor-preview methodology was returned.' : 'No Sources and Methodology entries were returned.'}</p>}
              </div>
            </div>
          </details>
        </section>
        <footer className="timeline-footnote">
          <p><strong>Reading this map</strong> A marker represents a verified placement, not certainty about every detail of an event. Approximate, disputed, and incomplete records remain in the chronology without a point.</p>
          <p>Refreshes every 60 seconds · Historical claims retain the source and verification status supplied with each record.</p>
        </footer>
      </div>
    </section>
  );
}
