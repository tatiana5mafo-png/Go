// Página que se carga dentro del WebView: MapLibre GL JS + tiles vectoriales de OpenFreeMap.
// Hablan RN -> página con window.__rn(msg) y página -> RN con ReactNativeWebView.postMessage.
export const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link href="https://unpkg.com/maplibre-gl@5.6.1/dist/maplibre-gl.css" rel="stylesheet" />
<script src="https://unpkg.com/maplibre-gl@5.6.1/dist/maplibre-gl.js"></script>
<style>
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0b1030; }
  body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
  #map { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
  .maplibregl-ctrl-top-left { margin-top: 50px; }
  .maplibregl-marker { position: absolute; top: 0; left: 0; }

  @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
  @keyframes bobc { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(-7px) rotate(45deg); } }
  @keyframes pulse { 0% { transform: scale(0.6); opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }

  /* Poképarada: cubo azul con anillo y haz de luz */
  .stop {width: 60px; height: 90px; }
  .stop .ring { position: absolute; left: 2px; bottom: 0; width: 52px; height: 18px; border: 2px solid rgba(255,255,255,0.95); border-radius: 50%; box-shadow: 0 0 10px rgba(125,211,252,0.9); }
  .stop .beam { position: absolute; left: 50%; bottom: 10px; width: 3px; height: 64px; margin-left: -1px; background: linear-gradient(to top, rgba(125,211,252,0.95), rgba(125,211,252,0)); }
  .stop .cube { position: absolute; left: 50%; bottom: 34px; width: 24px; height: 24px; margin-left: -12px; background: linear-gradient(135deg, #bae6fd, #0ea5e9); border-radius: 5px; transform: rotate(45deg); box-shadow: 0 0 18px #38bdf8; animation: bobc 1.8s ease-in-out infinite; }

  /* Gimnasio: torre roja */
  .gym {width: 72px; height: 112px; }
  .gym .ring { position: absolute; left: 2px; bottom: 0; width: 64px; height: 22px; border: 2px solid rgba(255,255,255,0.95); border-radius: 50%; box-shadow: 0 0 10px rgba(248,113,113,0.9); }
  .gym .beam { position: absolute; left: 50%; bottom: 12px; width: 3px; height: 80px; margin-left: -1px; background: linear-gradient(to top, rgba(248,113,113,0.95), rgba(248,113,113,0)); }
  .gym .tower { position: absolute; left: 50%; bottom: 18px; width: 30px; height: 56px; margin-left: -15px; background: linear-gradient(#fecaca, #ef4444 55%, #991b1b); border-radius: 8px 8px 4px 4px; box-shadow: 0 0 18px #f87171; animation: bob 2.2s ease-in-out infinite; }
  .gym .tower:before { content: ''; position: absolute; left: -6px; right: -6px; top: -8px; height: 14px; background: #ffffff; border-radius: 7px; }

  .near .ring { border-color: #facc15; box-shadow: 0 0 14px #facc15; }
  .near .cube, .near .tower { filter: brightness(1.35); }
  .tag { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #facc15; color: #713f12; font: 800 11px sans-serif; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }

  /* Criatura salvaje */
  .spawn {width: 84px; height: 104px; cursor: pointer; }
  .spawn .ring { position: absolute; left: 6px; bottom: 0; width: 68px; height: 20px; border: 2px solid rgba(255,255,255,0.9); border-radius: 50%; background: rgba(255,255,255,0.14); }
  .spawn .bub { position: absolute; left: 50%; bottom: 14px; width: 72px; height: 72px; margin-left: -36px; border-radius: 50%; background: rgba(255,255,255,0.93); border: 3px solid #ffffff; box-shadow: 0 6px 14px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; animation: bob 1.6s ease-in-out infinite; }
  .spawn.sel .bub { border-color: #facc15; }
  .spawn img { width: 60px; height: 60px; object-fit: contain; pointer-events: none; }

  /* Jugador */
  .me { width: 56px; height: 56px; }
  .me .pulse { position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 50%; background: rgba(59,130,246,0.55); animation: pulse 1.6s ease-out infinite; }
  .me .av { position: absolute; left: 6px; top: 6px; width: 44px; height: 44px; border-radius: 50%; background: #ffffff; border: 3px solid #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 22px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
(function () {
  function post(msg) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }
  if (!window.maplibregl) { post({ type: 'error', message: 'No cargo MapLibre' }); return; }

  var OMT_URL = 'https://tiles.openfreemap.org/planet';
  var ATTR = '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; OpenMapTiles Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

  var PALETTES = {
    night: {
      land: '#141a4b', green: '#1b2a6a', landuse: '#182158', water: '#090d33', waterway: '#0d1450', lake: '#0d1a66',
      roadMinor: '#2c3ba3', roadMinorCase: '#1a2370', roadMajor: '#3b4fc4', roadMajorCase: '#222d86', path: '#5a6be0',
      building: '#4658c9', mask: 'rgba(4,6,28,0.62)', campus: '#7dd3fc',
      radiusFill: 'rgba(125,211,252,0.10)', radiusLine: '#a5f3fc', page: '#0b1030'
    },
    day: {
      land: '#e6efd9', green: '#b5e29b', landuse: '#dbe9c8', water: '#8fd0f2', waterway: '#8fd0f2', lake: '#6cc3ee',
      roadMinor: '#ffffff', roadMinorCase: '#c9d6b4', roadMajor: '#fff7d6', roadMajorCase: '#c9bf8a', path: '#efe6c6',
      building: '#e4d9c6', mask: 'rgba(20,50,40,0.28)', campus: '#ffffff',
      radiusFill: 'rgba(250,204,21,0.14)', radiusLine: '#facc15', page: '#dfe9d2'
    }
  };

  var state = {
    theme: 'night', campus: null, lakes: [], radiusM: 20,
    radiusFC: { type: 'FeatureCollection', features: [] }
  };

  function emptyFC() { return { type: 'FeatureCollection', features: [] }; }

  function ringLngLat(coords) {
    var r = coords.map(function (c) { return [c.longitude, c.latitude]; });
    r.push(r[0]);
    return r;
  }

  // Circulo de radio r (metros) alrededor de un punto: formula del punto destino sobre la esfera
  function circlePoly(lng, lat, r) {
    var pts = [];
    var d = r / 6371000;
    var la = lat * Math.PI / 180;
    var lo = lng * Math.PI / 180;
    for (var i = 0; i <= 64; i++) {
      var b = (i / 64) * 2 * Math.PI;
      var la2 = Math.asin(Math.sin(la) * Math.cos(d) + Math.cos(la) * Math.sin(d) * Math.cos(b));
      var lo2 = lo + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(la), Math.cos(d) - Math.sin(la) * Math.sin(la2));
      pts.push([lo2 * 180 / Math.PI, la2 * 180 / Math.PI]);
    }
    return pts;
  }

  function lineW(base) {
    // ancho que crece con el zoom (en pixeles)
    return ['interpolate', ['exponential', 1.6], ['zoom'], 14, base[0], 18, base[1], 20, base[2]];
  }

  function buildStyle(theme) {
    var c = PALETTES[theme];
    var mask = emptyFC(), line = emptyFC(), lakes = emptyFC();

    if (state.campus && state.campus.length > 2) {
      var ring = ringLngLat(state.campus);
      // Mundo con un hueco con la forma del campus: oscurece todo lo que queda afuera
      mask.features.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon',
        coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]], ring] } });
      line.features.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: ring } });
    }
    state.lakes.forEach(function (lk) {
      var r = lk.map(function (p) { return [p[1], p[0]]; });
      r.push(r[0]);
      lakes.features.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [r] } });
    });

    var isLine = ['==', ['geometry-type'], 'LineString'];
    var minor = ['all', isLine, ['match', ['get', 'class'], ['minor', 'service', 'track'], true, false]];
    var major = ['all', isLine, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'], true, false]];
    var paths = ['all', isLine, ['match', ['get', 'class'], ['path', 'pedestrian'], true, false]];
    var round = { 'line-cap': 'round', 'line-join': 'round' };

    return {
      version: 8,
      sources: {
        omt: { type: 'vector', url: OMT_URL, attribution: ATTR },
        campusMask: { type: 'geojson', data: mask },
        campusLine: { type: 'geojson', data: line },
        lakes: { type: 'geojson', data: lakes },
        radius: { type: 'geojson', data: state.radiusFC }
      },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': c.land } },
        { id: 'landcover', type: 'fill', source: 'omt', 'source-layer': 'landcover', paint: { 'fill-color': c.green, 'fill-opacity': 0.85 } },
        { id: 'landuse', type: 'fill', source: 'omt', 'source-layer': 'landuse',
          filter: ['match', ['get', 'class'], ['pitch', 'playground', 'park', 'garden', 'cemetery', 'grass', 'stadium'], true, false],
          paint: { 'fill-color': c.landuse, 'fill-opacity': 0.9 } },
        { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': c.green, 'fill-opacity': 0.7 } },
        { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': c.water } },
        { id: 'waterway', type: 'line', source: 'omt', 'source-layer': 'waterway', paint: { 'line-color': c.waterway, 'line-width': 2 } },
        { id: 'lakes', type: 'fill', source: 'lakes', paint: { 'fill-color': c.lake } },

        { id: 'road-minor-case', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 14, filter: minor, layout: round,
          paint: { 'line-color': c.roadMinorCase, 'line-width': lineW([2, 14, 34]) } },
        { id: 'road-major-case', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 12, filter: major, layout: round,
          paint: { 'line-color': c.roadMajorCase, 'line-width': lineW([3, 22, 52]) } },
        { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 14, filter: minor, layout: round,
          paint: { 'line-color': c.roadMinor, 'line-width': lineW([1, 9, 24]) } },
        { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 12, filter: major, layout: round,
          paint: { 'line-color': c.roadMajor, 'line-width': lineW([2, 16, 40]) } },
        { id: 'path', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 15, filter: paths,
          paint: { 'line-color': c.path, 'line-width': ['interpolate', ['linear'], ['zoom'], 15, 1, 19, 4], 'line-dasharray': [2, 2] } },

        { id: 'building', type: 'fill-extrusion', source: 'omt', 'source-layer': 'building', minzoom: 15,
          paint: {
            'fill-extrusion-color': c.building,
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
            'fill-extrusion-opacity': 0.92
          } },

        { id: 'campus-mask', type: 'fill', source: 'campusMask', paint: { 'fill-color': c.mask } },
        { id: 'campus-glow', type: 'line', source: 'campusLine', paint: { 'line-color': c.campus, 'line-width': 10, 'line-blur': 8, 'line-opacity': 0.55 } },
        { id: 'campus-line', type: 'line', source: 'campusLine', layout: { 'line-join': 'round' }, paint: { 'line-color': c.campus, 'line-width': 3 } },
        { id: 'radius-fill', type: 'fill', source: 'radius', paint: { 'fill-color': c.radiusFill } },
        { id: 'radius-line', type: 'line', source: 'radius', paint: { 'line-color': c.radiusLine, 'line-width': 2 } }
      ]
    };
  }

  var map = new maplibregl.Map({
    container: 'map',
    style: buildStyle('night'),
    center: [-74.0335, 4.8605],
    zoom: 17.6,
    pitch: 58,
    bearing: 0,
    minZoom: 14.5,
    maxZoom: 20,
    maxPitch: 75,
    fadeDuration: 0,
    attributionControl: false
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'top-left');

  var poiMarkers = {};
  var spawnMarkers = {};
  var playerMarker = null;
  var lastPlayer = null;
  var following = true;
  var frozen = false;

  function applyTheme(theme) {
    state.theme = theme;
    document.body.style.background = PALETTES[theme].page;
    map.setStyle(buildStyle(theme));
  }

  function centroid(coords) {
    var la = 0, lo = 0;
    coords.forEach(function (c) { la += c.latitude; lo += c.longitude; });
    return [lo / coords.length, la / coords.length];
  }

  function setBounds(coords) {
    var minLa = 90, maxLa = -90, minLo = 180, maxLo = -180, pad = 0.004;
    coords.forEach(function (c) {
      minLa = Math.min(minLa, c.latitude); maxLa = Math.max(maxLa, c.latitude);
      minLo = Math.min(minLo, c.longitude); maxLo = Math.max(maxLo, c.longitude);
    });
    map.setMaxBounds([[minLo - pad, minLa - pad], [maxLo + pad, maxLa + pad]]);
  }

  function setPois(list) {
    Object.keys(poiMarkers).forEach(function (k) { poiMarkers[k].marker.remove(); });
    poiMarkers = {};
    list.forEach(function (p) {
      var gym = p.kind === 'gym';
      var el = document.createElement('div');
      el.className = gym ? 'gym' : 'stop';
      el.innerHTML = '<div class="beam"></div><div class="' + (gym ? 'tower' : 'cube') + '"></div><div class="ring"></div>';
      var mk = new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, 10] }).setLngLat([p.lng, p.lat]).addTo(map);
      poiMarkers[p.id] = { marker: mk, el: el, name: p.name };
    });
  }

  function setNear(id) {
    Object.keys(poiMarkers).forEach(function (k) {
      var rec = poiMarkers[k];
      var isNear = k === id;
      rec.el.classList.toggle('near', isNear);
      var tag = rec.el.querySelector('.tag');
      if (isNear && !tag) {
        tag = document.createElement('div');
        tag.className = 'tag';
        tag.textContent = rec.name;
        rec.el.appendChild(tag);
      } else if (!isNear && tag) {
        rec.el.removeChild(tag);
      }
    });
  }

  function setPlayer(m) {
    lastPlayer = [m.lng, m.lat];
    if (!playerMarker) {
      var el = document.createElement('div');
      el.className = 'me';
      el.innerHTML = '<div class="pulse"></div><div class="av">&#129506;</div>';
      playerMarker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(lastPlayer).addTo(map);
    } else {
      playerMarker.setLngLat(lastPlayer);
    }
    playerMarker.getElement().style.display = m.visible === false ? 'none' : '';

    state.radiusFC = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {},
      geometry: { type: 'Polygon', coordinates: [circlePoly(m.lng, m.lat, state.radiusM)] } }] };
    var src = map.getSource('radius');
    if (src && src.setData) src.setData(state.radiusFC);

    if (following && !frozen) map.easeTo({ center: lastPlayer, duration: 900, essential: true });
  }

  function setSpawns(items, selectedId) {
    var keep = {};
    items.forEach(function (s) {
      keep[s.id] = true;
      if (!spawnMarkers[s.id]) {
        var el = document.createElement('div');
        el.className = 'spawn';
        el.innerHTML = '<div class="ring"></div><div class="bub"><img alt="" /></div>';
        if (s.sprite) el.querySelector('img').src = s.sprite;
        el.addEventListener('click', function (ev) {
          ev.stopPropagation();
          post({ type: 'spawn', id: s.id });
        });
        var mk = new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, 10] }).setLngLat([s.lng, s.lat]).addTo(map);
        spawnMarkers[s.id] = { marker: mk, el: el };
      }
    });
    Object.keys(spawnMarkers).forEach(function (id) {
      if (!keep[id]) { spawnMarkers[id].marker.remove(); delete spawnMarkers[id]; }
    });
    Object.keys(spawnMarkers).forEach(function (id) {
      spawnMarkers[id].el.classList.toggle('sel', id === selectedId);
    });
  }

  function setFrozen(v) {
    frozen = !!v;
    ['dragPan', 'dragRotate', 'scrollZoom', 'touchZoomRotate', 'touchPitch', 'doubleClickZoom', 'keyboard', 'boxZoom'].forEach(function (h) {
      if (map[h]) { if (frozen) map[h].disable(); else map[h].enable(); }
    });
    if (frozen) map.stop();
  }

  function recenter() {
    following = true;
    post({ type: 'follow', value: true });
    if (lastPlayer) map.easeTo({ center: lastPlayer, duration: 600 });
  }

  // Si el usuario arrastra el mapa con el dedo, deja de seguir al jugador
  map.on('dragstart', function (e) {
    if (e.originalEvent && following) {
      following = false;
      post({ type: 'follow', value: false });
    }
  });

  map.on('load', function () {
    map.setPadding({ top: 200, bottom: 0, left: 0, right: 0 }); // el jugador queda abajo, se ve mas camino adelante
    post({ type: 'ready' });
  });
  map.on('error', function (e) {
    post({ type: 'log', message: (e && e.error && e.error.message) ? e.error.message : 'error de mapa' });
  });

  function handle(msg) {
    if (msg.type === 'init') {
      state.campus = msg.campus;
      state.lakes = msg.lakes || [];
      state.radiusM = msg.radiusM || 20;
      applyTheme(msg.theme);
      setBounds(msg.campus);
      setPois(msg.pois || []);
      map.jumpTo({ center: centroid(msg.campus), zoom: 17.6, pitch: 58, bearing: 0 });
    } else if (msg.type === 'theme') {
      if (msg.theme !== state.theme) applyTheme(msg.theme);
    } else if (msg.type === 'player') {
      setPlayer(msg);
    } else if (msg.type === 'spawns') {
      setSpawns(msg.items || [], msg.selectedId);
    } else if (msg.type === 'near') {
      setNear(msg.id);
    } else if (msg.type === 'bearing') {
      if (!frozen) map.rotateTo(typeof msg.value === 'number' ? msg.value : 0, { duration: 180 });
    } else if (msg.type === 'frozen') {
      setFrozen(msg.value);
    } else if (msg.type === 'recenter') {
      recenter();
    }
  }

  window.__rn = function (msg) {
    try { handle(msg); } catch (e) { post({ type: 'log', message: String(e) }); }
  };
})();
</script>
</body>
</html>`;