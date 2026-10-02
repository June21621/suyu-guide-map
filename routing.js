/* =========================================================
   길찾기 (OpenRouteService)
   - 카카오 SDK 에는 길찾기가 없어서 경로 계산만 외부 API 를 쓴다.
   - 받은 좌표는 카카오 지도 위에 Polyline 으로 그린다.
   ========================================================= */
import { ORS_API_KEY, ORS_BASE, ORS_PROFILES } from "./config.js";

/**
 * 출발지 -> 도착지 경로를 구한다.
 * @param {"walk"|"car"} mode
 * @param {{lat:number, lng:number}} from
 * @param {{lat:number, lng:number}} to
 * @returns {Promise<{ok:true, distanceM:number, durationS:number, path:Array<{lat:number,lng:number}>}
 *                 | {ok:false, reason:"no-key"|"no-route"|"quota"|"network"|"bad-response"}>}
 */
export async function fetchRoute(mode, from, to){
  if(!ORS_API_KEY) return { ok:false, reason:"no-key" };

  const profile = ORS_PROFILES[mode];
  if(!profile) return { ok:false, reason:"bad-response" };

  const url = `${ORS_BASE}/${profile}`
    + `?api_key=${encodeURIComponent(ORS_API_KEY)}`
    + `&start=${from.lng},${from.lat}`
    + `&end=${to.lng},${to.lat}`;

  let res;
  try{
    res = await fetch(url);
  }catch(e){
    return { ok:false, reason:"network" };
  }

  if(res.status === 429) return { ok:false, reason:"quota" };
  if(!res.ok){
    // ORS 는 경로를 못 찾으면 404 + 오류 본문을 준다.
    return { ok:false, reason: res.status === 404 ? "no-route" : "bad-response" };
  }

  let json;
  try{
    json = await res.json();
  }catch(e){
    return { ok:false, reason:"bad-response" };
  }

  return parseRoute(json);
}

/** ORS GeoJSON 응답을 앱이 쓰는 형태로 바꾼다. (테스트에서 직접 호출한다) */
export function parseRoute(json){
  const feature = json && json.features && json.features[0];
  const summary = feature && feature.properties && feature.properties.summary;
  const coords = feature && feature.geometry && feature.geometry.coordinates;

  if(!summary || !Array.isArray(coords) || coords.length === 0){
    return { ok:false, reason:"no-route" };
  }

  return {
    ok: true,
    distanceM: Math.round(summary.distance),
    durationS: Math.round(summary.duration),
    // ORS 는 [경도, 위도] 순서, 카카오는 (위도, 경도) 순서라 뒤집는다.
    path: coords.map(([lng, lat]) => ({ lat, lng })),
  };
}

/** 소요시간을 "12분" / "1시간 5분" 형태로 만든다. */
export function formatDuration(seconds, t){
  const totalMin = Math.max(1, Math.round(seconds / 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if(h === 0) return t.durMin(m);
  if(m === 0) return t.durHour(h);
  return `${t.durHour(h)} ${t.durMin(m)}`;
}

/** 거리를 "120m" / "1.4km" 형태로 만든다. */
export function formatDistance(meters){
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters/1000).toFixed(1)}km`;
}

/** 두 지점의 직선거리(m). 도보 거리 제한 안내를 띄울지 판단할 때 쓴다. */
export function straightDistanceM(a, b){
  const R = 6371000;
  const toRad = (d)=> d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat/2)**2
          + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2)**2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}
