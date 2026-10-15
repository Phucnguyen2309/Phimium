import axios from 'axios'

// Dịch vụ bản đồ miễn phí dùng dữ liệu OpenStreetMap, không cần key.
// Không gửi cookie đăng nhập nên dùng axios riêng, không qua http.js.
// - Nominatim: tối đa ~1 request/giây, không dùng cho gợi ý khi đang gõ.
// - Photon: tìm gần đúng tốt hơn (tên địa danh viết khác chút vẫn ra), dùng làm dự phòng.
const nominatim = axios.create({ baseURL: 'https://nominatim.openstreetmap.org', timeout: 10000 })
const photon = axios.create({ baseURL: 'https://photon.komoot.io', timeout: 10000 })

// Khung quanh TP.HCM để ưu tiên kết quả trong thành phố (lon trái, lat trên, lon phải, lat dưới)
const HCMC_VIEWBOX = '106.35,11.20,107.05,10.35'
const HCMC_BBOX = '106.35,10.35,107.05,11.20'

const toPlace = (latitude, longitude, displayName) => {
  const lat = Number(latitude)
  const lng = Number(longitude)
  return Number.isFinite(lat) && Number.isFinite(lng) ? { latitude: lat, longitude: lng, displayName } : null
}

const geocodingService = {
  /** Nominatim: trả { latitude, longitude, displayName } hoặc null */
  searchNominatim: async (query) => {
    const response = await nominatim.get('/search', {
      params: {
        q: query,
        format: 'jsonv2',
        countrycodes: 'vn',
        limit: 1,
        viewbox: HCMC_VIEWBOX,
        'accept-language': 'vi',
      },
    })
    const place = Array.isArray(response?.data) ? response.data[0] : null
    return place ? toPlace(place.lat, place.lon, place.display_name ?? '') : null
  },

  /** Photon: trả { latitude, longitude, displayName } hoặc null */
  searchPhoton: async (query) => {
    const response = await photon.get('/api/', { params: { q: query, limit: 1, bbox: HCMC_BBOX } })
    const feature = response?.data?.features?.[0]
    const [longitude, latitude] = feature?.geometry?.coordinates ?? []
    const props = feature?.properties ?? {}
    const displayName = [props.name, props.street, props.district, props.city].filter(Boolean).join(', ')
    return feature ? toPlace(latitude, longitude, displayName) : null
  },
}

export default geocodingService
