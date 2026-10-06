import { Coordinate } from '../types';

/** Perímetro del campus, en orden horario. NO repetir el primer punto al final. */
export const CAMPUS_POLYGON: readonly Coordinate[] = [
  { latitude: 4.861361, longitude: -74.035611 }, // 1  (convertido de DMS)
  { latitude: 4.862056, longitude: -74.035389 }, // 2  (convertido de DMS)
  { latitude: 4.862556, longitude: -74.034722 }, // 3  (convertido de DMS)
  { latitude: 4.86275, longitude: -74.034083 },  // 4  (convertido de DMS)
  { latitude: 4.862777, longitude: -74.0329 }, // 5 (movido ~35 m al este para cubrir Ad Portas)
  { latitude: 4.862382, longitude: -74.032001 }, // 6
  { latitude: 4.862018, longitude: -74.031527 }, // 7
  { latitude: 4.861652, longitude: -74.031308 }, // 8
  { latitude: 4.860979, longitude: -74.031276 }, // 9
  { latitude: 4.860479, longitude: -74.031185 }, // 10
  { latitude: 4.860141, longitude: -74.031454 }, // 11
  { latitude: 4.859727, longitude: -74.031711 }, // 12
  { latitude: 4.858927, longitude: -74.032624 }, // 13
  { latitude: 4.858442, longitude: -74.033317 }, // 14
  { latitude: 4.858234, longitude: -74.033887 }, // 15
  { latitude: 4.858641, longitude: -74.033936 }, // 16
  { latitude: 4.859414, longitude: -74.03346 },  // 17
  { latitude: 4.860098, longitude: -74.033279 }, // 18
  { latitude: 4.86011, longitude: -74.03398 },   // 19 (nuevo)
  { latitude: 4.86026, longitude: -74.034441 },  // 20 (nuevo)
  { latitude: 4.860384, longitude: -74.035226 }, // 21 (nuevo)
];