// Độ rộng tối đa của nội dung. 'wide' dùng cho trang danh sách cần trải rộng trên màn hình lớn
const SIZE_CLASSES = {
  default: 'max-w-6xl px-4 sm:px-6 lg:px-8',
  wide: 'max-w-[1920px] px-4 sm:px-6 lg:px-10 2xl:px-16',
}

export function Container({ children, className = '', size = 'default' }) {
  return (
    <div className={`mx-auto w-full ${SIZE_CLASSES[size] ?? SIZE_CLASSES.default} ${className}`}>
      {children}
    </div>
  )
}
