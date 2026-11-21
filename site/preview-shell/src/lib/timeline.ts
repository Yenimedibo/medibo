export type HistoricalConfidence =
  | 'verified'
  | 'approximate'
  | 'disputed'
  | 'incomplete';

export type TimelineSource = {
  label: string;
  url?: string;
  detail?: string;
};

export type TimelineGeometry = {
  type:
    | 'Point'
    | 'MultiPoint'
    | 'LineString'
    | 'MultiLineString'
    | 'Polygon'
    | 'MultiPolygon';
  coordinates: unknown;
};

export type TimelineEvent = {
  id: string;
  originalEventId?: string;
  layerId: string;
  layerName: string;
  layerSubtype: string;
  linkedMapFeatureId?: string;
  title: string;
  startYear: number | null;
  endYear?: number | null;
  datePrecision?: string;
  locationName?: string;
  region: string;
  eventType: string;
  period: string;
  description: string;
  sources: TimelineSource[];
  confidence: HistoricalConfidence;
  verificationStatus: string;
  publicationStatus: string;
  locationPrecision: 'verified' | 'approximate' | 'none';
  latitude?: number;
  longitude?: number;
  geometry?: TimelineGeometry;
};

export type TimelineLayer = {
  id: string;
  name: string;
  defaultVisible: boolean;
  sortOrder: number;
  description?: string;
};

export type TimelineContext = {
  year: number | null;
  title: string;
  summary: string;
};

export type TimelineResponse = {
  status: 'ready' | 'disconnected' | 'no-approved-data' | 'error';
  lastSyncedAt: string | null;
  refreshSeconds: number;
  layers: TimelineLayer[];
  selectedLayerIds: string[];
  events: TimelineEvent[];
  context: TimelineContext[];
  methodology: TimelineSource[];
  canPreviewDrafts: boolean;
  message: string;
};
