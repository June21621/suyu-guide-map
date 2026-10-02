/* =========================================================
   지도 · 검색 · 결과 렌더링
   ========================================================= */
import { KAKAO_APP_KEY, CATEGORIES, SEARCH_RADIUS_M, DEFAULT_CENTER } from "./config.js";
import { getLang, setLang, texts } from "./i18n.js";

let map, places, geocoder;
let centerLatLng = null;     // 현재 검색 기준 좌표 (kakao.maps.LatLng)
let markers = [];
let activeCategory = null;
let myLocationOverlay = null;

/* =========================================================
   3. 부트스트랩
   ========================================================= */
function checkKeyAndStart(){
  if(!KAKAO_APP_KEY || KAKAO_APP_KEY === "YOUR_KAKAO_JAVASCRIPT_KEY"){
    document.getElementById("setup").style.display = "flex";
    return;
  }
  const script = document.createElement("script");
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false`;
  script.onload = () => kakao.maps.load(initMap);
  script.onerror = () => {
    document.getElementById("setup").style.display = "flex";
  };
  document.head.appendChild(script);
}

function initMap(){
  const container = document.getElementById("map");
  centerLatLng = new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
  map = new kakao.maps.Map(container, { center: centerLatLng, level: 5 });
  places = new kakao.maps.services.Places();

  buildChips();
  applyI18n();

  // GPS 위치를 시도해서 가능하면 그쪽으로 중심 이동
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      (pos)=>{
        const ll = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        centerLatLng = ll;
        map.setCenter(ll);
        placeMyLocationMarker(ll);
      },
      ()=>{ /* 권한 거부 시 기본 좌표 유지 */ },
      { enableHighAccuracy:true, timeout:5000 }
    );
  }

  document.getElementById("locateBtn").addEventListener("click", locateMe);
  document.getElementById("sheetHandle").addEventListener("click", toggleSheet);
}

function locateMe(){
  if(!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((pos)=>{
    const ll = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    centerLatLng = ll;
    map.setCenter(ll);
    map.setLevel(4);
    placeMyLocationMarker(ll);
    if(activeCategory) runSearch(activeCategory);
  });
}

function placeMyLocationMarker(ll){
  if(myLocationOverlay) myLocationOverlay.setMap(null);
  const el = document.createElement("div");
  el.className = "pin me";
  el.innerHTML = `<span>●</span>`;
  myLocationOverlay = new kakao.maps.CustomOverlay({ position: ll, content: el, yAnchor: 0.5, zIndex: 10 });
  myLocationOverlay.setMap(map);
}

/* =========================================================
   4. 카테고리 칩 렌더링
   ========================================================= */
function buildChips(){
  const safetyRow = document.getElementById("chips-safety");
  const convRow = document.getElementById("chips-conv");
  CATEGORIES.forEach(cat=>{
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.dataset.id = cat.id;
    chip.innerHTML = `<span class="dot" style="background:${cat.color}"></span><span class="lbl">${cat.icon} ${texts()[cat.i18n]}</span>`;
    chip.addEventListener("click", ()=> selectCategory(cat));
    (cat.group === "safety" ? safetyRow : convRow).appendChild(chip);
  });
}

function refreshChipLabels(){
  document.querySelectorAll(".chip").forEach(chipEl=>{
    const cat = CATEGORIES.find(c=>c.id===chipEl.dataset.id);
    chipEl.querySelector(".lbl").textContent = `${cat.icon} ${texts()[cat.i18n]}`;
  });
}

function selectCategory(cat){
  activeCategory = cat;
  document.querySelectorAll(".chip").forEach(el=>{
    const isActive = el.dataset.id === cat.id;
    el.classList.toggle("active", isActive);
    el.style.background = isActive ? cat.color : "";
  });
  document.getElementById("sheet").classList.add("expanded");
  runSearch(cat);
}

/* =========================================================
   5. 검색 (카테고리 / 키워드)
   ========================================================= */
function runSearch(cat){
  // 카테고리를 누른 시점의 "현재 지도 중심"을 기준으로 검색한다.
  // (지도를 드래그해서 다른 동네로 옮긴 뒤에도 그 위치 기준으로 검색되도록)
  centerLatLng = map.getCenter();
  const radius = cat.radius || SEARCH_RADIUS_M;
  const opts = { location: centerLatLng, radius: radius, sort: kakao.maps.services.SortBy.DISTANCE };
  const callback = (data, status)=> renderResults(cat, data, status);

  if(cat.type === "category"){
    places.categorySearch(cat.code, callback, opts);
  }else{
    places.keywordSearch(cat.keyword, callback, opts);
  }
}

function clearMarkers(){
  markers.forEach(m=>m.setMap(null));
  markers = [];
}

function fmtDistance(meters){
  const m = Number(meters);
  if(!m) return "";
  return m < 1000 ? `${m}m` : `${(m/1000).toFixed(1)}km`;
}

function appendBusFallback(list, cat, t){
  const c = centerLatLng;
  const fallback = document.createElement("div");
  fallback.className = "place";
  fallback.style.background = "#F4F0FF";
  fallback.style.cursor = "pointer";
  fallback.innerHTML = `
    <div class="badge" style="background:${cat.color}">${cat.icon}</div>
    <div class="info">
      <p class="pname">${t.busFallback}</p>
    </div>
  `;
  fallback.addEventListener("click", ()=>{
    window.open(`https://map.kakao.com/?map_type=TYPE_MAP&q=${encodeURIComponent(t.cat_bus)}&panelType=USERLOC&lat=${c.getLat()}&lng=${c.getLng()}`, "_blank", "noopener");
  });
  list.appendChild(fallback);
}

