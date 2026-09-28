// Kiểm tra i18n: node scripts/check-i18n.mjs
// 1. vi.js và en.js có đúng cùng bộ key.
// 2. Mọi key dùng trong t('...') / t(`...`) ở src/ đều tồn tại.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { default: vi } = await import(path.join(root, 'src/locales/vi.js'))
const { default: en } = await import(path.join(root, 'src/locales/en.js'))

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )

const viKeys = new Set(flatten(vi))
const enKeys = new Set(flatten(en))
const errors = []

viKeys.forEach((key) => !enKeys.has(key) && errors.push(`Thiếu trong en.js: ${key}`))
enKeys.forEach((key) => !viKeys.has(key) && errors.push(`Thiếu trong vi.js: ${key}`))

const files = []
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(js|jsx)$/.test(entry.name) && !full.includes(`${path.sep}locales${path.sep}`)) files.push(full)
  })
walk(path.join(root, 'src'))

const usage = /\bt\(\s*(['`])([^'`]+)\1/g
const messageKey = /messageKey:\s*'([^']+)'/g

files.forEach((file) => {
  const source = fs.readFileSync(file, 'utf8')
  const rel = path.relative(root, file)
  const check = (key) => {
    if (key.includes('${')) {
      const pattern = new RegExp(
        `^${key.split(/\$\{[^}]+\}/).map((part) => part.replace(/[.*+?^()|[\]\\]/g, '\\$&')).join('[^.]+')}$`,
      )
      if (![...viKeys].some((k) => pattern.test(k))) errors.push(`${rel}: không có key khớp mẫu ${key}`)
    } else if (!viKeys.has(key)) {
      errors.push(`${rel}: key không tồn tại ${key}`)
    }
  }
  for (const match of source.matchAll(usage)) check(match[2])
  for (const match of source.matchAll(messageKey)) check(match[1])
})

if (errors.length > 0) {
  console.error(errors.join('\n'))
  console.error(`\n❌ ${errors.length} lỗi i18n`)
  process.exit(1)
}

console.log(`✅ i18n OK – ${viKeys.size} key, ${files.length} file`)
