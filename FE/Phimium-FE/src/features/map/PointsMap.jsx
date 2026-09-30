import { useEffect, useRef, useState } from 'react'

import {
  MAP_ATTRIBUTION,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_FOCUS_ZOOM,
  MAP_TILE_URL,
} from '@/constants/map.js'
import { useLanguage } from '@/context/languageContext.js'
import { buildDirectionsUrl, getCoordinates } from '@/utils/geo.js'

import { loadLeaflet } from './loadLeaflet.js'

const STATUS = {
  loading: 'loading',
  ready: 'ready',
  error: 'error',
}

// Ghim hình giọt nước có số thứ tự, màu theo trạng thái đang chọn
const buildPinHtml = (label, isActive) => `
  <span class="map-pin ${isActive ? 'map-pin--active' : ''}">
    ${isActive ? '<span class="map-pin__pulse"></span>' : ''}
    <span class="map-pin__body"><span class="map-pin__label">${label}</span></span>
  </span>
`

// Nội dung popup dựng bằng DOM (textContent) để không chèn HTML từ dữ liệu API
const buildPopupContent = (point, directionsLabel) => {
  const wrapper = document.createElement('div')
  wrapper.className = 'map-popup'

  const title = document.createElement('p')
  title.className = 'map-popup__title'
  title.textContent = point.name
  wrapper.appendChild(title)

  if (point.address && point.address !== point.name) {
    const address = document.createElement('p')
    address.className = 'map-popup__address'
    address.textContent = point.address
    wrapper.appendChild(address)
  }

  const link = document.createElement('a')
  link.className = 'map-popup__link'
  link.href = buildDirectionsUrl(point)
  link.target = '_blank'
  link.rel = 'noreferrer'
  link.textContent = directionsLabel
  wrapper.appendChild(link)

  return wrapper
}

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/**
 * Bản đồ thật (Leaflet) hiển thị danh sách điểm có toạ độ.
 * points: [{ id, name, address, latitude, longitude }]
 * activeId: điểm đang chọn (bay tới + mở popup), onSelect(id): khi bấm ghim
 */
export function PointsMap({ points = [], activeId = null, onSelect, className = '' }) {
  const { t } = useLanguage()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const markersRef = useRef(new Map())
  const onSelectRef = useRef(onSelect)
  const [status, setStatus] = useState(STATUS.loading)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // Khởi tạo bản đồ 1 lần
  useEffect(() => {
    let cancelled = false
    let resizeObserver = null

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return

        const map = L.map(containerRef.current, {
          center: [MAP_DEFAULT_CENTER.lat, MAP_DEFAULT_CENTER.lng],
          zoom: MAP_DEFAULT_ZOOM,
          zoomControl: false,
          scrollWheelZoom: false,
        })

        L.control.zoom({ position: 'topright' }).addTo(map)
        L.tileLayer(MAP_TILE_URL, {
          attribution: MAP_ATTRIBUTION,
          maxZoom: 19,
        }).addTo(map)

        // Chỉ cho cuộn chuột để zoom sau khi người dùng bấm vào bản đồ (tránh kẹt khi cuộn trang)
        map.on('click', () => map.scrollWheelZoom.enable())
        map.on('mouseout', () => map.scrollWheelZoom.disable())

        layerRef.current = L.layerGroup().addTo(map)
        mapRef.current = map

        resizeObserver = new ResizeObserver(() => map.invalidateSize())
        resizeObserver.observe(containerRef.current)

        setStatus(STATUS.ready)
      })
      .catch(() => {
        if (!cancelled) setStatus(STATUS.error)
      })

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      mapRef.current?.remove()
      mapRef.current = null
      layerRef.current = null
      markersRef.current = new Map()
    }
  }, [reloadKey])

  // Vẽ lại ghim khi danh sách điểm đổi
  useEffect(() => {
    const L = window.L
    const map = mapRef.current
    const layer = layerRef.current

    if (status !== STATUS.ready || !L || !map || !layer) return

    layer.clearLayers()
    markersRef.current = new Map()

    const bounds = []

    points.forEach((point, index) => {
      const coordinates = getCoordinates(point)
      if (!coordinates) return

      const marker = L.marker([coordinates.lat, coordinates.lng], {
        icon: L.divIcon({
          className: 'map-pin-icon',
          html: buildPinHtml(index + 1, false),
          iconSize: [36, 44],
          iconAnchor: [18, 44],
          popupAnchor: [0, -40],
        }),
        title: point.name,
        keyboard: true,
      })

      marker.bindPopup(() => buildPopupContent(point, t('map.directions')), {
        closeButton: false,
        offset: [0, 0],
      })
      marker.on('click', () => onSelectRef.current?.(point.id))
      marker.addTo(layer)

      markersRef.current.set(point.id, { marker, index })
      bounds.push([coordinates.lat, coordinates.lng])
    })

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [56, 56], maxZoom: MAP_FOCUS_ZOOM })
    } else if (bounds.length === 1) {
      map.setView(bounds[0], MAP_FOCUS_ZOOM)
    }
  }, [points, status, t])

  // Đổi điểm đang chọn: đổi màu ghim, bay tới và mở popup
  useEffect(() => {
    const L = window.L
    const map = mapRef.current

    if (status !== STATUS.ready || !L || !map) return

    markersRef.current.forEach(({ marker, index }, id) => {
      const isActive = id === activeId

      marker.setIcon(
        L.divIcon({
          className: 'map-pin-icon',
          html: buildPinHtml(index + 1, isActive),
          iconSize: [36, 44],
          iconAnchor: [18, 44],
          popupAnchor: [0, -40],
        }),
      )
      marker.setZIndexOffset(isActive ? 1000 : 0)
    })

    const active = markersRef.current.get(activeId)
    if (!active) {
      map.closePopup()
      return
    }

    const target = active.marker.getLatLng()
    const zoom = Math.max(map.getZoom(), MAP_FOCUS_ZOOM - 1)

    if (prefersReducedMotion()) {
      map.setView(target, zoom)
    } else {
      map.flyTo(target, zoom, { duration: 0.8 })
    }

    active.marker.openPopup()
  }, [activeId, points, status])

  const hasAnyCoordinates = points.some((point) => getCoordinates(point))

  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        role="region"
        aria-label={t('map.label')}
        className="map-soft h-full w-full bg-slate-100"
      />

      {status === STATUS.loading && (
        <div className="skeleton absolute inset-0 z-[500] flex items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-blue-950 shadow">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
            {t('map.loading')}
          </span>
        </div>
      )}

      {status === STATUS.error && (
        <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
          <p className="text-sm font-semibold text-slate-600">{t('map.loadError')}</p>
          <button
            type="button"
            onClick={() => {
              setStatus(STATUS.loading)
              setReloadKey((current) => current + 1)
            }}
            className="rounded-full bg-blue-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-900"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {status === STATUS.ready && !hasAnyCoordinates && points.length > 0 && (
        <p className="absolute inset-x-4 top-4 z-[500] rounded-xl bg-white/95 px-4 py-2.5 text-center text-xs font-medium text-slate-600 shadow">
          {t('map.noCoordinates')}
        </p>
      )}
    </div>
  )
}