function renderResults(cat, data, status){
  clearMarkers();
  const list = document.getElementById("list");
  list.innerHTML = "";

  const t = texts();
  document.getElementById("sheetTitle").innerHTML = `<span class="dot" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${cat.color};margin-right:6px;"></span>${cat.icon} ${t[cat.i18n]}`;

  if(status !== kakao.maps.services.Status.OK || data.length === 0){
    document.getElementById("sheetCount").textContent = "";
    list.innerHTML = `<div class="empty">${t.noResults}</div>`;
    if(cat.id === "bus") appendBusFallback(list, cat, t);
    return;
  }

  document.getElementById("sheetCount").textContent = t.resultsFor(data.length);

  // 버스정류장은 카카오 검색 데이터가 부실해서, 카카오맵 앱으로 바로 연결되는 보완 링크를 항상 보여준다.
  if(cat.id === "bus") appendBusFallback(list, cat, t);

  const bounds = new kakao.maps.LatLngBounds();

  data.forEach((place, idx)=>{
    const pos = new kakao.maps.LatLng(place.y, place.x);
    bounds.extend(pos);

    // 마커
    const el = document.createElement("div");
    el.className = "pin";
    el.style.background = cat.color;
    el.innerHTML = `<span>${cat.icon}</span>`;
    const overlay = new kakao.maps.CustomOverlay({ position: pos, content: el, yAnchor: 1, zIndex: 3 });
    overlay.setMap(map);
    markers.push(overlay);

    el.addEventListener("click", ()=>{
      map.setCenter(pos);
      const row = document.getElementById(`place-${idx}`);
      if(row){
        row.scrollIntoView({ behavior:"smooth", block:"center" });
        row.classList.add("flash");
        setTimeout(()=>row.classList.remove("flash"), 1200);
      }
      document.getElementById("sheet").classList.add("expanded");
    });

    // 리스트 행
    const addr = place.road_address_name || place.address_name || "";
    const row = document.createElement("div");
    row.className = "place";
    row.id = `place-${idx}`;
    row.innerHTML = `
      <div class="badge" style="background:${cat.color}">${cat.icon}</div>
      <div class="info">
        <p class="pname">${escapeHtml(place.place_name)}</p>
        <p class="paddr">${escapeHtml(addr)}</p>
        <div class="actions">
          ${place.phone ? `<a href="tel:${place.phone}">📞 ${t.call}</a>` : ""}
          <a href="https://map.kakao.com/link/to/${encodeURIComponent(place.place_name)},${place.y},${place.x}" target="_blank" rel="noopener">🧭 ${t.directions}</a>
        </div>
      </div>
      <div class="dist">${fmtDistance(place.distance)}</div>
    `;
    row.addEventListener("click", ()=>{ map.setCenter(pos); map.setLevel(4); });
    list.appendChild(row);
  });

  map.setBounds(bounds);
}

function escapeHtml(str){
  return String(str || "").replace(/[&<>"']/g, (c)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[c]));
}

function toggleSheet(){
  document.getElementById("sheet").classList.toggle("expanded");
}

/* =========================================================
   6. 다국어 적용
   ========================================================= */
function applyI18n(){
  document.documentElement.lang = getLang();
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.dataset.i18n;
    if(texts()[key]) el.textContent = texts()[key];
  });
  refreshChipLabels();
  if(activeCategory) runSearch(activeCategory); // 결과 리스트 라벨도 새로고침
}

document.querySelectorAll(".langs button").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    setLang(btn.dataset.lang);
    document.querySelectorAll(".langs button").forEach(b=>b.classList.toggle("active", b===btn));
    applyI18n();
  });
});

checkKeyAndStart();
