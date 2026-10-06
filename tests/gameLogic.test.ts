import { CAMPUS_POLYGON } from '../src/constants/campus';
import { calculateCatchProbability } from '../src/utils/catchProbability';
import { calculateCP } from '../src/utils/cpCalculator';
import { isPointInPolygon } from '../src/utils/geofence';
import { haversineMeters } from '../src/utils/haversine';
import { generateIVs } from '../src/utils/ivGenerator';

describe('1. Geofencing - Algoritmo Ray-Casting', () => {
  test('Punto dentro del Campus Universidad de La Sabana', () => {
    const insidePoint = { latitude: 4.8605, longitude: -74.0325 };
    expect(isPointInPolygon(insidePoint, CAMPUS_POLYGON)).toBe(true);
  });

  test('Punto fuera del Campus (Centro de Bogotá / Chía pueblo)', () => {
    const outsidePoint = { latitude: 4.6097, longitude: -74.0817 };
    expect(isPointInPolygon(outsidePoint, CAMPUS_POLYGON)).toBe(false);
  });
});

describe('2. Distancia Geográfica Haversine', () => {
  const basePoint = { latitude: 4.860479, longitude: -74.033279 };

  test('Misma coordenada debe ser 0 metros', () => {
    const dist = haversineMeters(basePoint, basePoint);
    expect(dist).toBeCloseTo(0, 1);
  });

  test('Distancia dentro del radio de 20 metros para Poképarada', () => {
    const nearPoint = { latitude: 4.860485, longitude: -74.033279 }; // ~0.67m
    const dist = haversineMeters(basePoint, nearPoint);
    expect(dist).toBeLessThanOrEqual(20);
  });

  test('Distancia mayor a 20 metros de Poképarada', () => {
    const farPoint = { latitude: 4.861000, longitude: -74.033279 }; // ~57m
    const dist = haversineMeters(basePoint, farPoint);
    expect(dist).toBeGreaterThan(20);
  });

  test('Distancia dentro del radio de 30 metros para Spawn de Pokémon', () => {
    const spawnPoint = { latitude: 4.860600, longitude: -74.033279 }; // ~13.4m
    const dist = haversineMeters(basePoint, spawnPoint);
    expect(dist).toBeLessThanOrEqual(30);
  });

  test('Distancia mayor a 30 metros (Pokémon no visible)', () => {
    const spawnFar = { latitude: 4.861500, longitude: -74.033279 }; // ~113m
    const dist = haversineMeters(basePoint, spawnFar);
    expect(dist).toBeGreaterThan(30);
  });
});

describe('3. Cálculo de Combat Power (CP)', () => {
  test('Validar valores mínimos de CP (CP >= 10)', () => {
    const cp = calculateCP(10, 10, 10, 0, 0, 0, 1);
    expect(cp).toBeGreaterThanOrEqual(10);
  });

  test('Verificar que estadísticas base más altas incrementan el CP', () => {
    const lowCP = calculateCP(50, 50, 50, 5, 5, 5, 5);
    const highCP = calculateCP(150, 150, 150, 15, 15, 15, 5);
    expect(highCP).toBeGreaterThan(lowCP);
  });
});

describe('4. Generación de IVs (Valores Individuales)', () => {
  test('Verificar que IV HP, Atk y Def estén en el rango 0 <= IV <= 15', () => {
    for (let i = 0; i < 50; i++) {
      const ivs = generateIVs();
      expect(ivs.hp).toBeGreaterThanOrEqual(0);
      expect(ivs.hp).toBeLessThanOrEqual(15);
      expect(ivs.attack).toBeGreaterThanOrEqual(0);
      expect(ivs.attack).toBeLessThanOrEqual(15);
      expect(ivs.defense).toBeGreaterThanOrEqual(0);
      expect(ivs.defense).toBeLessThanOrEqual(15);
    }
  });
});

describe('5. Probabilidad de Captura', () => {
  test('Probabilidad debe estar entre 0.05 y 0.95', () => {
    const prob = calculateCatchProbability(0.4, 'great', 'ultra_ball');
    expect(prob).toBeGreaterThanOrEqual(0.05);
    expect(prob).toBeLessThanOrEqual(0.95);
  });

  test('Lanzamiento "miss" genera probabilidad 0', () => {
    const prob = calculateCatchProbability(0.4, 'miss', 'poke_ball');
    expect(prob).toBe(0);
  });

  test('Un tiro "excellent" debe aumentar la probabilidad vs "nice"', () => {
    const probNice = calculateCatchProbability(0.3, 'nice', 'poke_ball');
    const probExc = calculateCatchProbability(0.3, 'excellent', 'poke_ball');
    expect(probExc).toBeGreaterThan(probNice);
  });
});
