// ✅ Leaflet sadece harita sayfalarında var. O yüzden "L" varsa icon üret.
let darkGreenIcon = null;

function getDarkGreenIcon() {
  if (darkGreenIcon) return darkGreenIcon;
  if (typeof L === "undefined") return null; // Hakkımda sayfasında L yok → hata verme

  darkGreenIcon = L.divIcon({
    className: "custom-pin",
    html: `
      <svg width="22" height="34" viewBox="0 0 34 52" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 0C8.7 0 2 6.7 2 15c0 11.2 15 37 15 37s15-25.8 15-37C32 6.7 25.3 0 17 0z"
              fill="#0b4f2a" stroke="#06361d" stroke-width="2"/>
        <circle cx="17" cy="15" r="6" fill="#103b26" opacity="0.25"/>
        <circle cx="17" cy="15" r="5" fill="#f2f2f2" opacity="0.9"/>
      </svg>
    `,
    iconSize: [22, 34],
    iconAnchor: [11, 34],
    popupAnchor: [0, -28]
  });

  return darkGreenIcon;
}

// --- Popup görsel yardımcıları ---
function slugifyTR(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    // Türkçe karakterleri sadeleştir (ç,ğ,ı,İ,ö,ş,ü vb.)
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // aksanları sil
    .replace(/[^a-z0-9\-\s]/g, "")                  // kalan özel karakterleri temizle
    .replace(/\s+/g, "-");                           // boşluk -> -
}

function getCityImageSrc(p) {
  // 1) Eğer points içine img:"ankara.jpg" gibi özel isim verdiysen onu kullan
  if (p.img) return `img/${p.img}`;

  // 2) Varsayılan: şehir adından dosya adı üret -> img/ankara.jpg
  const file = `${slugifyTR(p.city)}.jpg`;
  return `img/${file}`;
}

function buildCityPopupHtml(p) {
  const src = getCityImageSrc(p);
  return `
    <div class="city-popup">
      <div class="city-title">${p.city}</div>
      <div class="city-sub">${p.country}</div>
      <img class="city-img" src="${src}" alt="${p.city}">
    </div>
  `;
}


function buildLayers() {
  const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap katkıcıları'
  });

  // Uydu: Esri World Imagery
  const esriSat = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19, attribution: "Tiles &copy; Esri" }
  );

  return { osm, esriSat };
}

function createMapWithLayers(mapId, center, zoom) {
  const el = document.getElementById(mapId);
  if (!el) return null;

  const { osm, esriSat } = buildLayers();

  const map = L.map(mapId, {
    scrollWheelZoom: true,
    zoomControl: true,
    layers: [osm]
  }).setView(center, zoom);

  const baseMaps = {
    "Normal (OSM)": osm,
    "Uydu (Esri)": esriSat
  };
  L.control.layers(baseMaps, null, { position: "topright", collapsed: true }).addTo(map);

  return map;
}

function addMarkersAndAutoZoom(map, points) {
  if (!map || !points?.length) return null;

  const bounds = L.latLngBounds([]);

  points.forEach(p => {
    const icon = getDarkGreenIcon();
    const m = icon ? L.marker(p.coords, { icon }).addTo(map) : L.marker(p.coords).addTo(map);
    m.bindPopup(buildCityPopupHtml(p), { maxWidth: 260, closeButton: true });
    bounds.extend(p.coords);

    m.on("click", () => {
      map.flyTo(p.coords, Math.max(map.getZoom(), 7), { duration: 0.8 });
    });
  });

  map.flyToBounds(bounds.pad(0.25), { duration: 1.1 });
  return bounds;
}

/* Gezdiğim Yerler */
const mapGez = createMapWithLayers("mapGez", [39.0, 35.0], 5);

const places = [
  { country: "Türkiye", city: "Ankara", coords: [39.9208, 32.8541] },
  { country: "Türkiye", city: "Antalya", coords: [36.8969, 30.7133] },
  { country: "Türkiye", city: "Yozgat", coords: [39.8200, 34.8044] },
  { country: "Türkiye", city: "Konya", coords: [37.8746, 32.4932] },
  { country: "Türkiye", city: "Eskişehir", coords: [39.7767, 30.5206] },
  { country: "Türkiye", city: "Çanakkale", coords: [40.1553, 26.4142] },
  { country: "Türkiye", city: "Kayseri", coords: [38.7225, 35.4875] },
  { country: "Türkiye", city: "Nevşehir", coords: [38.6244, 34.7239] },
  { country: "Türkiye", city: "Bursa", coords: [40.1885, 29.0610] },
  { country: "Türkiye", city: "İzmir", coords: [38.4237, 27.1428] },
  { country: "Türkiye", city: "Tokat", coords: [40.3167, 36.5500] },
  { country: "Türkiye", city: "Amasya", coords: [40.6539, 35.8331] },

  { country: "Fransa", city: "Paris", coords: [48.8566, 2.3522] },
  { country: "Fransa", city: "Boulogne", coords: [50.7264, 1.6132] },

  { country: "Belçika", city: "Brüksel", coords: [50.8503, 4.3517] },

  { country: "Hollanda", city: "Amsterdam", coords: [52.3676, 4.9041] },
  { country: "Hollanda", city: "Enschede", coords: [52.2215, 6.8937] },
  { country: "Hollanda", city: "Hengelo", coords: [52.2660, 6.7930] },

  { country: "Almanya", city: "Duisburg", coords: [51.4344, 6.7623] },
  { country: "Almanya", city: "Köln", coords: [50.9375, 6.9603] }
];

if (mapGez) addMarkersAndAutoZoom(mapGez, places);

/* İletişim */
const mapIletisim = createMapWithLayers("mapIletisim", [39.9208, 32.8541], 12);

if (mapIletisim) {
  const coord = [39.9146, 32.7816]; // temsilî
  const icon = getDarkGreenIcon();
  const m = icon ? L.marker(coord, { icon }).addTo(mapIletisim) : L.marker(coord).addTo(mapIletisim);
  m.bindPopup("<b>Adres</b><br>Mustafa Kemal Mahallesi 2082. Cadde No:52  Çankaya / Ankara");
  mapIletisim.flyTo(coord, 14, { duration: 1.0 });
}
// Harf harf animasyon (Hakkımda başlığı)
document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("animatedName");
  if (!nameEl) return;

  const text = nameEl.textContent;
  nameEl.textContent = "";

  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.textContent = ch === " " ? "\u00A0" : ch;
    span.style.animationDelay = `${i * 0.07}s`;
    nameEl.appendChild(span);
  });
});