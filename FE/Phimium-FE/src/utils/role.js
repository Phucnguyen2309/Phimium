/** "ROLE_admin" -> "ADMIN" */
export const normalizeRole = (role) =>
  String(role ?? '').replace('ROLE_', '').toUpperCase()
