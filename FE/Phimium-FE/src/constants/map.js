// Cấu hình bản đồ (Leaflet + tile OpenStreetMap)

// Leaflet nạp từ CDN (không cài npm), khoá phiên bản + SRI
export const LEAFLET_CDN = {
  script: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  scriptIntegrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=',
  style: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  styleIntegrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',
}

// Mặc định dùng tile miễn phí của OpenStreetMap (không cần key, hợp với lượng truy cập nhỏ).
// Khi lên production nhiều người dùng, đổi sang nhà cung cấp có key (MapTiler, Stadia...)
// qua .env: VITE_MAP_TILE_URL, VITE_MAP_ATTRIBUTION
export const MAP_TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

export const MAP_ATTRIBUTION =
  import.meta.env.VITE_MAP_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

// Trung tâm TP. Hồ Chí Minh (Nhà thờ Đức Bà) khi chưa có điểm nào có toạ độ
export const MAP_DEFAULT_CENTER = { lat: 10.7798, lng: 106.699 }
export const MAP_DEFAULT_ZOOM = 13
export const MAP_FOCUS_ZOOM = 16
