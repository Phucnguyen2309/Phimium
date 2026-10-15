import { useCallback, useRef, useState } from 'react'

import geocodingService from '@/services/geocodingService.js'

export const GEOCODE_STATUS = {
  idle: 'idle',
  loading: 'loading',
  found: 'found',
  notFound: 'notFound',
  error: 'error',
}

const CITY = 'Hồ Chí Minh'
const ADMIN_PART = /^(phường|p\.|xã|quận|q\.|huyện|thị xã|tp\.?|thành phố|tỉnh)\s/i
const CITY_PART = /(hồ chí minh|hcm|sài gòn|saigon)/i

/**
 * "Số 07 Công Trường Lam Sơn, phường Bến Nghé, Quận 1, TP.HCM" -> "Công Trường Lam Sơn"
 * Bỏ số nhà và phường / quận: từ 7/2025 quận bị bỏ, phường đổi tên nên OSM không khớp tên cũ.
 */
const getStreet = (address) => {
  const parts = String(address ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && !ADMIN_PART.test(part) && !CITY_PART.test(part))

  return (parts[0] ?? '')
    .replace(/^(số|so)\s*/i, '')
    .replace(/^\d+[\w/-]*\s+/, '')
    .trim()
}

// Câu tìm từ dễ khớp nhất tới khó nhất, bỏ trùng
const buildQueries = (address, locationName) => {
  const name = locationName?.trim()
  const street = getStreet(address)

  return [
    name && street ? `${name}, ${street}, ${CITY}` : '',
    name ? `${name}, ${CITY}` : '',
    street ? `${street}, ${CITY}` : '',
    address?.trim(),
  ].filter((query, index, list) => query && list.indexOf(query) === index)
}

// Nominatim cho phép ~1 request/giây
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const makeKey = (address, locationName) => `${locationName ?? ''}|${address ?? ''}`.trim()

/** Thử Nominatim rồi Photon. Mọi request đều lỗi mạng -> ném lỗi để báo "không kết nối được" */
const findPlace = async (queries) => {
  let failures = 0
  let attempts = 0
  const tryOnce = async (search, query) => {
    attempts += 1
    try {
      return await search(query)
    } catch {
      failures += 1
      return null
    }
  }

  for (let index = 0; index < queries.length; index += 1) {
    if (index > 0) await wait(1100)
    const place = await tryOnce(geocodingService.searchNominatim, queries[index])
    if (place) return place
  }

  // Dự phòng: Photon tìm gần đúng tốt hơn với tên địa danh
  for (const query of queries.slice(0, 3)) {
    const place = await tryOnce(geocodingService.searchPhoton, query)
    if (place) return place
  }

  if (attempts > 0 && failures === attempts) throw new Error('geocode-unreachable')
  return null
}

/**
 * Lấy kinh độ / vĩ độ từ địa chỉ (OpenStreetMap).
 * onFound({ latitude, longitude, displayName }) được gọi khi tìm thấy.
 * Form sửa tour gọi resetLastQuery(địa chỉ cũ, tên địa điểm cũ) khi mở.
 */
export function useAddressGeocode({ onFound } = {}) {
  const [status, setStatus] = useState(GEOCODE_STATUS.idle)
  const [displayName, setDisplayName] = useState('')
  const lastQueryRef = useRef('')

  // Đặt lại "địa chỉ đã tìm": form sửa tour truyền địa chỉ cũ để rời ô mà không đổi thì không ghi đè toạ độ
  const resetLastQuery = useCallback((address = '', locationName = '') => {
    lastQueryRef.current = address || locationName ? makeKey(address, locationName) : 
    setStatus(GEOCODE_STATUS.idle)
    setDisplayName('')
  }, [])

  const geocode = useCallback(
    async (address, locationName, { force = false } = {}) => {
      const queries = buildQueries(address, locationName)
      // So sánh theo địa chỉ + tên địa điểm: không đổi thì không tìm lại
      const key = makeKey(address, locationName)
      if (queries.length === 0 || (!force && key === lastQueryRef.current)) return
      lastQueryRef.current = key

      setStatus(GEOCODE_STATUS.loading)
      setDisplayName('')

      try {
        const place = await findPlace(queries)

        if (!place) {
          setStatus(GEOCODE_STATUS.notFound)
          return
        }

        setStatus(GEOCODE_STATUS.found)
        setDisplayName(place.displayName)
        onFound?.({
          latitude: place.latitude.toFixed(6),
          longitude: place.longitude.toFixed(6),
          displayName: place.displayName,
        })
      } catch {
        setStatus(GEOCODE_STATUS.error)
      }
    },
    [onFound],
  )

  return { displayName, geocode, resetLastQuery, status }
}
