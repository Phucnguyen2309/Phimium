import http from '@/services/http.js'

export const aiService = {
  /**
   * Gọi AI Smart Matchmaker để tìm tour và đội Buddy phù hợp
   * @param {Object} payload
   * @returns {Promise}
   */
  matchTours: (payload) => http.post('/ai/matches', payload),

  /**
   * Lấy danh mục matching tags và guiding styles
   * @returns {Promise}
   */
  getMatchingCatalog: () => http.get('/matching/tags'),
}

export default aiService
