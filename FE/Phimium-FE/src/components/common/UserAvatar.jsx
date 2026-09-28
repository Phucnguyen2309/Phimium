import { getValidImage } from '@/utils/image.js'
import { getInitials } from '@/utils/text.js'

/**
 * Avatar tròn: hiển thị chữ cái đầu, nếu có ảnh hợp lệ thì phủ ảnh lên.
 * Ảnh lỗi sẽ tự ẩn để lộ chữ cái đầu.
 */
export function UserAvatar({
  name,
  avatarUrl,
  className = 'h-10 w-10 text-sm',
  colorClassName = 'bg-emerald-100 text-emerald-700',
}) {
  const imageUrl = getValidImage(avatarUrl)

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-black ${colorClassName} ${className}`}
    >
      {getInitials(name)}

      {imageUrl && (
        <img
          src={imageUrl}
          alt={name || 'User'}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      )}
    </div>
  )
}
