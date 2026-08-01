'use client'

import { useMemo, useState } from 'react'
import { diffLines, diffWordsWithSpace } from 'diff'
import { Sparkles, ArrowLeftRight, Eraser } from 'lucide-react'

// Visualise trailing spaces / tabs so the user can *see* them
const visibleWs = (text) =>
  text
    .replace(/\t/g, '\u2192   ') // → arrow for tab
    .replace(/ (?=\n|$)/g, '\u00b7') // middle-dot for trailing space

const DiffChecker = () => {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [mode, setMode] = useState('line') // 'line' | 'word'
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [ignoreLeadTrail, setIgnoreLeadTrail] = useState(false)

  const stats = useMemo(() => {
    let l = left
    let r = right
    if (ignoreLeadTrail) {
      l = l.split('\n').map((s) => s.trim()).join('\n')
      r = r.split('\n').map((s) => s.trim()).join('\n')
    }
    if (ignoreCase) { l = l.toLowerCase(); r = r.toLowerCase() }

    if (mode === 'word') {
      const parts = diffWordsWithSpace(l, r)
      let added = 0, removed = 0
      parts.forEach((p) => { if (p.added) added += p.value.length; if (p.removed) removed += p.value.length })
      return { parts, added, removed, mode }
    }
    const parts = diffLines(l, r, { newlineIsToken: false })
    let added = 0, removed = 0
    parts.forEach((p) => {
      const lines = p.count || (p.value.match(/\n/g) || []).length
      if (p.added) added += lines
      if (p.removed) removed += lines
    })
    return { parts, added, removed, mode }
  }, [left, right, mode, ignoreCase, ignoreLeadTrail])

  const equal = left === right
  const loadSample = () => {
    setLeft(`function greet(name) {\n  return "Hello, " + name + "!"; \n}\nconst user = "Ada";\nconsole.log(greet(user));`)
    setRight(`function greet(name){\n  return \`Hello, \${name}!\`;\n}\nconst user = "Grace";\nconsole.log(greet(user));\n`)
  }
  const clearAll = () => { setLeft(''); setRight('') }
  const swap = () => { const a = left; setLeft(right); setRight(a) }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Utilities</div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">Diff Checker</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Compare two blocks of text and highlight every difference — including trailing spaces, tabs and blank lines.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={loadSample} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <Sparkles className="w-4 h-4" /> Sample
            </button>
            <button onClick={swap} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <ArrowLeftRight className="w-4 h-4" /> Swap
            </button>
            <button onClick={clearAll} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
              <Eraser className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            {['line', 'word'].map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${mode === m ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                {m === 'line' ? 'Line diff' : 'Word diff'}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} className="rounded" />
            Ignore case
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={ignoreLeadTrail} onChange={(e) => setIgnoreLeadTrail(e.target.checked)} className="rounded" />
            Ignore leading/trailing spaces
          </label>
          <div className="ml-auto text-sm">
            {equal ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Texts are identical</span>
            ) : (
              <span className="text-slate-600 dark:text-slate-300">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+{stats.added}</span>{' '}
                <span className="text-rose-600 dark:text-rose-400 font-semibold">-{stats.removed}</span>{' '}
                {mode === 'line' ? 'lines' : 'chars'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: 'Original (A)', val: left, set: setLeft, ph: 'Paste the original text...' },
          { label: 'Changed (B)', val: right, set: setRight, ph: 'Paste the modified text...' },
        ].map((x) => (
          <div key={x.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-100">{x.label}</div>
            <textarea
              value={x.val}
              onChange={(e) => x.set(e.target.value)}
              placeholder={x.ph}
              spellCheck={false}
              className="mono w-full flex-1 min-h-[220px] p-4 text-[15px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none resize-y"
            />
            <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
              {x.val.length} chars · {x.val ? x.val.split('\n').length : 0} lines
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-semibold text-slate-800 dark:text-slate-100">Differences</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500 mr-1"></span> added ·{' '}
            <span className="inline-block w-2 h-2 rounded-sm bg-rose-500 mx-1"></span> removed ·{' '}
            <span className="text-slate-500 dark:text-slate-400">·</span> trailing space · <span className="text-slate-500">→</span> tab
          </div>
        </div>
        <div className="p-4 mono text-[15px] leading-relaxed bg-slate-50 dark:bg-slate-950 rounded-b-2xl overflow-auto min-h-[220px]">
          {!left && !right && <div className="text-slate-400 dark:text-slate-600">Paste text into both boxes to see the differences here.</div>}
          {(left || right) && equal && <div className="text-emerald-600 dark:text-emerald-400">The two texts are identical.</div>}
          {(left || right) && !equal && (
            <pre className="whitespace-pre-wrap break-words">
              {stats.parts.map((p, i) => {
                const cls = p.added
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                  : p.removed
                  ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 line-through decoration-rose-500/50'
                  : 'text-slate-700 dark:text-slate-300'
                return (
                  <span key={i} className={`${cls} rounded-sm`}>
                    {visibleWs(p.value)}
                  </span>
                )
              })}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiffChecker
