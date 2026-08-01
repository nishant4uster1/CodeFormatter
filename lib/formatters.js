// Core formatter/converter utilities used by the CodeFormatter UI
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import yaml from 'js-yaml'
import beautify from 'js-beautify'
import { format as sqlFormat } from 'sql-formatter'

// ---------- JSON ----------
export const formatJSON = (input, indent = 2) => {
  const obj = JSON.parse(input)
  return JSON.stringify(obj, null, indent)
}
export const minifyJSON = (input) => JSON.stringify(JSON.parse(input))

// ---------- XML ----------
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
const xmlBuilder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true, indentBy: '  ' })
const xmlBuilderMin = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: false })

export const formatXML = (input) => {
  const obj = xmlParser.parse(input)
  return xmlBuilder.build(obj)
}
export const minifyXML = (input) => {
  const obj = xmlParser.parse(input)
  return xmlBuilderMin.build(obj).replace(/\s+/g, ' ').trim()
}
export const xmlToJson = (input) => JSON.stringify(xmlParser.parse(input), null, 2)
export const jsonToXml = (input) => xmlBuilder.build(JSON.parse(input))

// ---------- YAML ----------
export const formatYAML = (input) => yaml.dump(yaml.load(input), { indent: 2 })
export const yamlToJson = (input) => JSON.stringify(yaml.load(input), null, 2)
export const jsonToYaml = (input) => yaml.dump(JSON.parse(input), { indent: 2 })

// ---------- HTML / CSS / JS ----------
export const formatHTML = (input) =>
  beautify.html(input, { indent_size: 2, wrap_line_length: 120, preserve_newlines: true })
export const minifyHTML = (input) =>
  input.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim()

export const formatCSS = (input) => beautify.css(input, { indent_size: 2 })
export const minifyCSS = (input) =>
  input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim()

export const formatJS = (input) =>
  beautify.js(input, { indent_size: 2, space_in_empty_paren: true })
export const minifyJS = (input) =>
  input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*([{}();,:=+\-*/<>])\s*/g, '$1')
    .trim()

// ---------- SQL ----------
export const formatSQL = (input) => sqlFormat(input, { language: 'sql', tabWidth: 2, keywordCase: 'upper' })

