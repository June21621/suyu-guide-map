/* =========================================================
   다국어 텍스트
   - I18N: 언어별 문자열 사전
   - texts(): 현재 언어의 사전을 반환 (I18N[currentLang] 대신 사용)
   ========================================================= */
const I18N = {
  ko: {
    appTitle: "강북구 방문자 지도",
    appSubtitle: "병원·약국·편의점·대중교통·경찰서·소방서",
    groupSafety: "안전 · 응급",
    groupConvenience: "편의 · 교통",
    pickCategory: "위 카테고리를 선택하세요",
    noResults: "주변 1.5km 내 검색 결과가 없습니다",
    call: "전화", directions: "길찾기",
    cat_hospital: "병원", cat_pharmacy: "약국", cat_police: "경찰서",
    cat_fire: "소방서", cat_convenience: "편의점", cat_subway: "지하철역", cat_bus: "버스정류장",
    cat_cathedral: "성당",
    resultsFor: (n)=>`${n} · 가까운 순`,
    subwayMapBtn: "🚇 지하철 노선도",
    busFallback: "카카오맵 앱에서 버스정류장 더 보기 →",
  },
  en: {
    appTitle: "Gangbuk-gu Visitor Map",
    appSubtitle: "Hospitals · Pharmacies · Convenience · Transit · Police · Fire",
    groupSafety: "Safety & Emergency",
    groupConvenience: "Convenience & Transit",
    pickCategory: "Choose a category above",
    noResults: "No results within 1.5km",
    call: "Call", directions: "Directions",
    cat_hospital: "Hospital", cat_pharmacy: "Pharmacy", cat_police: "Police",
    cat_fire: "Fire Station", cat_convenience: "Convenience Store", cat_subway: "Subway Station", cat_bus: "Bus Stop",
    cat_cathedral: "Catholic Church",
    resultsFor: (n)=>`${n} · nearest first`,
    subwayMapBtn: "🚇 Subway Map",
    busFallback: "See more bus stops in Kakao Map app →",
  },
  it: {
    appTitle: "Mappa per Visitatori di Gangbuk-gu",
    appSubtitle: "Ospedali · Farmacie · Minimarket · Trasporti · Polizia · Vigili del fuoco",
    groupSafety: "Sicurezza & Emergenza",
    groupConvenience: "Servizi & Trasporti",
    pickCategory: "Scegli una categoria sopra",
    noResults: "Nessun risultato entro 1,5 km",
    call: "Chiama", directions: "Indicazioni",
    cat_hospital: "Ospedale", cat_pharmacy: "Farmacia", cat_police: "Polizia",
    cat_fire: "Vigili del fuoco", cat_convenience: "Minimarket", cat_subway: "Stazione metro", cat_bus: "Fermata bus",
    cat_cathedral: "Chiesa cattolica",
    resultsFor: (n)=>`${n} · più vicino prima`,
    subwayMapBtn: "🚇 Mappa della metro",
    busFallback: "Vedi più fermate bus nell'app Kakao Map →",
  },
  es: {
    appTitle: "Mapa para Visitantes de Gangbuk-gu",
    appSubtitle: "Hospitales · Farmacias · Tiendas · Transporte · Policía · Bomberos",
    groupSafety: "Seguridad y Emergencias",
    groupConvenience: "Comodidad y Transporte",
    pickCategory: "Elige una categoría arriba",
    noResults: "Sin resultados en 1.5 km",
    call: "Llamar", directions: "Cómo llegar",
    cat_hospital: "Hospital", cat_pharmacy: "Farmacia", cat_police: "Policía",
    cat_fire: "Bomberos", cat_convenience: "Tienda de conveniencia", cat_subway: "Estación de metro", cat_bus: "Parada de autobús",
    cat_cathedral: "Iglesia católica",
    resultsFor: (n)=>`${n} · más cercano primero`,
    subwayMapBtn: "🚇 Mapa del metro",
    busFallback: "Ver más paradas de autobús en la app Kakao Map →",
  },
  pt: {
    appTitle: "Mapa para Visitantes de Gangbuk-gu",
    appSubtitle: "Hospitais · Farmácias · Lojas de conveniência · Transporte · Polícia · Bombeiros",
    groupSafety: "Segurança e Emergência",
    groupConvenience: "Conveniência e Transporte",
    pickCategory: "Escolha uma categoria acima",
    noResults: "Nenhum resultado em 1,5 km",
    call: "Ligar", directions: "Como chegar",
    cat_hospital: "Hospital", cat_pharmacy: "Farmácia", cat_police: "Polícia",
    cat_fire: "Bombeiros", cat_convenience: "Loja de conveniência", cat_subway: "Estação de metrô", cat_bus: "Ponto de ônibus",
    cat_cathedral: "Igreja católica",
    resultsFor: (n)=>`${n} · mais próximo primeiro`,
    subwayMapBtn: "🚇 Mapa do metrô",
    busFallback: "Veja mais pontos de ônibus no app Kakao Map →",
  },
};

let currentLang = "ko";

export function getLang(){
  return currentLang;
}

export function setLang(lang){
  if(I18N[lang]) currentLang = lang;
}

export function texts(){
  return I18N[currentLang];
}

export { I18N };
