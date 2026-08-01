'use client'

import { useState, useMemo } from 'react'
import { ChevronRight, ChevronDown, Braces, Sparkles, Eraser } from 'lucide-react'

const typeOf = (v) => {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  return typeof v
}

const Node = ({ k, value, depth, open, toggle, path }) => {
  const t = typeOf(value)
  const collapsible = t === 'object' || t === 'array'
  const isOpen = open[path] !== false // default open
  const label = k === undefined ? '' : <span className="text-fuchsia-500 dark:text-fuchsia-300">{JSON.stringify(k)}</span>

  if (!collapsible) {
    const colorMap = {
      string: 'text-emerald-600 dark:text-emerald-300',
      number: 'text-amber-600 dark:text-amber-300',
      boolean: 'text-blue-600 dark:text-blue-300',
      null: 'text-slate-500 dark:text-slate-400',
    }
    return (
      <div className="flex items-start gap-2" style={{ paddingLeft: depth * 16 }}>
        <span className="w-4" />
        {k !== undefined && <>{label}<span className="text-slate-400">:</span></>}
        <span className={colorMap[t] || ''}>{t === 'string' ? `"${value}"` : String(value)}</span>
      </div>
    )
  }

  const keys = t === 'array' ? value.map((_, i) => i) : Object.keys(value)
  const open_c = t === 'array' ? '[' : '{'
  const close_c = t === 'array' ? ']' : '}'

  return (
    <div>
      <div className="flex items-start gap-2 select-none" style={{ paddingLeft: depth * 16 }}>
        <button onClick={() => toggle(path)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {k !== undefined && <>{label}<span className="text-slate-400">:</span></>}
        <span className="text-slate-500 dark:text-slate-400">{open_c}</span>
        {!isOpen && <span className="text-slate-400 italic text-xs">{keys.length} {t === 'array' ? 'items' : 'keys'}</span>}
        {!isOpen && <span className="text-slate-500 dark:text-slate-400">{close_c}</span>}
      </div>
      {isOpen && (
        <>
          {keys.map((ck) => (
            <Node
              key={ck}
              k={ck}
              value={t === 'array' ? value[ck] : value[ck]}
              depth={depth + 1}
              open={open}
              toggle={toggle}
              path={`${path}.${ck}`}
            />
          ))}
          <div style={{ paddingLeft: depth * 16 }} className="pl-2 text-slate-500 dark:text-slate-400">{close_c}</div>
        </>
      )}
    </div>
  )
}

const JsonTree = () => {
  const [text, setText] = useState('')
  const [open, setOpen] = useState({})
  const toggle = (p) => setOpen((o) => ({ ...o, [p]: o[p] === false ? true : false }))

  const parsed = useMemo(() => {
    if (!text.trim()) return { ok: true, data: null }
    try { return { ok: true, data: JSON.parse(text) } }
    catch (e) { return { ok: false, err: e.message } }
  }, [text])

  const loadSample = () => setText(JSON.stringify({
    name: 'Ada Lovelace', age: 36, active: true, tags: ['math', 'logic', 'engines'],
    address: { city: 'London', country: 'UK', geo: { lat: 51.5, lng: -0.12 } },
    projects: [{ id: 1, title: 'Analytical Engine', open: true }, { id: 2, title: 'Notes G', open: false }],
    manager: null,
  }, null, 2))

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Viewers</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">JSON Tree Viewer</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Explore any JSON as a collapsible tree — perfect for large API responses.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadSample} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <Sparkles className="w-4 h-4" /> Sample
            </button>
            <button onClick={() => { setText(''); setOpen({}) }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <Eraser className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-100">JSON input</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste JSON here..."
            spellCheck={false}
            className="mono w-full flex-1 min-h-[380px] p-4 text-[15px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none resize-y"
          />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Braces className="w-4 h-4" /> Tree view
          </div>
          <div className="p-4 mono text-[15px] leading-relaxed bg-slate-50 dark:bg-slate-950 rounded-b-2xl overflow-auto min-h-[380px]">
            {!text.trim() && <div className="text-slate-400 dark:text-slate-600">The parsed JSON tree will appear here.</div>}
            {text.trim() && !parsed.ok && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 px-4 py-3">
                <div className="font-semibold">Invalid JSON</div>
                <div className="text-sm mt-1">{parsed.err}</div>
              </div>
            )}
            {text.trim() && parsed.ok && (
              <Node value={parsed.data} depth={0} open={open} toggle={toggle} path="$" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JsonTree