// ---------- CSV ↔ JSON ----------
export const csvToJson = (input) => {
  const lines = input.trim().split(/\r?\n/)
  if (!lines.length) return '[]'
  const parseLine = (line) => {
    const out = []
    let cur = '', inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ } else inQuotes = !inQuotes
      } else if (c === ',' && !inQuotes) { out.push(cur); cur = '' } else cur += c
    }
    out.push(cur)
    return out
  }
  const headers = parseLine(lines[0])
  const rows = lines.slice(1).map((l) => {
    const vals = parseLine(l)
    const obj = {}
    headers.forEach((h, i) => (obj[h] = vals[i] ?? ''))
    return obj
  })
  return JSON.stringify(rows, null, 2)
}
export const jsonToCsv = (input) => {
  const raw = JSON.parse(input)

  // Accept 3 input shapes:
  //   1. Array of objects           →  [{a:1},{a:2}]
  //   2. Single object              →  {a:1,b:2}           (one-row CSV)
  //   3. Wrapper object with an     →  {data:[{...}]}      (auto-detects
  //      inner array under a common     the first array-valued property)
  //      key like data / items / rows / results / records
  let data = raw
  if (data && !Array.isArray(data) && typeof data === 'object') {
    const arrayKey = Object.keys(data).find((k) => Array.isArray(data[k]))
    if (arrayKey) data = data[arrayKey]
    else data = [data]
  }
  if (!Array.isArray(data)) throw new Error('Input must be a JSON object, an array of objects, or an object wrapping an array.')
  if (data.length === 0) throw new Error('Input array is empty — nothing to convert.')

  // Flatten nested objects using dot-notation so   {a:{b:1}}   → column "a.b" with value 1.
  // Arrays and non-plain values are JSON-stringified inline so the CSV stays flat and lossless.
  const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
  const flatten = (obj, prefix = '', out = {}) => {
    for (const k of Object.keys(obj)) {
      const key = prefix ? `${prefix}.${k}` : k
      const v = obj[k]
      if (isPlainObject(v)) flatten(v, key, out)
      else if (Array.isArray(v)) out[key] = JSON.stringify(v)
      else out[key] = v
    }
    return out
  }

  const flatRows = data.map((row) => (isPlainObject(row) ? flatten(row) : { value: row }))

  // Collect headers in the order they first appear (deterministic, not alphabetical).
  const headers = []
  const seen = new Set()
  for (const r of flatRows) for (const k of Object.keys(r)) if (!seen.has(k)) { seen.add(k); headers.push(k) }

  const esc = (v) => {
    if (v === null || v === undefined) return ''
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = flatRows.map((r) => headers.map((h) => esc(r[h])).join(','))
  return [headers.join(','), ...rows].join('\n')
}

// ---------- Encoders ----------
export const base64Encode = (input) => {
  if (typeof window !== 'undefined') return btoa(unescape(encodeURIComponent(input)))
  return Buffer.from(input, 'utf-8').toString('base64')
}
export const base64Decode = (input) => {
  if (typeof window !== 'undefined') return decodeURIComponent(escape(atob(input)))
  return Buffer.from(input, 'base64').toString('utf-8')
}
export const urlEncode = (input) => encodeURIComponent(input)
export const urlDecode = (input) => decodeURIComponent(input)
export const htmlEntityEncode = (input) =>
  input.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
export const htmlEntityDecode = (input) =>
  input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

export const jwtDecode = (input) => {
  const parts = input.trim().split('.')
  if (parts.length < 2) throw new Error('Invalid JWT token')
  const decode = (str) => {
    const pad = str + '='.repeat((4 - (str.length % 4)) % 4)
    const b64 = pad.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(base64Decode(b64))
  }
  return JSON.stringify({ header: decode(parts[0]), payload: decode(parts[1]) }, null, 2)
}

// ---------- Text tools ----------
export const toUpper = (i) => i.toUpperCase()
export const toLower = (i) => i.toLowerCase()
export const toTitle = (i) => i.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
export const reverseText = (i) => i.split('').reverse().join('')
export const removeWhitespace = (i) => i.replace(/\s+/g, '')
export const wordCount = (i) => {
  const chars = i.length
  const charsNoSpace = i.replace(/\s/g, '').length
  const words = (i.trim().match(/\S+/g) || []).length
  const lines = i.split(/\r?\n/).length
  return `Characters: ${chars}\nCharacters (no spaces): ${charsNoSpace}\nWords: ${words}\nLines: ${lines}`
}

// ---------- Generators ----------
export const generateUUIDs = (count = 5) => {
  const arr = []
  for (let i = 0; i < count; i++) arr.push(crypto.randomUUID())
  return arr.join('\n')
}
export const timestampConvert = (input) => {
  const trimmed = input.trim()
  if (!trimmed) {
    const now = Date.now()
    return `Now:\n  Unix (ms): ${now}\n  Unix (s):  ${Math.floor(now / 1000)}\n  ISO:       ${new Date(now).toISOString()}`
  }
  const num = Number(trimmed)
  if (!isNaN(num)) {
    const ms = trimmed.length <= 10 ? num * 1000 : num
    const d = new Date(ms)
    return `ISO:   ${d.toISOString()}\nUTC:   ${d.toUTCString()}\nLocal: ${d.toString()}`
  }
  const d = new Date(trimmed)
  if (isNaN(d.getTime())) throw new Error('Invalid date/timestamp')
  return `Unix (ms): ${d.getTime()}\nUnix (s):  ${Math.floor(d.getTime() / 1000)}\nISO:       ${d.toISOString()}`
}

// ---------- Hash ----------
export const sha256 = async (input) => {
  const buf = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}
export const sha1 = async (input) => {
  const buf = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-1', buf)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}
