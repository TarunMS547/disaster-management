// Geo-spatial projection utility mapping 3D simulation coordinates to real OpenStreetMap lat/lng coordinates

export const METRO_CENTER_LAT = 37.7749;
export const METRO_CENTER_LNG = -122.4194;

const SCALE_LAT = 0.0028; // ~310m per unit
const SCALE_LNG = 0.0035; // ~300m per unit

export function simPosToLatLng(pos: [number, number, number]): [number, number] {
  // In our 3D space: X is East(+)/West(-), Z is South(+)/North(-)
  const lat = METRO_CENTER_LAT - (pos[2] * SCALE_LAT);
  const lng = METRO_CENTER_LNG + (pos[0] * SCALE_LNG);
  return [lat, lng];
}

export function latLngToSimPos(lat: number, lng: number): [number, number, number] {
  const z = (METRO_CENTER_LAT - lat) / SCALE_LAT;
  const x = (lng - METRO_CENTER_LNG) / SCALE_LNG;
  return [x, 0, z];
}
