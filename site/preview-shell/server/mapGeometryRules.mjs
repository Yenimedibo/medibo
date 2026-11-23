/**
 * Geometry shape policy for historical route/territory/area features.
 * This verifies structural plausibility only, NOT historical provenance.
 * A Map Events row still needs approved publication, location review,
 * sources, date precision, and Map Feature Ready = YES.
 */
function isPoint(point) {
  return Array.isArray(point) && point.length === 2 &&
    point.every(n => typeof n === 'number' && Number.isFinite(n)) &&
    point[0] >= -180 && point[0] <= 180 && point[1] >= -90 && point[1] <= 90;
}
function samePoint(a, b) { return a[0] === b[0] && a[1] === b[1]; }
function isUsableLine(points) {
  return Array.isArray(points) && points.length >= 2 && points.every(isPoint) &&
    points.some((point, i) => i > 0 && !samePoint(point, points[0]));
}
function isUsableRing(points) {
  if (!Array.isArray(points) || points.length < 4 || !points.every(isPoint) ||
      !samePoint(points[0], points[points.length - 1])) return false;
  // A closed line or a point repeated four times is not a land polygon.
  let twiceArea = 0;
  for (let i = 1; i < points.length; i++) {
    twiceArea += points[i - 1][0] * points[i][1] - points[i][0] * points[i - 1][1];
  }
  return Math.abs(twiceArea) > 1e-12;
}
function isUsablePolygon(rings) {
  return Array.isArray(rings) && rings.length > 0 && rings.every(isUsableRing);
}

/**
 * Type-safe map inclusion. A historical trade route is a line (not a
 * polygon); a mine is a Point handled by verifiedGeography's Point branch;
 * a documented extent (flood, drought impact, territory) is an area.
 * No automatic location, mine operation, or historical trade inference.
 */
export function geometryMatchesFeatureType(featureType, geometry) {
  if (!geometry || typeof geometry !== 'object') return false;
  const feature = String(featureType ?? '').trim().toLowerCase();
  if (feature === 'route') {
    return geometry.type === 'LineString' ? isUsableLine(geometry.coordinates)
      : geometry.type === 'MultiLineString' &&
        Array.isArray(geometry.coordinates) && geometry.coordinates.length > 0 &&
        geometry.coordinates.every(isUsableLine);
  }
  if (feature === 'territory' || feature === 'area') {
    return geometry.type === 'Polygon' ? isUsablePolygon(geometry.coordinates)
      : geometry.type === 'MultiPolygon' &&
        Array.isArray(geometry.coordinates) && geometry.coordinates.length > 0 &&
        geometry.coordinates.every(isUsablePolygon);
  }
  return false;
}
