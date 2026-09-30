/**
 * Lấy toạ độ hợp lệ từ object có latitude / longitude (VD activity).
 * Trả về { lat, lng } hoặc null nếu thiếu, sai hoặc bằng 0 (giá trị mặc định của Backend).
 */
export const getCoordinates = (item) => {
  const lat = Number(item?.latitude)
  const lng = Number(item?.longitude)

  const isValid =
    item?.latitude != null &&
    item?.longitude != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat !== 0 &&
    lng !== 0 &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180

  return isValid ? { lat, lng } : null
}

export const hasValidCoordinates = (item) => Boolean(getCoordinates(item))

/** Link mở Google Maps: ưu tiên toạ độ, không có thì tìm theo tên + địa chỉ. */
export const buildGoogleMapsUrl = (item) => {
  const coordinates = getCoordinates(item)
  const query = coordinates
    ? `${coordinates.lat},${coordinates.lng}`
    : [item?.name ?? item?.locationName, item?.address].filter(Boolean).join(', ')

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** Link chỉ đường Google Maps tới điểm này. */
export const buildDirectionsUrl = (item) => {
  const coordinates = getCoordinates(item)

  if (!coordinates) return buildGoogleMapsUrl(item)

  return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`
}
