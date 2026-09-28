/** BE đôi khi trả chuỗi "string" (giá trị mẫu của Swagger) thay vì URL thật. */
export const getValidImage = (url) => {
  if (!url || url === 'string') return ''
  return url
}
